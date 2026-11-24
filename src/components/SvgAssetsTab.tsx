import React, { useState } from 'react';
import { Copy, Plus, Trash2, Upload } from 'lucide-react';
import { BUILTIN_SVG_ASSETS } from '../engine/svgAssets';
import type {
  MicroSvgAsset,
  PlacedSvgStamp,
  PlateConfig,
  StampColorMode,
  SvgAssetCategory,
} from '../engine/types';

interface SvgAssetsTabProps {
  config: PlateConfig;
  customAssets: MicroSvgAsset[];
  selectedStampId: string | null;
  onSelectStamp: (id: string | null) => void;
  onAddStamp: (asset: MicroSvgAsset) => void;
  onUpdateStamp: (id: string, patch: Partial<PlacedSvgStamp>) => void;
  onDuplicateStamp: (id: string) => void;
  onRemoveStamp: (id: string) => void;
  onUploadCustomAsset: (payload: { name: string; jpName?: string; svgContent: string }) => Promise<void>;
  onDeleteCustomAsset: (id: string) => Promise<void>;
}

const CATEGORIES: SvgAssetCategory[] = [
  'RETICLES',
  'GEOMETRY',
  'TELEMETRY',
  'WAVES',
  'OPTICS',
  'MARKS',
  'CUSTOM',
];

export const SvgAssetsTab: React.FC<SvgAssetsTabProps> = ({
  config,
  customAssets,
  selectedStampId,
  onSelectStamp,
  onAddStamp,
  onUpdateStamp,
  onDuplicateStamp,
  onRemoveStamp,
  onUploadCustomAsset,
  onDeleteCustomAsset,
}) => {
  const [category, setCategory] = useState<'ALL' | SvgAssetCategory>('ALL');
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetSvg, setAssetSvg] = useState('');
  const [importError, setImportError] = useState('');

  const allAssets = [...customAssets, ...BUILTIN_SVG_ASSETS];
  const filtered = allAssets.filter((a) => {
    const catMatch = category === 'ALL' || a.category === category;
    const q = search.trim().toLowerCase();
    const textMatch = !q || a.name.toLowerCase().includes(q) || a.jpName.includes(q);
    return catMatch && textMatch;
  });

  const selectedStamp = config.stamps.find((s) => s.id === selectedStampId) ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setAssetSvg(text);
    if (!assetName.trim()) {
      setAssetName(file.name.replace(/\.svg$/i, ''));
    }
  };

  const handleCreateCustomAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    if (!assetName.trim() || !assetSvg.trim()) {
      setImportError('Provide both an asset name and SVG markup.');
      return;
    }
    try {
      await onUploadCustomAsset({ name: assetName.trim(), svgContent: assetSvg });
      setAssetName('');
      setAssetSvg('');
      setShowImport(false);
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Failed to save SVG asset.');
    }
  };

  return (
    <div className="space-y-4">
      {/* ACTIVE STAMPS / LAYERS */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
            Canvas SVG Layers ({config.stamps.length})
          </h2>
          {selectedStampId && (
            <button
              type="button"
              onClick={() => onSelectStamp(null)}
              className="text-[10px] tracking-[0.08em] uppercase text-[#8d877f] hover:text-[#eae6dc] cursor-pointer"
            >
              Done Dragging
            </button>
          )}
        </div>

        {config.stamps.length === 0 ? (
          <p className="text-[11px] text-[#7b766e]">
            Click any micro-graphic SVG asset below to stamp and customize it on the plate.
          </p>
        ) : (
          <div className="space-y-1.5">
            {config.stamps.map((stamp) => {
              const isSelected = stamp.id === selectedStampId;
              return (
                <div
                  key={stamp.id}
                  className={`flex items-center justify-between gap-2 px-2.5 py-1.5 border ${
                    isSelected
                      ? 'border-[#ff4d00] bg-[#161210]'
                      : 'border-[#242424] bg-[#131313]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectStamp(isSelected ? null : stamp.id)}
                    className="flex-1 min-w-0 text-left text-[11px] text-[#eae6dc] truncate cursor-pointer"
                  >
                    {stamp.name}{' '}
                    <span className="text-[10px] text-[#7b766e] tabular-nums">
                      ({stamp.x},{stamp.y})
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Duplicate ${stamp.name}`}
                    onClick={() => onDuplicateStamp(stamp.id)}
                    className="p-1 text-[#8d877f] hover:text-[#eae6dc] cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${stamp.name}`}
                    onClick={() => onRemoveStamp(stamp.id)}
                    className="p-1 text-[#8d877f] hover:text-[#ff4d00] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* SELECTED STAMP CONTROLS */}
        {selectedStamp && (
          <div className="pt-2.5 border-t border-[#222222] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="stamp-x" className="block text-[10px] text-[#8d877f] uppercase mb-1">
                  Pos X ({selectedStamp.x})
                </label>
                <input
                  id="stamp-x"
                  type="range"
                  min={0}
                  max={1000}
                  value={selectedStamp.x}
                  onChange={(e) => onUpdateStamp(selectedStamp.id, { x: Number(e.target.value) })}
                  className="studio-slider w-full"
                />
              </div>
              <div>
                <label htmlFor="stamp-y" className="block text-[10px] text-[#8d877f] uppercase mb-1">
                  Pos Y ({selectedStamp.y})
                </label>
                <input
                  id="stamp-y"
                  type="range"
                  min={0}
                  max={1000}
                  value={selectedStamp.y}
                  onChange={(e) => onUpdateStamp(selectedStamp.id, { y: Number(e.target.value) })}
                  className="studio-slider w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="stamp-scale" className="block text-[10px] text-[#8d877f] uppercase mb-1">
                  Scale ({selectedStamp.scale.toFixed(2)}×)
                </label>
                <input
                  id="stamp-scale"
                  type="range"
                  min={0.2}
                  max={4.0}
                  step={0.05}
                  value={selectedStamp.scale}
                  onChange={(e) => onUpdateStamp(selectedStamp.id, { scale: Number(e.target.value) })}
                  className="studio-slider w-full"
                />
              </div>
              <div>
                <label htmlFor="stamp-rot" className="block text-[10px] text-[#8d877f] uppercase mb-1">
                  Rotate ({selectedStamp.rotation}°)
                </label>
                <input
                  id="stamp-rot"
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={selectedStamp.rotation}
                  onChange={(e) =>
                    onUpdateStamp(selectedStamp.id, { rotation: Number(e.target.value) })
                  }
                  className="studio-slider w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="stamp-op" className="block text-[10px] text-[#8d877f] uppercase mb-1">
                  Opacity ({Math.round(selectedStamp.opacity * 100)}%)
                </label>
                <input
                  id="stamp-op"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={selectedStamp.opacity}
                  onChange={(e) =>
                    onUpdateStamp(selectedStamp.id, { opacity: Number(e.target.value) })
                  }
                  className="studio-slider w-full"
                />
              </div>
              <div>
                <label htmlFor="stamp-color-mode" className="block text-[10px] text-[#8d877f] uppercase mb-1">
                  Color Role
                </label>
                <select
                  id="stamp-color-mode"
                  value={selectedStamp.colorMode}
                  onChange={(e) =>
                    onUpdateStamp(selectedStamp.id, {
                      colorMode: e.target.value as StampColorMode,
                    })
                  }
                  className="w-full h-7 px-2 border border-[#282828] bg-[#131313] text-[10px] text-[#eae6dc]"
                >
                  <option value="ink">PLATE INK</option>
                  <option value="accent">ACCENT</option>
                  <option value="custom">CUSTOM HEX</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {selectedStamp.colorMode === 'custom' && (
                <input
                  aria-label="Stamp custom hex color"
                  type="color"
                  value={selectedStamp.customColor}
                  onChange={(e) =>
                    onUpdateStamp(selectedStamp.id, { customColor: e.target.value })
                  }
                  className="w-8 h-7 bg-transparent border border-[#333] cursor-pointer"
                />
              )}
              <button
                type="button"
                onClick={() =>
                  onUpdateStamp(selectedStamp.id, { flipX: !selectedStamp.flipX })
                }
                className={`flex-1 h-7 border text-[10px] uppercase cursor-pointer ${
                  selectedStamp.flipX
                    ? 'border-[#ff4d00] text-[#ff4d00]'
                    : 'border-[#282828] text-[#8d877f]'
                }`}
              >
                Flip X
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateStamp(selectedStamp.id, { flipY: !selectedStamp.flipY })
                }
                className={`flex-1 h-7 border text-[10px] uppercase cursor-pointer ${
                  selectedStamp.flipY
                    ? 'border-[#ff4d00] text-[#ff4d00]'
                    : 'border-[#282828] text-[#8d877f]'
                }`}
              >
                Flip Y
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SVG ASSET LIBRARY */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
            Micro-Graphic SVG Library ({filtered.length})
          </h2>
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="px-2 py-1 border border-[#333333] text-[10px] tracking-[0.08em] uppercase text-[#eae6dc] hover:border-[#ff4d00] hover:text-[#ff4d00] flex items-center gap-1 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            Add SVG
          </button>
        </div>

        {showImport && (
          <form onSubmit={handleCreateCustomAsset} className="p-2.5 border border-[#2c2c2c] bg-[#131313] space-y-2">
            <input
              type="text"
              placeholder="Asset Name"
              aria-label="Custom SVG asset name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full h-8 px-2 border border-[#2a2a2a] bg-[#0b0b0b] text-[11px] text-[#eae6dc]"
            />
            <label className="block text-[10px] text-[#8d877f]">
              Upload .SVG file or paste markup below:
              <input
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileChange}
                className="block w-full mt-1 text-[10px] text-[#9d978e]"
              />
            </label>
            <textarea
              rows={3}
              placeholder="<svg viewBox='0 0 100 100'>...</svg>"
              aria-label="Custom SVG markup"
              value={assetSvg}
              onChange={(e) => setAssetSvg(e.target.value)}
              className="w-full p-2 border border-[#2a2a2a] bg-[#0b0b0b] text-[10px] text-[#eae6dc]"
            />
            {importError && <p className="text-[10px] text-[#ff4d00]">{importError}</p>}
            <button
              type="submit"
              className="w-full h-8 bg-[#ff4d00] text-[#0b0b0b] text-[10px] font-semibold tracking-[0.12em] uppercase cursor-pointer"
            >
              Save Asset to Server
            </button>
          </form>
        )}

        <input
          type="search"
          aria-label="Search SVG assets"
          placeholder="Search reticles, waves, optics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc] placeholder:text-[#66615a]"
        />

        <div className="flex flex-wrap gap-1">
          {(['ALL', ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase border cursor-pointer ${
                category === cat
                  ? 'border-[#ff4d00] text-[#ff4d00] bg-[#ff4d00]/10'
                  : 'border-[#242424] text-[#8d877f] hover:text-[#eae6dc]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 max-h-[340px] overflow-y-auto pr-1">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="relative group border border-[#242424] bg-[#131313] hover:border-[#ff4d00] transition-colors flex flex-col"
            >
              <button
                type="button"
                onClick={() => onAddStamp(asset)}
                className="p-2 flex flex-col items-center gap-1.5 text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
              >
                <div className="w-12 h-12 text-[#eae6dc] group-hover:text-[#ff4d00] transition-colors flex items-center justify-center">
                  <svg
                    viewBox={asset.viewBox}
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: asset.innerSvg }}
                  />
                </div>
                <span className="text-[9px] leading-tight text-[#b4aea4] line-clamp-1 w-full">
                  {asset.name}
                </span>
                <span className="sr-only">Stamp {asset.name}</span>
              </button>
              <span className="pointer-events-none absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-[#ff4d00]">
                <Plus className="w-3 h-3" />
              </span>
              {asset.isCustom && (
                <button
                  type="button"
                  aria-label={`Delete custom asset ${asset.name}`}
                  onClick={() => onDeleteCustomAsset(asset.id)}
                  className="absolute top-1 left-1 p-0.5 text-[#7b766e] hover:text-[#ff4d00] cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
