import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { BatchModal } from './components/BatchModal';
import { CollectionSidebar } from './components/CollectionSidebar';
import { HeaderBar, type InspectorTab } from './components/HeaderBar';
import { InspectorPanel } from './components/InspectorPanel';
import { PlateViewport } from './components/PlateViewport';
import {
  computePlateScene,
  createDefaultConfig,
  createDefaultStamp,
  decodeHashToState,
  DEFAULT_TRANSFORM,
  deriveTraitsFromSeed,
  encodeStateToHash,
  getPlateMetadata,
  randomSeed,
  renderContactSheetSvg,
  renderPlateSvgString,
} from './engine/generator';
import {
  BUILTIN_PALETTES,
  INSTRUMENT_NAMES,
  LAYOUT_NAMES,
  PIECE_NAMES,
} from './engine/palettes';
import type {
  CollectionItem,
  EditableTextField,
  ElementTransform,
  MicroSvgAsset,
  PaletteDef,
  PlacedSvgStamp,
  PlateConfig,
  PlateElementBox,
  RecentRoll,
  TraitLocks,
} from './engine/types';
import { api } from './utils/api';
import {
  copyTextToClipboard,
  downloadBatchZipFile,
  downloadCurrentPlatePng,
  downloadCurrentPlateSvg,
  downloadSvgFile,
} from './utils/exportUtils';

function normalizeLoadedConfig(raw: PlateConfig): PlateConfig {
  const def = createDefaultConfig(raw.seed);
  return {
    ...def,
    ...raw,
    typography: { ...def.typography, ...raw.typography },
    frame: { ...def.frame, ...raw.frame },
    finish: { ...def.finish, ...raw.finish },
    instrumentStyle: { ...def.instrumentStyle, ...raw.instrumentStyle },
    elementTransforms: raw.elementTransforms ?? {},
    stamps: raw.stamps ?? [],
  };
}

export default function App() {
  const [config, setConfig] = useState<PlateConfig>(() => {
    if (typeof window !== 'undefined' && window.location.hash.length > 1) {
      return decodeHashToState(window.location.hash);
    }
    return createDefaultConfig(353316362);
  });

  const [activeTab, setActiveTab] = useState<InspectorTab>('studio');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Server-backed JSON state
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [recent, setRecent] = useState<RecentRoll[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<PaletteDef[]>([]);
  const [customAssets, setCustomAssets] = useState<MicroSvgAsset[]>([]);
  const [serverExports, setServerExports] = useState<string[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Batch & mobile archive drawer
  const [batchItems, setBatchItems] = useState<PlateConfig[]>([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [mobileArchiveOpen, setMobileArchiveOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2200);
  }, []);

  // Load initial state from server JSON database
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        const [col, rec, pals, assets, exportsList] = await Promise.all([
          api.listCollection(),
          api.listRecent(),
          api.listPalettes(),
          api.listAssets(),
          api.listServerExports(),
        ]);
        if (cancelled) return;
        setCollection(col);
        setRecent(rec);
        setSavedPalettes(pals);
        setCustomAssets(assets);
        setServerExports(exportsList);
      } catch {
        // Non-fatal if server unavailable during static test
      } finally {
        if (!cancelled) setLoadingDb(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync URL hash cleanly
  useEffect(() => {
    const hash = encodeStateToHash(config);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [config]);

  const scene = useMemo(
    () => computePlateScene(config, customAssets),
    [config, customAssets]
  );

  const recordRecent = useCallback((nextConfig: PlateConfig) => {
    const meta = getPlateMetadata(nextConfig);
    api
      .pushRecent({
        title: meta.shortTitle,
        seed: nextConfig.seed,
        config: nextConfig,
      })
      .then((items) => setRecent(items))
      .catch(() => {});
  }, []);

  const handleFeelingLucky = useCallback(() => {
    const nextSeed = randomSeed();
    setConfig((prev) => {
      const next = deriveTraitsFromSeed(nextSeed, prev);
      recordRecent(next);
      return next;
    });
  }, [recordRecent]);

  const handleMint = useCallback(async () => {
    const meta = getPlateMetadata(config);
    const previewSvg = renderPlateSvgString(config, customAssets, {
      width: 400,
      height: 400,
      idPrefix: `col-${Date.now()}`,
    });
    try {
      const item = await api.mintToCollection({
        title: meta.shortTitle,
        seed: config.seed,
        config,
        previewSvg,
      });
      setCollection((prev) => [item, ...prev]);
      showToast(`Minted ${item.title} · Edition #${String(item.editionNumber).padStart(3, '0')}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to mint');
    }
  }, [config, customAssets, showToast]);

  const handleTransformElement = useCallback(
    (element: PlateElementBox, patch: Partial<ElementTransform>) => {
      setConfig((prev) => {
        if (element.id === 'primary') {
          const nextOffsetX =
            patch.dx !== undefined
              ? Math.max(-160, Math.min(160, Number(((patch.dx / (scene.stageW * 0.4)) * 100).toFixed(1))))
              : prev.instrumentStyle.offsetX;
          const nextOffsetY =
            patch.dy !== undefined
              ? Math.max(-160, Math.min(160, Number(((patch.dy / (scene.stageH * 0.4)) * 100).toFixed(1))))
              : prev.instrumentStyle.offsetY;
          return {
            ...prev,
            instrumentStyle: {
              ...prev.instrumentStyle,
              offsetX: nextOffsetX,
              offsetY: nextOffsetY,
              scale: patch.scale !== undefined ? patch.scale : prev.instrumentStyle.scale,
              rotation: patch.rotation !== undefined ? patch.rotation : prev.instrumentStyle.rotation,
            },
          };
        }

        if (element.kind === 'stamp' && element.stampId) {
          return {
            ...prev,
            stamps: prev.stamps.map((s) => {
              if (s.id !== element.stampId) return s;
              return {
                ...s,
                x:
                  patch.dx !== undefined
                    ? Math.max(0, Math.min(1000, Math.round((patch.dx / scene.width) * 1000)))
                    : s.x,
                y:
                  patch.dy !== undefined
                    ? Math.max(0, Math.min(1000, Math.round((patch.dy / scene.height) * 1000)))
                    : s.y,
                scale: patch.scale !== undefined ? patch.scale : s.scale,
                rotation: patch.rotation !== undefined ? patch.rotation : s.rotation,
              };
            }),
          };
        }

        const existing = prev.elementTransforms?.[element.id] ?? DEFAULT_TRANSFORM;
        return {
          ...prev,
          elementTransforms: {
            ...(prev.elementTransforms ?? {}),
            [element.id]: {
              ...existing,
              ...patch,
            },
          },
        };
      });
    },
    [scene.width, scene.height, scene.stageW, scene.stageH]
  );

  const handleCommitTextEdit = useCallback((field: EditableTextField, value: string) => {
    setConfig((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: value,
      },
    }));
  }, []);

  const handleResetElement = useCallback((id: string) => {
    setConfig((prev) => {
      if (id === 'primary') {
        return {
          ...prev,
          instrumentStyle: {
            ...prev.instrumentStyle,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            rotation: 0,
          },
        };
      }
      if (id.startsWith('stamp:')) {
        const sid = id.slice(6);
        return {
          ...prev,
          stamps: prev.stamps.map((s) => (s.id === sid ? { ...s, scale: 1.2, rotation: 0 } : s)),
        };
      }
      const nextTransforms = { ...(prev.elementTransforms ?? {}) };
      delete nextTransforms[id];
      return {
        ...prev,
        elementTransforms: nextTransforms,
      };
    });
  }, []);

  const handleResetAllTransforms = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      instrumentStyle: {
        ...prev.instrumentStyle,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
      elementTransforms: {},
    }));
    showToast('Reset all element positions, scales & rotations');
  }, [showToast]);

  const handleRemoveStamp = useCallback(
    (id: string) => {
      setConfig((prev) => ({
        ...prev,
        stamps: prev.stamps.filter((s) => s.id !== id),
      }));
      if (selectedElementId === `stamp:${id}`) setSelectedElementId(null);
    },
    [selectedElementId]
  );

  // Keyboard shortcuts (L = Lucky, M = Mint, Arrows = Nudge, Escape = Deselect, Delete = Remove stamp)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Escape' && selectedElementId) {
        e.preventDefault();
        setSelectedElementId(null);
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId?.startsWith('stamp:')) {
        e.preventDefault();
        handleRemoveStamp(selectedElementId.slice(6));
        return;
      }

      if (
        selectedElementId &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')
      ) {
        const el = scene.elements.find((item) => item.id === selectedElementId);
        if (!el) return;
        e.preventDefault();
        const step = e.shiftKey ? 12 : 3;
        const stepX = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const stepY = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

        if (el.id === 'primary') {
          const curDx = (config.instrumentStyle.offsetX / 100) * scene.stageW * 0.4;
          const curDy = (config.instrumentStyle.offsetY / 100) * scene.stageH * 0.4;
          handleTransformElement(el, { dx: Math.round(curDx + stepX), dy: Math.round(curDy + stepY) });
        } else if (el.kind === 'stamp' && el.stampId) {
          const st = config.stamps.find((s) => s.id === el.stampId);
          const curDx = st ? (st.x / 1000) * scene.width : el.cx;
          const curDy = st ? (st.y / 1000) * scene.height : el.cy;
          handleTransformElement(el, { dx: Math.round(curDx + stepX), dy: Math.round(curDy + stepY) });
        } else {
          const t = config.elementTransforms?.[el.id] ?? DEFAULT_TRANSFORM;
          handleTransformElement(el, { dx: t.dx + stepX, dy: t.dy + stepY });
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleFeelingLucky();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleMint();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleFeelingLucky,
    handleMint,
    handleRemoveStamp,
    handleTransformElement,
    selectedElementId,
    scene,
    config,
  ]);

  const handleCycleTrait = (trait: keyof TraitLocks) => {
    setConfig((prev) => {
      if (trait === 'palette') {
        return {
          ...prev,
          customPalette: null,
          paletteIndex: (prev.paletteIndex + 1) % BUILTIN_PALETTES.length,
        };
      }
      if (trait === 'layout') {
        return { ...prev, layoutIndex: (prev.layoutIndex + 1) % LAYOUT_NAMES.length };
      }
      if (trait === 'instrument') {
        return { ...prev, instrumentIndex: (prev.instrumentIndex + 1) % INSTRUMENT_NAMES.length };
      }
      return { ...prev, nameIndex: (prev.nameIndex + 1) % PIECE_NAMES.length };
    });
  };

  const handleRerollTrait = (trait: keyof TraitLocks) => {
    setConfig((prev) => {
      const pick = (len: number, curr: number) => {
        if (len <= 1) return 0;
        let next = Math.floor(Math.random() * len);
        if (next === curr) next = (curr + 1) % len;
        return next;
      };
      if (trait === 'palette') {
        return { ...prev, customPalette: null, paletteIndex: pick(BUILTIN_PALETTES.length, prev.paletteIndex) };
      }
      if (trait === 'layout') {
        return { ...prev, layoutIndex: pick(LAYOUT_NAMES.length, prev.layoutIndex) };
      }
      if (trait === 'instrument') {
        return { ...prev, instrumentIndex: pick(INSTRUMENT_NAMES.length, prev.instrumentIndex) };
      }
      return { ...prev, nameIndex: pick(PIECE_NAMES.length, prev.nameIndex) };
    });
  };

  const handleToggleLock = (trait: keyof TraitLocks) => {
    setConfig((prev) => ({
      ...prev,
      locks: { ...prev.locks, [trait]: !prev.locks[trait] },
    }));
  };

  const handleApplySeed = (seed: number) => {
    setConfig((prev) => {
      const next = deriveTraitsFromSeed(seed, prev);
      recordRecent(next);
      return next;
    });
  };

  const handleResetCustomizations = () => {
    setConfig((prev) => {
      const def = createDefaultConfig(prev.seed);
      return {
        ...prev,
        frame: def.frame,
        typography: def.typography,
        instrumentStyle: def.instrumentStyle,
        elementTransforms: {},
      };
    });
    showToast('Reset frame, geometry, typography & transform overrides');
  };

  const handleAddStamp = (asset: MicroSvgAsset) => {
    const stamp = createDefaultStamp(asset);
    setConfig((prev) => ({ ...prev, stamps: [...prev.stamps, stamp] }));
    setSelectedElementId(`stamp:${stamp.id}`);
    showToast(`Stamped "${asset.name}" onto plate`);
  };

  const handleUpdateStamp = (id: string, patch: Partial<PlacedSvgStamp>) => {
    setConfig((prev) => ({
      ...prev,
      stamps: prev.stamps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const handleDuplicateStamp = (id: string) => {
    setConfig((prev) => {
      const found = prev.stamps.find((s) => s.id === id);
      if (!found) return prev;
      const clone: PlacedSvgStamp = {
        ...found,
        id: `stamp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        x: Math.min(940, found.x + 40),
        y: Math.min(940, found.y + 40),
      };
      setSelectedElementId(`stamp:${clone.id}`);
      return { ...prev, stamps: [...prev.stamps, clone] };
    });
  };

  const handleRollBatch = (count: number) => {
    const nextBatch: PlateConfig[] = [];
    for (let i = 0; i < count; i++) {
      const s = randomSeed();
      nextBatch.push(deriveTraitsFromSeed(s, config));
    }
    setBatchItems(nextBatch);
    setBatchModalOpen(true);
  };

  const handleSaveToServerDisk = async () => {
    const meta = getPlateMetadata(config);
    const filename = `${meta.shortTitle.toLowerCase()}-${config.seed}`;
    const res = await api.saveExportToServer({ filename, svgContent: scene.svg });
    setServerExports((prev) => [res.filename, ...prev.filter((f) => f !== res.filename)]);
    showToast(`Saved ${res.path} on server`);
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#0b0b0b] text-[#eae6dc]">
      <HeaderBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMobileArchive={() => setMobileArchiveOpen(true)}
        collectionCount={collection.length}
        onDownloadSvg={() => downloadCurrentPlateSvg(config, customAssets)}
      />

      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
        {/* Desktop Left Archive Sidebar */}
        <div className="hidden lg:flex">
          <CollectionSidebar
            collection={collection}
            recent={recent}
            activeSeed={config.seed}
            loading={loadingDb}
            onLoadCollectionItem={(item) => {
              setConfig(normalizeLoadedConfig(item.config));
              setSelectedElementId(null);
              showToast(`Loaded Edition #${String(item.editionNumber).padStart(3, '0')}`);
            }}
            onDeleteCollectionItem={async (id) => {
              await api.deleteCollectionItem(id);
              setCollection((prev) => prev.filter((c) => c.id !== id));
            }}
            onLoadRecentRoll={(roll) => {
              setConfig(normalizeLoadedConfig(roll.config));
              setSelectedElementId(null);
            }}
            onClearRecent={async () => {
              await api.clearRecent();
              setRecent([]);
            }}
          />
        </div>

        {/* Center Plate Canvas */}
        <PlateViewport
          config={config}
          scene={scene}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onTransformElement={handleTransformElement}
          onCommitTextEdit={handleCommitTextEdit}
          onResetElement={handleResetElement}
          onDeleteStamp={handleRemoveStamp}
        />

        {/* Right Studio Inspector */}
        <InspectorPanel
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          config={config}
          scene={scene}
          savedPalettes={savedPalettes}
          customAssets={customAssets}
          selectedElementId={selectedElementId}
          collectionCount={collection.length}
          batchCount={batchItems.length}
          hasBatch={batchItems.length > 0}
          serverExports={serverExports}
          onFeelingLucky={handleFeelingLucky}
          onCycleTrait={handleCycleTrait}
          onRerollTrait={handleRerollTrait}
          onToggleLock={handleToggleLock}
          onUpdateConfig={setConfig}
          onApplySeed={handleApplySeed}
          onResetCustomizations={handleResetCustomizations}
          onSelectElement={setSelectedElementId}
          onTransformElement={handleTransformElement}
          onResetElement={handleResetElement}
          onResetAllTransforms={handleResetAllTransforms}
          onAddSavedPalette={async (payload) => {
            const created = await api.addPalette(payload);
            setSavedPalettes((prev) => [created, ...prev]);
            showToast(`Saved palette "${created.name}"`);
          }}
          onDeleteSavedPalette={async (id) => {
            await api.deletePalette(id);
            setSavedPalettes((prev) => prev.filter((p) => p.id !== id));
          }}
          onApplySavedPalette={(palette) => {
            setConfig((prev) => ({
              ...prev,
              customPalette: palette,
              locks: { ...prev.locks, palette: true },
            }));
            showToast(`Applied & locked "${palette.name}"`);
          }}
          onSelectStamp={(stampId) => setSelectedElementId(stampId ? `stamp:${stampId}` : null)}
          onAddStamp={handleAddStamp}
          onUpdateStamp={handleUpdateStamp}
          onDuplicateStamp={handleDuplicateStamp}
          onRemoveStamp={handleRemoveStamp}
          onUploadCustomAsset={async (payload) => {
            const created = await api.addAsset(payload);
            setCustomAssets((prev) => [created, ...prev]);
            showToast(`Added custom SVG "${created.name}"`);
          }}
          onDeleteCustomAsset={async (id) => {
            await api.deleteAsset(id);
            setCustomAssets((prev) => prev.filter((a) => a.id !== id));
          }}
          onMint={handleMint}
          onCopyShareLink={async () => {
            await copyTextToClipboard(window.location.href);
            showToast('Shareable URL copied');
          }}
          onUpdateAspect={(aspect) => setConfig((prev) => ({ ...prev, aspect }))}
          onDownloadSvg={() => downloadCurrentPlateSvg(config, customAssets)}
          onDownloadPng={(scale) => downloadCurrentPlatePng(config, customAssets, scale)}
          onCopySvg={async () => {
            await copyTextToClipboard(scene.svg);
            showToast('SVG markup copied');
          }}
          onSaveToServerDisk={handleSaveToServerDisk}
          onRollBatch={handleRollBatch}
          onOpenBatchModal={() => setBatchModalOpen(true)}
          onDownloadBatchZip={() => downloadBatchZipFile(batchItems, customAssets)}
          onDownloadBatchSheet={() => {
            const sheet = renderContactSheetSvg(
              batchItems,
              customAssets,
              batchItems.length <= 6 ? 3 : 4
            );
            downloadSvgFile(sheet, `kata-contact-sheet-${batchItems.length}.svg`);
          }}
        />
      </div>

      {/* Mobile Archive Drawer */}
      {mobileArchiveOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Saved collection and recent rolls"
          className="fixed inset-0 z-50 bg-black/80 flex lg:hidden"
        >
          <div className="w-80 max-w-full bg-[#0b0b0b] border-r border-[#242424] flex flex-col h-full">
            <div className="px-4 py-3 border-b border-[#242424] flex items-center justify-between">
              <span className="text-xs font-semibold tracking-[0.14em] uppercase">Archive</span>
              <button
                type="button"
                aria-label="Close archive drawer"
                onClick={() => setMobileArchiveOpen(false)}
                className="p-1 text-[#9d978e] hover:text-[#eae6dc]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <CollectionSidebar
              collection={collection}
              recent={recent}
              activeSeed={config.seed}
              loading={loadingDb}
              onLoadCollectionItem={(item) => {
                setConfig(item.config);
                setMobileArchiveOpen(false);
              }}
              onDeleteCollectionItem={async (id) => {
                await api.deleteCollectionItem(id);
                setCollection((prev) => prev.filter((c) => c.id !== id));
              }}
              onLoadRecentRoll={(roll) => {
                setConfig(roll.config);
                setMobileArchiveOpen(false);
              }}
              onClearRecent={async () => {
                await api.clearRecent();
                setRecent([]);
              }}
            />
          </div>
        </div>
      )}

      {/* Batch Modal */}
      <BatchModal
        isOpen={batchModalOpen}
        items={batchItems}
        customAssets={customAssets}
        onClose={() => setBatchModalOpen(false)}
        onSelectPiece={(cfg) => setConfig(cfg)}
        onDownloadZip={() => downloadBatchZipFile(batchItems, customAssets)}
        onDownloadSheet={() => {
          const sheet = renderContactSheetSvg(
            batchItems,
            customAssets,
            batchItems.length <= 6 ? 3 : 4
          );
          downloadSvgFile(sheet, `kata-contact-sheet-${batchItems.length}.svg`);
        }}
      />

      {/* Footer */}
      <footer className="h-8 border-t border-[#1e1e1e] bg-[#0b0b0b] px-4 lg:px-6 flex items-center justify-between text-[10px] tracking-[0.14em] text-[#7b766e] uppercase shrink-0">
        <span>Every plate is unique · すべての版は唯一無二</span>
        <span>KATA Studio</span>
      </footer>

      {/* Subtle Action Toast */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#141414] border border-[#ff4d00] px-4 py-2 text-xs tracking-[0.08em] text-[#eae6dc] shadow-lg"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
