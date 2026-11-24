import React from 'react';
import { getElementTransform, type PlateSceneResult } from '../engine/generator';
import { INSTRUMENT_NAMES } from '../engine/palettes';
import type {
  BorderStyle,
  CornerMarkStyle,
  ElementTransform,
  GridOverlayStyle,
  PlateConfig,
  PlateElementBox,
} from '../engine/types';

interface CustomizeTabProps {
  config: PlateConfig;
  scene: PlateSceneResult;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onTransformElement: (element: PlateElementBox, patch: Partial<ElementTransform>) => void;
  onResetElement: (id: string) => void;
  onResetAllTransforms: () => void;
  onUpdateConfig: (updater: (prev: PlateConfig) => PlateConfig) => void;
  onResetCustomizations: () => void;
}

export const CustomizeTab: React.FC<CustomizeTabProps> = ({
  config,
  scene,
  selectedElementId,
  onSelectElement,
  onTransformElement,
  onResetElement,
  onResetAllTransforms,
  onUpdateConfig,
  onResetCustomizations,
}) => {
  const { instrumentStyle, frame, typography } = config;
  const selectedElement = scene.elements.find((e) => e.id === selectedElementId) ?? null;

  const getCurrentDxDy = (el: PlateElementBox): { dx: number; dy: number } => {
    if (el.id === 'primary') {
      return {
        dx: Math.round((config.instrumentStyle.offsetX / 100) * scene.stageW * 0.4),
        dy: Math.round((config.instrumentStyle.offsetY / 100) * scene.stageH * 0.4),
      };
    }
    if (el.kind === 'stamp' && el.stampId) {
      const st = config.stamps.find((s) => s.id === el.stampId);
      return {
        dx: st ? Math.round((st.x / 1000) * scene.width) : Math.round(el.cx),
        dy: st ? Math.round((st.y / 1000) * scene.height) : Math.round(el.cy),
      };
    }
    const t = getElementTransform(config, el.id);
    return { dx: Math.round(t.dx), dy: Math.round(t.dy) };
  };

  const activeDxDy = selectedElement ? getCurrentDxDy(selectedElement) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.12em] text-[#8d877f] uppercase">
          Full Aspect Overrides
        </span>
        <button
          type="button"
          onClick={onResetCustomizations}
          className="text-[10px] tracking-[0.1em] uppercase text-[#ff4d00] hover:underline cursor-pointer"
        >
          Reset Defaults
        </button>
      </div>

      {/* IN-VIEW ELEMENT TRANSFORM */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
            Element Transform ({scene.elements.length})
          </h2>
          <button
            type="button"
            onClick={onResetAllTransforms}
            className="text-[10px] tracking-[0.08em] uppercase text-[#8d877f] hover:text-[#ff4d00] cursor-pointer"
          >
            Reset All Moves
          </button>
        </div>

        <select
          aria-label="Select canvas element"
          value={selectedElementId ?? ''}
          onChange={(e) => onSelectElement(e.target.value || null)}
          className="w-full h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
        >
          <option value="">Click an element on canvas or pick here…</option>
          {scene.elements.map((el) => (
            <option key={el.id} value={el.id}>
              {el.label} ({el.kind.toUpperCase()})
            </option>
          ))}
        </select>

        {selectedElement && activeDxDy ? (
          <div className="space-y-2 pt-1 border-t border-[#1e1e1e]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium tracking-[0.08em] text-[#ff4d00] uppercase">
                {selectedElement.label}
              </span>
              <button
                type="button"
                onClick={() => onResetElement(selectedElement.id)}
                className="text-[10px] tracking-[0.08em] uppercase text-[#8d877f] hover:text-[#eae6dc] cursor-pointer"
              >
                Reset Element
              </button>
            </div>

            <div className="grid grid-cols-[76px_1fr_44px] items-center gap-2">
              <label htmlFor="el-dx" className="text-[10px] text-[#8d877f] uppercase">
                {selectedElement.kind === 'stamp' ? 'Pos X' : 'Shift X'}
              </label>
              <input
                id="el-dx"
                type="range"
                min={selectedElement.kind === 'stamp' ? 0 : -350}
                max={selectedElement.kind === 'stamp' ? scene.width : 350}
                step={2}
                value={activeDxDy.dx}
                onChange={(e) =>
                  onTransformElement(selectedElement, { dx: Number(e.target.value) })
                }
                className="studio-slider"
              />
              <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
                {activeDxDy.dx}
              </span>
            </div>

            <div className="grid grid-cols-[76px_1fr_44px] items-center gap-2">
              <label htmlFor="el-dy" className="text-[10px] text-[#8d877f] uppercase">
                {selectedElement.kind === 'stamp' ? 'Pos Y' : 'Shift Y'}
              </label>
              <input
                id="el-dy"
                type="range"
                min={selectedElement.kind === 'stamp' ? 0 : -350}
                max={selectedElement.kind === 'stamp' ? scene.height : 350}
                step={2}
                value={activeDxDy.dy}
                onChange={(e) =>
                  onTransformElement(selectedElement, { dy: Number(e.target.value) })
                }
                className="studio-slider"
              />
              <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
                {activeDxDy.dy}
              </span>
            </div>

            <div className="grid grid-cols-[76px_1fr_44px] items-center gap-2">
              <label htmlFor="el-scale" className="text-[10px] text-[#8d877f] uppercase">
                Scale
              </label>
              <input
                id="el-scale"
                type="range"
                min={0.25}
                max={3.5}
                step={0.05}
                value={selectedElement.scale}
                onChange={(e) =>
                  onTransformElement(selectedElement, { scale: Number(e.target.value) })
                }
                className="studio-slider"
              />
              <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
                {selectedElement.scale.toFixed(2)}×
              </span>
            </div>

            <div className="grid grid-cols-[76px_1fr_44px] items-center gap-2">
              <label htmlFor="el-rot" className="text-[10px] text-[#8d877f] uppercase">
                Rotate
              </label>
              <input
                id="el-rot"
                type="range"
                min={-180}
                max={180}
                step={1}
                value={selectedElement.rotation}
                onChange={(e) =>
                  onTransformElement(selectedElement, { rotation: Number(e.target.value) })
                }
                className="studio-slider"
              />
              <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
                {selectedElement.rotation}°
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-[#7b766e]">
            Drag any element directly on the canvas to reposition, use corner handles to resize, or drag the top knob to rotate.
          </p>
        )}
      </section>

      {/* INSTRUMENT GEOMETRY */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-3">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Instrument Geometry
        </h2>

        {[
          {
            id: 'inst-scale',
            label: 'Scale',
            min: 0.4,
            max: 2.0,
            step: 0.05,
            val: instrumentStyle.scale,
            fmt: `${instrumentStyle.scale.toFixed(2)}×`,
            onChange: (v: number) =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: { ...p.instrumentStyle, scale: v },
              })),
          },
          {
            id: 'inst-rot',
            label: 'Rotation',
            min: -180,
            max: 180,
            step: 5,
            val: instrumentStyle.rotation,
            fmt: `${instrumentStyle.rotation}°`,
            onChange: (v: number) =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: { ...p.instrumentStyle, rotation: v },
              })),
          },
          {
            id: 'inst-x',
            label: 'Offset X',
            min: -100,
            max: 100,
            step: 2,
            val: instrumentStyle.offsetX,
            fmt: `${instrumentStyle.offsetX}`,
            onChange: (v: number) =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: { ...p.instrumentStyle, offsetX: v },
              })),
          },
          {
            id: 'inst-y',
            label: 'Offset Y',
            min: -100,
            max: 100,
            step: 2,
            val: instrumentStyle.offsetY,
            fmt: `${instrumentStyle.offsetY}`,
            onChange: (v: number) =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: { ...p.instrumentStyle, offsetY: v },
              })),
          },
          {
            id: 'inst-sw',
            label: 'Stroke Width',
            min: 0.6,
            max: 4.5,
            step: 0.1,
            val: instrumentStyle.strokeWidth,
            fmt: `${instrumentStyle.strokeWidth.toFixed(1)}px`,
            onChange: (v: number) =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: { ...p.instrumentStyle, strokeWidth: v },
              })),
          },
        ].map((ctrl) => (
          <div key={ctrl.id} className="grid grid-cols-[90px_1fr_44px] items-center gap-2">
            <label htmlFor={ctrl.id} className="text-[10px] tracking-[0.08em] text-[#8d877f] uppercase">
              {ctrl.label}
            </label>
            <input
              id={ctrl.id}
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={ctrl.val}
              onChange={(e) => ctrl.onChange(Number(e.target.value))}
              className="studio-slider"
            />
            <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
              {ctrl.fmt}
            </span>
          </div>
        ))}

        <div className="grid grid-cols-[110px_1fr] items-center gap-2 pt-1">
          <label htmlFor="sec-inst-select" className="text-[10px] tracking-[0.08em] text-[#8d877f] uppercase">
            Target Node
          </label>
          <select
            id="sec-inst-select"
            value={instrumentStyle.secondaryInstrumentIndex ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: {
                  ...p.instrumentStyle,
                  secondaryInstrumentIndex: e.target.value === '' ? null : Number(e.target.value),
                },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
          >
            <option value="">DEFAULT (RETICLE)</option>
            {INSTRUMENT_NAMES.map((n, idx) => (
              <option key={n} value={idx}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            aria-pressed={instrumentStyle.showTelemetryNodes}
            onClick={() =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: {
                  ...p.instrumentStyle,
                  showTelemetryNodes: !p.instrumentStyle.showTelemetryNodes,
                },
              }))
            }
            className={`h-8 border text-[10px] tracking-[0.08em] uppercase cursor-pointer ${
              instrumentStyle.showTelemetryNodes
                ? 'border-[#ff4d00] text-[#ff4d00] bg-[#ff4d00]/10'
                : 'border-[#282828] text-[#8d877f]'
            }`}
          >
            Nodes: {instrumentStyle.showTelemetryNodes ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            aria-pressed={instrumentStyle.showConnectingVectors}
            onClick={() =>
              onUpdateConfig((p) => ({
                ...p,
                instrumentStyle: {
                  ...p.instrumentStyle,
                  showConnectingVectors: !p.instrumentStyle.showConnectingVectors,
                },
              }))
            }
            className={`h-8 border text-[10px] tracking-[0.08em] uppercase cursor-pointer ${
              instrumentStyle.showConnectingVectors
                ? 'border-[#ff4d00] text-[#ff4d00] bg-[#ff4d00]/10'
                : 'border-[#282828] text-[#8d877f]'
            }`}
          >
            Vector: {instrumentStyle.showConnectingVectors ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      {/* FRAME & GRID */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Frame, Grid & Marks
        </h2>

        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <label htmlFor="border-style" className="text-[10px] text-[#8d877f] uppercase">
            Border Style
          </label>
          <select
            id="border-style"
            value={frame.borderStyle}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                frame: { ...p.frame, borderStyle: e.target.value as BorderStyle },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
          >
            <option value="SINGLE">SINGLE</option>
            <option value="DOUBLE">DOUBLE</option>
            <option value="DASHED">DASHED</option>
            <option value="NONE">NONE</option>
          </select>
        </div>

        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <label htmlFor="corner-marks" className="text-[10px] text-[#8d877f] uppercase">
            Corner Marks
          </label>
          <select
            id="corner-marks"
            value={frame.cornerMarks}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                frame: { ...p.frame, cornerMarks: e.target.value as CornerMarkStyle },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
          >
            <option value="CROSSHAIR">CROSSHAIR (+)</option>
            <option value="BRACKET">BRACKET (⌜)</option>
            <option value="DOT">DOT (•)</option>
            <option value="CIRCLE">CIRCLE (○)</option>
            <option value="NONE">NONE</option>
          </select>
        </div>

        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <label htmlFor="grid-overlay" className="text-[10px] text-[#8d877f] uppercase">
            Grid Overlay
          </label>
          <select
            id="grid-overlay"
            value={frame.gridOverlay}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                frame: { ...p.frame, gridOverlay: e.target.value as GridOverlayStyle },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
          >
            <option value="NONE">NONE</option>
            <option value="DOTS">DOT MATRIX</option>
            <option value="CROSSES">MICRO CROSSES</option>
            <option value="LINES">HAIRLINE GRID</option>
            <option value="SUBDIVIDED">DENSE SUBDIVIDED</option>
          </select>
        </div>

        <div className="grid grid-cols-[90px_1fr_44px] items-center gap-2 pt-1">
          <label htmlFor="frame-padding" className="text-[10px] text-[#8d877f] uppercase">
            Margin
          </label>
          <input
            id="frame-padding"
            type="range"
            min={18}
            max={80}
            step={2}
            value={frame.padding}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                frame: { ...p.frame, padding: Number(e.target.value) },
              }))
            }
            className="studio-slider"
          />
          <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">{frame.padding}px</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {[
            { key: 'showHeader' as const, label: 'Header' },
            { key: 'showFooter' as const, label: 'Footer' },
            { key: 'showSwatch' as const, label: 'Swatch' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={frame[item.key]}
              onClick={() =>
                onUpdateConfig((p) => ({
                  ...p,
                  frame: { ...p.frame, [item.key]: !p.frame[item.key] },
                }))
              }
              className={`h-7 border text-[10px] tracking-[0.06em] uppercase cursor-pointer ${
                frame[item.key]
                  ? 'border-[#ff4d00] text-[#ff4d00] bg-[#ff4d00]/10'
                  : 'border-[#282828] text-[#8d877f]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* TYPOGRAPHY OVERRIDES (ALL PLATE TEXTS) */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Editable Plate Texts (Or Double-Click View)
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            aria-label="Plate number override"
            placeholder="N° (AUTO)"
            value={typography.customPlateNumber ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customPlateNumber: e.target.value },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
          <input
            type="text"
            aria-label="Figure label override"
            placeholder="FIG.XX (AUTO)"
            value={typography.customFigure ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customFigure: e.target.value },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
        </div>

        <input
          type="text"
          aria-label="Series header override"
          placeholder="SERIES HEADER (AUTO)"
          value={typography.customSeries ?? ''}
          onChange={(e) =>
            onUpdateConfig((p) => ({
              ...p,
              typography: { ...p.typography, customSeries: e.target.value },
            }))
          }
          className="w-full h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            aria-label="Wordmark override"
            placeholder="WORDMARK (AUTO)"
            value={typography.customWordmark ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customWordmark: e.target.value },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
          <input
            type="text"
            aria-label="Japanese label override"
            placeholder="JP LABEL (AUTO)"
            value={typography.customJpName ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customJpName: e.target.value },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
        </div>

        <input
          type="text"
          aria-label="Subtitle line override"
          placeholder="SUBTITLE LINE (AUTO)"
          value={typography.customSubtitle ?? ''}
          onChange={(e) =>
            onUpdateConfig((p) => ({
              ...p,
              typography: { ...p.typography, customSubtitle: e.target.value },
            }))
          }
          className="w-full h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            aria-label="Edition label override"
            placeholder="EDITION e.g. 01/100"
            value={typography.customEdition ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customEdition: e.target.value },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
          <input
            type="text"
            aria-label="Target label override"
            placeholder="REF/TARGET (AUTO)"
            value={typography.customRefTarget ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customRefTarget: e.target.value },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <input
            type="text"
            aria-label="Matrix label override"
            placeholder="M.XX"
            value={typography.customMatrixLabel ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customMatrixLabel: e.target.value },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
          <input
            type="text"
            aria-label="Beacon label override"
            placeholder="Y.XX"
            value={typography.customEyeLabel ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customEyeLabel: e.target.value },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
          <input
            type="text"
            aria-label="Coordinates override"
            placeholder="X.XX Y.YY"
            value={typography.customCoords ?? ''}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, customCoords: e.target.value },
              }))
            }
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
          />
        </div>

        <div className="grid grid-cols-[90px_1fr_44px] items-center gap-2 pt-1">
          <label htmlFor="wm-size" className="text-[10px] text-[#8d877f] uppercase">
            Title Size
          </label>
          <input
            id="wm-size"
            type="range"
            min={24}
            max={68}
            step={2}
            value={typography.wordmarkSize}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, wordmarkSize: Number(e.target.value) },
              }))
            }
            className="studio-slider"
          />
          <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
            {typography.wordmarkSize}px
          </span>
        </div>

        <div className="grid grid-cols-[90px_1fr_44px] items-center gap-2">
          <label htmlFor="wm-tracking" className="text-[10px] text-[#8d877f] uppercase">
            Tracking
          </label>
          <input
            id="wm-tracking"
            type="range"
            min={-1}
            max={12}
            step={0.5}
            value={typography.letterSpacing}
            onChange={(e) =>
              onUpdateConfig((p) => ({
                ...p,
                typography: { ...p.typography, letterSpacing: Number(e.target.value) },
              }))
            }
            className="studio-slider"
          />
          <span className="text-[10px] tabular-nums text-right text-[#eae6dc]">
            {typography.letterSpacing}px
          </span>
        </div>
      </section>
    </div>
  );
};

