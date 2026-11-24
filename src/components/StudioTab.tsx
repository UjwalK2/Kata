import React, { useState } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import {
  BUILTIN_PALETTES,
  INSTRUMENT_NAMES,
  LAYOUT_NAMES,
  PIECE_NAMES,
} from '../engine/palettes';
import { getActivePalette } from '../engine/generator';
import type { PaletteDef, PlateConfig, TraitLocks, WordmarkFont } from '../engine/types';

interface StudioTabProps {
  config: PlateConfig;
  savedPalettes: PaletteDef[];
  onCycleTrait: (trait: keyof TraitLocks) => void;
  onRerollTrait: (trait: keyof TraitLocks) => void;
  onToggleLock: (trait: keyof TraitLocks) => void;
  onUpdateConfig: (updater: (prev: PlateConfig) => PlateConfig) => void;
  onApplySeed: (seed: number) => void;
  onAddSavedPalette: (payload: { name: string; bg: string; ink: string; accent: string }) => Promise<void>;
  onDeleteSavedPalette: (id: string) => Promise<void>;
  onApplySavedPalette: (palette: PaletteDef) => void;
}

export const StudioTab: React.FC<StudioTabProps> = ({
  config,
  savedPalettes,
  onCycleTrait,
  onRerollTrait,
  onToggleLock,
  onUpdateConfig,
  onApplySeed,
  onAddSavedPalette,
  onDeleteSavedPalette,
  onApplySavedPalette,
}) => {
  const activePalette = getActivePalette(config);
  const [palBg, setPalBg] = useState(activePalette.bg);
  const [palInk, setPalInk] = useState(activePalette.ink);
  const [palAccent, setPalAccent] = useState('#ff4d00');
  const [palName, setPalName] = useState('');
  const [palError, setPalError] = useState('');
  const [seedInput, setSeedInput] = useState(String(config.seed));

  // Keep seedInput synced when seed changes externally
  React.useEffect(() => {
    setSeedInput(String(config.seed));
  }, [config.seed]);

  const layoutLabel =
    LAYOUT_NAMES[((config.layoutIndex % LAYOUT_NAMES.length) + LAYOUT_NAMES.length) % LAYOUT_NAMES.length];
  const instrumentLabel =
    INSTRUMENT_NAMES[((config.instrumentIndex % INSTRUMENT_NAMES.length) + INSTRUMENT_NAMES.length) % INSTRUMENT_NAMES.length];
  const nameLabel =
    PIECE_NAMES[((config.nameIndex % PIECE_NAMES.length) + PIECE_NAMES.length) % PIECE_NAMES.length];

  const traitRows: { key: keyof TraitLocks; label: string; value: string }[] = [
    { key: 'palette', label: 'PALETTE', value: activePalette.name },
    { key: 'layout', label: 'LAYOUT', value: layoutLabel },
    { key: 'instrument', label: 'INSTRUMENT', value: instrumentLabel },
    { key: 'name', label: 'NAME', value: nameLabel },
  ];

  const handleSavePalette = async (e: React.FormEvent) => {
    e.preventDefault();
    setPalError('');
    if (!palName.trim()) {
      setPalError('Enter a palette name.');
      return;
    }
    try {
      await onAddSavedPalette({
        name: palName.trim(),
        bg: palBg,
        ink: palInk,
        accent: palAccent,
      });
      setPalName('');
    } catch (err: unknown) {
      setPalError(err instanceof Error ? err.message : 'Failed to save palette.');
    }
  };

  const handleApplySeedClick = () => {
    const parsed = Number(seedInput.trim());
    if (Number.isFinite(parsed) && parsed > 0) {
      onApplySeed(Math.floor(parsed));
    }
  };

  return (
    <div className="space-y-4">
      {/* TRAITS */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase mb-3">
          Traits — Click value to cycle / Reroll / Lock
        </h2>
        <div className="space-y-2">
          {traitRows.map((row) => {
            const locked = config.locks[row.key];
            return (
              <div key={row.key} className="grid grid-cols-[84px_1fr_30px_54px] items-center gap-1.5">
                <span className="text-[10px] tracking-[0.12em] text-[#8d877f] uppercase">
                  {row.label}
                </span>
                <button
                  type="button"
                  onClick={() => onCycleTrait(row.key)}
                  title={`Cycle ${row.label.toLowerCase()}`}
                  className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-left text-[11px] tracking-[0.08em] text-[#eae6dc] hover:border-[#444444] truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
                >
                  {row.value}
                </button>
                <button
                  type="button"
                  aria-label={`Reroll ${row.label.toLowerCase()}`}
                  onClick={() => onRerollTrait(row.key)}
                  className="h-8 flex items-center justify-center border border-[#282828] bg-[#131313] text-[#9d978e] hover:text-[#eae6dc] hover:border-[#444444] cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleLock(row.key)}
                  aria-pressed={locked}
                  className={`h-8 text-[10px] font-medium tracking-[0.1em] uppercase border transition-colors cursor-pointer ${
                    locked
                      ? 'border-[#ff4d00] bg-[#ff4d00] text-[#0b0b0b]'
                      : 'border-[#ff4d00]/70 text-[#ff4d00] hover:bg-[#ff4d00]/15'
                  }`}
                >
                  {locked ? 'LOCKED' : 'LOCK'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPLEXITY */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
            Complexity
          </h2>
          <span className="text-xs font-medium tabular-nums text-[#eae6dc]">
            {config.complexity}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] tracking-[0.1em] text-[#7b766e]">CALM</span>
          <input
            aria-label="Complexity"
            type="range"
            min={1}
            max={12}
            value={config.complexity}
            onChange={(e) =>
              onUpdateConfig((prev) => ({ ...prev, complexity: Number(e.target.value) }))
            }
            className="studio-slider flex-1"
          />
          <span className="text-[10px] tracking-[0.1em] text-[#7b766e]">DENSE</span>
        </div>
        <p className="text-[10px] leading-relaxed tracking-[0.06em] text-[#7b766e] uppercase mt-2">
          Scales tick density, decoration and detail across the plate.
        </p>
      </section>

      {/* FINISH */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Finish
        </h2>

        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
          <label htmlFor="wordmark-font-select" className="text-[10px] tracking-[0.12em] text-[#8d877f] uppercase">
            Wordmark
          </label>
          <select
            id="wordmark-font-select"
            value={config.finish.wordmarkFont}
            onChange={(e) =>
              onUpdateConfig((prev) => ({
                ...prev,
                finish: { ...prev.finish, wordmarkFont: e.target.value as WordmarkFont },
              }))
            }
            className="h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] tracking-[0.08em] text-[#eae6dc] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          >
            <option value="MONO">MONO</option>
            <option value="CONDENSED">CONDENSED</option>
            <option value="GROTESK">GROTESK</option>
          </select>
        </div>

        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
          <span className="text-[10px] tracking-[0.12em] text-[#8d877f] uppercase">
            Riso Print
          </span>
          <button
            type="button"
            aria-pressed={config.finish.risoPrint}
            onClick={() =>
              onUpdateConfig((prev) => ({
                ...prev,
                finish: { ...prev.finish, risoPrint: !prev.finish.risoPrint },
              }))
            }
            className={`h-8 border text-[11px] tracking-[0.1em] uppercase transition-colors cursor-pointer ${
              config.finish.risoPrint
                ? 'border-[#ff4d00] bg-[#ff4d00]/15 text-[#ff4d00]'
                : 'border-[#282828] bg-[#131313] text-[#9d978e] hover:text-[#eae6dc]'
            }`}
          >
            {config.finish.risoPrint ? 'ON' : 'OFF'}
          </button>
        </div>

        {config.finish.risoPrint && (
          <div className="pt-1 pl-2 border-l border-[#2a2a2a] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="riso-offset" className="text-[10px] text-[#8d877f] uppercase">
                Misregister
              </label>
              <input
                id="riso-offset"
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={config.finish.risoOffset}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    finish: { ...prev.finish, risoOffset: Number(e.target.value) },
                  }))
                }
                className="studio-slider w-28"
              />
              <span className="text-[10px] tabular-nums text-[#eae6dc] w-8 text-right">
                {config.finish.risoOffset}px
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="riso-grain" className="text-[10px] text-[#8d877f] uppercase">
                Ink Grain
              </label>
              <input
                id="riso-grain"
                type="range"
                min={0.05}
                max={0.8}
                step={0.05}
                value={config.finish.risoGrain}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    finish: { ...prev.finish, risoGrain: Number(e.target.value) },
                  }))
                }
                className="studio-slider w-28"
              />
              <span className="text-[10px] tabular-nums text-[#eae6dc] w-8 text-right">
                {Math.round(config.finish.risoGrain * 100)}%
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
          <span className="text-[10px] tracking-[0.12em] text-[#8d877f] uppercase">
            Japanese Text
          </span>
          <button
            type="button"
            aria-pressed={config.finish.japaneseText}
            onClick={() =>
              onUpdateConfig((prev) => ({
                ...prev,
                finish: { ...prev.finish, japaneseText: !prev.finish.japaneseText },
              }))
            }
            className={`h-8 border text-[11px] tracking-[0.1em] uppercase transition-colors cursor-pointer ${
              config.finish.japaneseText
                ? 'border-[#ff4d00] bg-[#ff4d00]/15 text-[#ff4d00]'
                : 'border-[#282828] bg-[#131313] text-[#9d978e] hover:text-[#eae6dc]'
            }`}
          >
            {config.finish.japaneseText ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      {/* PALETTE EDITOR */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-3">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Palette Editor
        </h2>

        <form onSubmit={handleSavePalette} className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'BG', val: palBg, set: setPalBg },
              { label: 'INK', val: palInk, set: setPalInk },
              { label: 'ACCENT', val: palAccent, set: setPalAccent },
            ].map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] tracking-[0.1em] text-[#8d877f]">{c.label}</span>
                <label className="relative w-10 h-10 rounded-full border border-[#333333] overflow-hidden cursor-pointer">
                  <input
                    aria-label={`${c.label} color`}
                    type="color"
                    value={c.val}
                    onChange={(e) => {
                      const next = e.target.value;
                      c.set(next);
                      onUpdateConfig((prev) => ({
                        ...prev,
                        customPalette: {
                          id: 'live-custom',
                          name: palName.trim().toUpperCase() || 'CUSTOM',
                          bg: c.label === 'BG' ? next : palBg,
                          ink: c.label === 'INK' ? next : palInk,
                          accent: c.label === 'ACCENT' ? next : palAccent,
                          isCustom: true,
                        },
                      }));
                    }}
                    className="absolute -inset-2 w-14 h-14 cursor-pointer"
                  />
                </label>
                <span className="text-[10px] tabular-nums text-[#8d877f] uppercase">{c.val}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="PALETTE NAME"
              aria-label="Palette name"
              value={palName}
              onChange={(e) => setPalName(e.target.value)}
              className="flex-1 min-w-0 h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] tracking-[0.08em] text-[#eae6dc] placeholder:text-[#66615a] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
            />
            <button
              type="submit"
              className="h-8 px-3 border border-[#eae6dc] text-[11px] font-medium tracking-[0.1em] uppercase text-[#eae6dc] hover:bg-[#eae6dc] hover:text-[#0b0b0b] transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>
          {palError && <p className="text-[10px] text-[#ff4d00]">{palError}</p>}
        </form>

        {/* Builtin quick swatches + Server-saved custom palettes */}
        <div className="pt-1 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {BUILTIN_PALETTES.slice(0, 7).map((p, idx) => (
              <button
                key={p.id}
                type="button"
                title={p.name}
                aria-label={`Apply palette ${p.name}`}
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    customPalette: null,
                    paletteIndex: idx,
                  }))
                }
                className="w-6 h-6 border border-[#2f2f2f] flex overflow-hidden cursor-pointer hover:border-[#ff4d00]"
              >
                <span className="w-1/3 h-full" style={{ backgroundColor: p.bg }} />
                <span className="w-1/3 h-full" style={{ backgroundColor: p.ink }} />
                <span className="w-1/3 h-full" style={{ backgroundColor: p.accent }} />
              </button>
            ))}
          </div>

          {savedPalettes.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-[#1d1d1d]">
              <p className="text-[10px] tracking-[0.08em] text-[#7b766e] uppercase">
                Saved Palettes (Server JSON)
              </p>
              <div className="space-y-1">
                {savedPalettes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 px-2 py-1 border border-[#222222] bg-[#131313]"
                  >
                    <button
                      type="button"
                      onClick={() => onApplySavedPalette(p)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <span className="flex w-6 h-3.5 border border-[#333] shrink-0">
                        <span className="w-1/3 h-full" style={{ backgroundColor: p.bg }} />
                        <span className="w-1/3 h-full" style={{ backgroundColor: p.ink }} />
                        <span className="w-1/3 h-full" style={{ backgroundColor: p.accent }} />
                      </span>
                      <span className="text-[10px] text-[#eae6dc] truncate">{p.name}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete palette ${p.name}`}
                      onClick={() => onDeleteSavedPalette(p.id)}
                      className="text-[#7b766e] hover:text-[#ff4d00] p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WORDMARK + SEED */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Wordmark + Seed
        </h2>
        <input
          type="text"
          aria-label="Custom wordmark"
          placeholder="CUSTOM WORDMARK (OPTIONAL)"
          value={config.typography.customWordmark}
          onChange={(e) =>
            onUpdateConfig((prev) => ({
              ...prev,
              typography: { ...prev.typography, customWordmark: e.target.value },
            }))
          }
          className="w-full h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] tracking-[0.08em] text-[#eae6dc] placeholder:text-[#66615a] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
        />
        <div className="flex gap-1.5">
          <input
            type="text"
            aria-label="Seed number"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            className="flex-1 min-w-0 h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] tabular-nums text-[#eae6dc] focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
          />
          <button
            type="button"
            onClick={handleApplySeedClick}
            className="h-8 px-3 border border-[#eae6dc] text-[11px] font-medium tracking-[0.1em] uppercase text-[#eae6dc] hover:bg-[#eae6dc] hover:text-[#0b0b0b] transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      </section>
    </div>
  );
};
