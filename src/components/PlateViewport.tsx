import React, { useEffect, useRef, useState } from 'react';
import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { getElementTransform, type PlateSceneResult } from '../engine/generator';
import type { EditableTextField, PlateConfig, PlateElementBox } from '../engine/types';

interface PlateViewportProps {
  config: PlateConfig;
  scene: PlateSceneResult;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onTransformElement: (
    element: PlateElementBox,
    patch: { dx?: number; dy?: number; scale?: number; rotation?: number }
  ) => void;
  onCommitTextEdit: (field: EditableTextField, value: string) => void;
  onResetElement: (id: string) => void;
  onDeleteStamp: (stampId: string) => void;
}

type DragMode =
  | {
      type: 'move';
      startSvgX: number;
      startSvgY: number;
      origDx: number;
      origDy: number;
      active: boolean;
      element: PlateElementBox;
    }
  | {
      type: 'scale';
      startDist: number;
      origScale: number;
      element: PlateElementBox;
    }
  | {
      type: 'rotate';
      element: PlateElementBox;
    };

export const PlateViewport: React.FC<PlateViewportProps> = ({
  config,
  scene,
  selectedElementId,
  onSelectElement,
  onTransformElement,
  onCommitTextEdit,
  onResetElement,
  onDeleteStamp,
}) => {
  const [zoom, setZoom] = useState<'FIT' | '100' | '125'>('FIT');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const dragRef = useRef<DragMode | null>(null);
  const overlayRef = useRef<SVGSVGElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const editOpenedAtRef = useRef<number>(0);

  const selectedElement = scene.elements.find((el) => el.id === selectedElementId) ?? null;
  const editingElement = scene.elements.find((el) => el.id === editingTextId) ?? null;

  useEffect(() => {
    if (!editingTextId) return;
    const raf = requestAnimationFrame(() => {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    });
    return () => cancelAnimationFrame(raf);
  }, [editingTextId]);

  useEffect(() => {
    if (editingTextId && editingTextId !== selectedElementId) {
      setEditingTextId(null);
    }
  }, [selectedElementId, editingTextId]);

  const clientToSvgCoords = (clientX: number, clientY: number): { x: number; y: number } => {
    const svgEl = overlayRef.current;
    if (!svgEl) return { x: 0, y: 0 };
    const rect = svgEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * scene.width;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * scene.height;
    return { x, y };
  };

  const startInlineEdit = (el: PlateElementBox) => {
    if (el.kind !== 'text' || !el.textField) return;
    editOpenedAtRef.current = Date.now();
    onSelectElement(el.id);
    setDraftText(el.textValue ?? '');
    setEditingTextId(el.id);
  };

  const commitInlineEdit = (force = false) => {
    if (!force && Date.now() - editOpenedAtRef.current < 220) {
      requestAnimationFrame(() => textInputRef.current?.focus());
      return;
    }
    if (!editingElement || !editingElement.textField) {
      setEditingTextId(null);
      return;
    }
    onCommitTextEdit(editingElement.textField, draftText);
    setEditingTextId(null);
  };

  const beginMove = (e: React.PointerEvent, el: PlateElementBox) => {
    e.stopPropagation();
    onSelectElement(el.id);
    const pt = clientToSvgCoords(e.clientX, e.clientY);

    let origDx = 0;
    let origDy = 0;
    if (el.id === 'primary') {
      origDx = (config.instrumentStyle.offsetX / 100) * scene.stageW * 0.4;
      origDy = (config.instrumentStyle.offsetY / 100) * scene.stageH * 0.4;
    } else if (el.kind === 'stamp' && el.stampId) {
      const st = config.stamps.find((s) => s.id === el.stampId);
      origDx = st ? (st.x / 1000) * scene.width : el.cx;
      origDy = st ? (st.y / 1000) * scene.height : el.cy;
    } else {
      const t = getElementTransform(config, el.id);
      origDx = t.dx;
      origDy = t.dy;
    }

    dragRef.current = {
      type: 'move',
      startSvgX: pt.x,
      startSvgY: pt.y,
      origDx,
      origDy,
      active: false,
      element: el,
    };
  };

  const beginScale = (e: React.PointerEvent, el: PlateElementBox) => {
    e.stopPropagation();
    const pt = clientToSvgCoords(e.clientX, e.clientY);
    const dist = Math.max(12, Math.hypot(pt.x - el.cx, pt.y - el.cy));
    dragRef.current = {
      type: 'scale',
      startDist: dist,
      origScale: el.scale,
      element: el,
    };
    overlayRef.current?.setPointerCapture(e.pointerId);
  };

  const beginRotate = (e: React.PointerEvent, el: PlateElementBox) => {
    e.stopPropagation();
    dragRef.current = {
      type: 'rotate',
      element: el,
    };
    overlayRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pt = clientToSvgCoords(e.clientX, e.clientY);

    if (drag.type === 'move') {
      const deltaX = pt.x - drag.startSvgX;
      const deltaY = pt.y - drag.startSvgY;
      if (!drag.active) {
        if (Math.hypot(deltaX, deltaY) < 3) return;
        drag.active = true;
        try {
          overlayRef.current?.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
      onTransformElement(drag.element, {
        dx: Math.round(drag.origDx + deltaX),
        dy: Math.round(drag.origDy + deltaY),
      });
    } else if (drag.type === 'scale') {
      const dist = Math.max(8, Math.hypot(pt.x - drag.element.cx, pt.y - drag.element.cy));
      const ratio = dist / drag.startDist;
      const nextScale = Math.max(0.25, Math.min(4.0, Number((drag.origScale * ratio).toFixed(2))));
      onTransformElement(drag.element, { scale: nextScale });
    } else if (drag.type === 'rotate') {
      const rawDeg =
        (Math.atan2(pt.y - drag.element.cy, pt.x - drag.element.cx) * 180) / Math.PI + 90;
      let normalized = (((rawDeg + 180) % 360) + 360) % 360 - 180;
      if (e.shiftKey) {
        normalized = Math.round(normalized / 15) * 15;
      } else {
        normalized = Math.round(normalized);
      }
      onTransformElement(drag.element, { rotation: normalized });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const aspectClass =
    config.aspect === 'POSTER'
      ? 'aspect-[2/3] max-h-[660px]'
      : config.aspect === 'WIDE'
        ? 'aspect-[2/1] max-w-[740px]'
        : 'aspect-square max-h-[640px]';

  const zoomWidthClass =
    zoom === '125' ? 'w-[760px]' : zoom === '100' ? 'w-[620px]' : 'w-full max-w-[600px]';

  const titleEl = scene.elements.find((e) => e.id === 'text:wordmark');

  return (
    <main className="flex-1 bg-[#0b0b0b] flex flex-col items-center justify-center p-4 lg:p-8 overflow-auto min-w-0">
      <div className="w-full max-w-[780px] flex flex-col items-center">
        {/* Top stage micro-bar */}
        <div className="w-full max-w-[600px] flex items-center justify-between mb-3 text-[11px] text-[#8d877f] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {selectedElement ? (
              <>
                <span className="text-[#ff4d00] font-medium tracking-[0.1em] uppercase truncate">
                  {selectedElement.label}
                </span>
                <span className="text-[10px] tabular-nums text-[#7b766e] whitespace-nowrap">
                  {Math.round(selectedElement.scale * 100)}% · {selectedElement.rotation}°
                </span>
              </>
            ) : (
              <span className="tracking-[0.08em] uppercase truncate">
                Click any element to move/scale/rotate · Double-click text
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" role="group" aria-label="Canvas zoom">
            {(['FIT', '100', '125'] as const).map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                className={`px-2 py-0.5 border text-[10px] tracking-[0.1em] cursor-pointer transition-colors ${
                  zoom === z
                    ? 'border-[#ff4d00] text-[#ff4d00] bg-[#161210]'
                    : 'border-[#242424] text-[#8d877f] hover:text-[#eae6dc]'
                }`}
              >
                {z === 'FIT' ? 'FIT' : `${z}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Specimen Plate Container */}
        <div
          data-testid="plate-canvas"
          className={`relative border border-[#242424] bg-[#141414] p-3 lg:p-4 flex items-center justify-center shadow-[0_24px_64px_rgba(0,0,0,0.6)] ${zoomWidthClass} ${aspectClass}`}
        >
          <div className="relative w-full h-full">
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block select-none"
              dangerouslySetInnerHTML={{ __html: scene.svg }}
            />

            {/* Interactive Bounding Box Overlay */}
            <svg
              ref={overlayRef}
              data-testid="plate-overlay"
              viewBox={`0 0 ${scene.width} ${scene.height}`}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerDown={(e) => {
                if (e.target === overlayRef.current) {
                  onSelectElement(null);
                }
              }}
              className="absolute inset-0 w-full h-full touch-none select-none"
            >
              {scene.elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                const isHovered = el.id === hoveredId;
                const hw = Math.max(28, el.width + 12) / 2;
                const hh = Math.max(22, el.height + 10) / 2;

                return (
                  <g
                    key={el.id}
                    transform={`translate(${el.cx.toFixed(1)} ${el.cy.toFixed(1)}) rotate(${el.rotation})`}
                  >
                    <rect
                      x={-hw}
                      y={-hh}
                      width={hw * 2}
                      height={hh * 2}
                      fill="transparent"
                      stroke={isSelected ? '#ff4d00' : isHovered ? '#ff4d00' : 'transparent'}
                      strokeWidth={isSelected ? 1.8 : 1.1}
                      strokeOpacity={isSelected ? 1 : 0.5}
                      strokeDasharray={isSelected ? undefined : '4 3'}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${el.label}`}
                      className="cursor-move outline-none"
                      onPointerEnter={() => setHoveredId(el.id)}
                      onPointerLeave={() => setHoveredId((prev) => (prev === el.id ? null : prev))}
                      onPointerDown={(e) => beginMove(e, el)}
                      onMouseDown={(e) => {
                        if (e.detail >= 2 && el.kind === 'text') {
                          e.preventDefault();
                          e.stopPropagation();
                          dragRef.current = null;
                          startInlineEdit(el);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (el.kind === 'text') {
                          startInlineEdit(el);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectElement(el.id);
                        }
                      }}
                    />

                    {isSelected && (
                      <>
                        <line
                          x1={0}
                          y1={-hh}
                          x2={0}
                          y2={-hh - 24}
                          stroke="#ff4d00"
                          strokeWidth={1.4}
                        />
                        <circle
                          cx={0}
                          cy={-hh - 28}
                          r={6.5}
                          fill="#0b0b0b"
                          stroke="#ff4d00"
                          strokeWidth={2}
                          aria-label={`Rotate ${el.label}`}
                          className="cursor-grab active:cursor-grabbing"
                          onPointerDown={(e) => beginRotate(e, el)}
                        />

                        {(
                          [
                            [-hw, -hh, 'nwse-resize'],
                            [hw, -hh, 'nesw-resize'],
                            [hw, hh, 'nwse-resize'],
                            [-hw, hh, 'nesw-resize'],
                          ] as const
                        ).map(([hx, hy, cursor], idx) => (
                          <rect
                            key={idx}
                            x={hx - 5.5}
                            y={hy - 5.5}
                            width={11}
                            height={11}
                            fill="#0b0b0b"
                            stroke="#ff4d00"
                            strokeWidth={1.8}
                            style={{ cursor }}
                            aria-label={`Resize ${el.label}`}
                            onPointerDown={(e) => beginScale(e, el)}
                          />
                        ))}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {editingElement && editingElement.textField && (
              <div
                style={{
                  left: `${Math.max(4, Math.min(68, ((editingElement.cx - editingElement.width / 2) / scene.width) * 100))}%`,
                  top: `${Math.max(2, Math.min(86, ((editingElement.cy - editingElement.height / 2) / scene.height) * 100))}%`,
                  width: `${Math.max(24, (editingElement.width / scene.width) * 100)}%`,
                  minWidth: '170px',
                }}
                className="absolute z-30 bg-[#0b0b0b] border border-[#ff4d00] p-1 shadow-xl"
              >
                <input
                  ref={textInputRef}
                  type="text"
                  aria-label={`Edit ${editingElement.label}`}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onBlur={() => commitInlineEdit(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitInlineEdit(true);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditingTextId(null);
                    }
                  }}
                  className="w-full bg-[#141414] text-[#eae6dc] px-2 py-1 text-xs tracking-[0.08em] outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Selected Element Action Bar / Specimen Caption Row */}
        <div className="w-full max-w-[600px] flex flex-wrap items-center justify-between gap-2 mt-3 pt-1">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium tracking-[0.14em] text-[#eae6dc]">
              {titleEl?.textValue || 'PLATE'}
            </span>
            <span className="text-xs tracking-[0.12em] text-[#8d877f] tabular-nums">
              SEED {config.seed}
            </span>
          </div>

          {selectedElement ? (
            <div className="flex items-center gap-1.5">
              {selectedElement.kind === 'text' && selectedElement.textField && (
                <button
                  type="button"
                  onClick={() => startInlineEdit(selectedElement)}
                  className="px-2 py-1 border border-[#ff4d00] bg-[#ff4d00]/15 text-[10px] tracking-[0.08em] uppercase text-[#ff4d00] hover:bg-[#ff4d00] hover:text-[#0b0b0b] flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  Edit Text
                </button>
              )}
              <button
                type="button"
                onClick={() => onResetElement(selectedElement.id)}
                className="px-2 py-1 border border-[#2a2a2a] text-[10px] tracking-[0.08em] uppercase text-[#eae6dc] hover:border-[#ff4d00] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
              {selectedElement.kind === 'stamp' && selectedElement.stampId && (
                <button
                  type="button"
                  onClick={() => onDeleteStamp(selectedElement.stampId!)}
                  className="px-2 py-1 border border-[#2a2a2a] text-[10px] tracking-[0.08em] uppercase text-[#ff4d00] hover:bg-[#ff4d00] hover:text-[#0b0b0b] flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          ) : (
            <span className="text-[11px] tracking-[0.1em] text-[#7b766e] tabular-nums">
              L: LUCKY · M: MINT
            </span>
          )}
        </div>
      </div>
    </main>
  );
};
