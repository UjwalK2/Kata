import React from 'react';
import type { InspectorTab } from './HeaderBar';
import { StudioTab } from './StudioTab';
import { CustomizeTab } from './CustomizeTab';
import { SvgAssetsTab } from './SvgAssetsTab';
import { ExportTab } from './ExportTab';
import type { PlateSceneResult } from '../engine/generator';
import type {
  AspectRatioMode,
  ElementTransform,
  MicroSvgAsset,
  PaletteDef,
  PlacedSvgStamp,
  PlateConfig,
  PlateElementBox,
  TraitLocks,
} from '../engine/types';

interface InspectorPanelProps {
  activeTab: InspectorTab;
  onSelectTab: (tab: InspectorTab) => void;
  config: PlateConfig;
  scene: PlateSceneResult;
  savedPalettes: PaletteDef[];
  customAssets: MicroSvgAsset[];
  selectedElementId: string | null;
  collectionCount: number;
  batchCount: number;
  hasBatch: boolean;
  serverExports: string[];
  onFeelingLucky: () => void;
  onCycleTrait: (trait: keyof TraitLocks) => void;
  onRerollTrait: (trait: keyof TraitLocks) => void;
  onToggleLock: (trait: keyof TraitLocks) => void;
  onUpdateConfig: (updater: (prev: PlateConfig) => PlateConfig) => void;
  onApplySeed: (seed: number) => void;
  onResetCustomizations: () => void;
  onSelectElement: (id: string | null) => void;
  onTransformElement: (element: PlateElementBox, patch: Partial<ElementTransform>) => void;
  onResetElement: (id: string) => void;
  onResetAllTransforms: () => void;
  onAddSavedPalette: (payload: { name: string; bg: string; ink: string; accent: string }) => Promise<void>;
  onDeleteSavedPalette: (id: string) => Promise<void>;
  onApplySavedPalette: (palette: PaletteDef) => void;
  onSelectStamp: (id: string | null) => void;
  onAddStamp: (asset: MicroSvgAsset) => void;
  onUpdateStamp: (id: string, patch: Partial<PlacedSvgStamp>) => void;
  onDuplicateStamp: (id: string) => void;
  onRemoveStamp: (id: string) => void;
  onUploadCustomAsset: (payload: { name: string; jpName?: string; svgContent: string }) => Promise<void>;
  onDeleteCustomAsset: (id: string) => Promise<void>;
  onMint: () => Promise<void>;
  onCopyShareLink: () => Promise<void>;
  onUpdateAspect: (aspect: AspectRatioMode) => void;
  onDownloadSvg: () => void;
  onDownloadPng: (scale: number) => Promise<void>;
  onCopySvg: () => Promise<void>;
  onSaveToServerDisk: () => Promise<void>;
  onRollBatch: (count: number) => void;
  onOpenBatchModal: () => void;
  onDownloadBatchZip: () => Promise<void>;
  onDownloadBatchSheet: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = (props) => {
  const tabs: { id: InspectorTab; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'customize', label: 'Customize' },
    { id: 'assets', label: 'Assets' },
    { id: 'export', label: 'Export' },
  ];

  const selectedStampId = props.selectedElementId?.startsWith('stamp:')
    ? props.selectedElementId.slice(6)
    : null;

  return (
    <aside
      aria-label="Design inspector"
      className="w-full lg:w-[376px] border-l border-[#222222] bg-[#0b0b0b] flex flex-col shrink-0 lg:h-full overflow-hidden"
    >
      {/* Top Pinned Feeling Lucky CTA + Segmented Tab Strip */}
      <div className="p-4 border-b border-[#1c1c1c] space-y-3 shrink-0">
        <button
          type="button"
          onClick={props.onFeelingLucky}
          className="w-full h-10 border border-[#ff4d00] bg-[#140d0a] text-xs font-medium tracking-[0.14em] uppercase text-[#ff4d00] hover:bg-[#ff4d00] hover:text-[#0b0b0b] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
        >
          ◇ Feeling lucky (L)
        </button>

        <div role="tablist" aria-label="Inspector sections" className="grid grid-cols-4 border border-[#242424] bg-[#0e0e0e]">
          {tabs.map((t) => {
            const active = props.activeTab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => props.onSelectTab(t.id)}
                className={`h-8 text-[10px] font-medium tracking-[0.08em] uppercase transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#ff4d00] text-[#0b0b0b]'
                    : 'text-[#9d978e] hover:text-[#eae6dc]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Active Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {props.activeTab === 'studio' && (
          <StudioTab
            config={props.config}
            savedPalettes={props.savedPalettes}
            onCycleTrait={props.onCycleTrait}
            onRerollTrait={props.onRerollTrait}
            onToggleLock={props.onToggleLock}
            onUpdateConfig={props.onUpdateConfig}
            onApplySeed={props.onApplySeed}
            onAddSavedPalette={props.onAddSavedPalette}
            onDeleteSavedPalette={props.onDeleteSavedPalette}
            onApplySavedPalette={props.onApplySavedPalette}
          />
        )}

        {props.activeTab === 'customize' && (
          <CustomizeTab
            config={props.config}
            scene={props.scene}
            selectedElementId={props.selectedElementId}
            onSelectElement={props.onSelectElement}
            onTransformElement={props.onTransformElement}
            onResetElement={props.onResetElement}
            onResetAllTransforms={props.onResetAllTransforms}
            onUpdateConfig={props.onUpdateConfig}
            onResetCustomizations={props.onResetCustomizations}
          />
        )}

        {props.activeTab === 'assets' && (
          <SvgAssetsTab
            config={props.config}
            customAssets={props.customAssets}
            selectedStampId={selectedStampId}
            onSelectStamp={props.onSelectStamp}
            onAddStamp={props.onAddStamp}
            onUpdateStamp={props.onUpdateStamp}
            onDuplicateStamp={props.onDuplicateStamp}
            onRemoveStamp={props.onRemoveStamp}
            onUploadCustomAsset={props.onUploadCustomAsset}
            onDeleteCustomAsset={props.onDeleteCustomAsset}
          />
        )}

        {props.activeTab === 'export' && (
          <ExportTab
            config={props.config}
            collectionCount={props.collectionCount}
            batchCount={props.batchCount}
            hasBatch={props.hasBatch}
            serverExports={props.serverExports}
            onMint={props.onMint}
            onCopyShareLink={props.onCopyShareLink}
            onUpdateAspect={props.onUpdateAspect}
            onDownloadSvg={props.onDownloadSvg}
            onDownloadPng={props.onDownloadPng}
            onCopySvg={props.onCopySvg}
            onSaveToServerDisk={props.onSaveToServerDisk}
            onRollBatch={props.onRollBatch}
            onOpenBatchModal={props.onOpenBatchModal}
            onDownloadBatchZip={props.onDownloadBatchZip}
            onDownloadBatchSheet={props.onDownloadBatchSheet}
          />
        )}
      </div>

      {/* Bottom Pinned Quick Mint Action */}
      <div className="p-3.5 border-t border-[#1c1c1c] bg-[#0b0b0b] shrink-0">
        <button
          type="button"
          onClick={props.onMint}
          className="w-full h-9 border border-[#eae6dc]/80 text-[11px] font-medium tracking-[0.12em] uppercase text-[#eae6dc] hover:bg-[#eae6dc] hover:text-[#0b0b0b] transition-colors cursor-pointer"
        >
          ◆ Mint to collection (M)
        </button>
      </div>
    </aside>
  );
};
