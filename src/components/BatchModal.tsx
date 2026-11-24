import React from 'react';
import { X, Download, Archive } from 'lucide-react';
import { getPlateMetadata, renderPlateSvgString } from '../engine/generator';
import type { MicroSvgAsset, PlateConfig } from '../engine/types';

interface BatchModalProps {
  isOpen: boolean;
  items: PlateConfig[];
  customAssets: MicroSvgAsset[];
  onClose: () => void;
  onSelectPiece: (config: PlateConfig) => void;
  onDownloadZip: () => void;
  onDownloadSheet: () => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  items,
  customAssets,
  onClose,
  onSelectPiece,
  onDownloadZip,
  onDownloadSheet,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Batch contact sheet"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 lg:p-8"
    >
      <div className="w-full max-w-6xl max-h-[90vh] bg-[#0e0e0e] border border-[#2a2a2a] flex flex-col">
        <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-[#eae6dc]">
              Batch Contact Sheet — {items.length} Plates
            </h2>
            <p className="text-[11px] text-[#8d877f] mt-0.5">
              Click any plate to load it into the studio editor.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDownloadZip}
              className="px-3 py-1.5 border border-[#333333] text-xs tracking-[0.1em] uppercase text-[#eae6dc] hover:border-[#ff4d00] hover:text-[#ff4d00] flex items-center gap-1.5 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              ZIP
            </button>
            <button
              type="button"
              onClick={onDownloadSheet}
              className="px-3 py-1.5 bg-[#ff4d00] text-[#0b0b0b] text-xs font-medium tracking-[0.1em] uppercase hover:bg-[#ff6624] flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Sheet SVG
            </button>
            <button
              type="button"
              aria-label="Close batch contact sheet"
              onClick={onClose}
              className="p-2 border border-[#2a2a2a] text-[#9d978e] hover:text-[#eae6dc] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((cfg, idx) => {
            const meta = getPlateMetadata(cfg);
            const svg = renderPlateSvgString(cfg, customAssets, {
              width: 500,
              height: 500,
              idPrefix: `batch-${idx}-${cfg.seed}`,
            });
            return (
              <button
                key={`${cfg.seed}-${idx}`}
                type="button"
                onClick={() => {
                  onSelectPiece(cfg);
                  onClose();
                }}
                className="group border border-[#242424] bg-[#131313] p-2.5 text-left hover:border-[#ff4d00] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
              >
                <div
                  className="w-full aspect-square bg-[#101010] border border-[#1f1f1f] [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#eae6dc] group-hover:text-[#ff4d00] truncate">
                    {meta.shortTitle}
                  </span>
                  <span className="text-[#7b766e] tabular-nums">{cfg.seed}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
