import React, { useState } from 'react';
import { HardDrive, Link2, Check } from 'lucide-react';
import type { AspectRatioMode, PlateConfig } from '../engine/types';

interface ExportTabProps {
  config: PlateConfig;
  collectionCount: number;
  batchCount: number;
  hasBatch: boolean;
  serverExports: string[];
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

export const ExportTab: React.FC<ExportTabProps> = ({
  config,
  collectionCount,
  batchCount,
  hasBatch,
  serverExports,
  onMint,
  onCopyShareLink,
  onUpdateAspect,
  onDownloadSvg,
  onDownloadPng,
  onCopySvg,
  onSaveToServerDisk,
  onRollBatch,
  onOpenBatchModal,
  onDownloadBatchZip,
  onDownloadBatchSheet,
}) => {
  const [pngScale, setPngScale] = useState(2);
  const [batchSize, setBatchSize] = useState(12);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    setMinting(true);
    try {
      await onMint();
    } finally {
      setMinting(false);
    }
  };

  const handleShare = async () => {
    await onCopyShareLink();
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const handleCopySvg = async () => {
    await onCopySvg();
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 1800);
  };

  const handleSaveServer = async () => {
    await onSaveToServerDisk();
    setSavedNotice('Saved to server ./data/exports/');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  return (
    <div className="space-y-4">
      {/* COLLECTION */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Collection — {collectionCount === 0 ? 'Empty' : `${collectionCount} Saved`}
        </h2>
        <button
          type="button"
          disabled={minting}
          onClick={handleMint}
          className="w-full h-9 border border-[#eae6dc] text-xs font-medium tracking-[0.1em] uppercase text-[#eae6dc] hover:bg-[#eae6dc] hover:text-[#0b0b0b] transition-colors cursor-pointer disabled:opacity-50"
        >
          {minting ? 'Saving...' : '◆ Mint to collection (M)'}
        </button>
        <p className="text-[10px] leading-relaxed tracking-[0.06em] text-[#7b766e] uppercase">
          Minted pieces receive a permanent edition number and persist in server JSON storage.
        </p>
      </section>

      {/* SHARE */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Share
        </h2>
        <button
          type="button"
          onClick={handleShare}
          className="w-full h-9 border border-[#2f2f2f] bg-[#131313] text-xs tracking-[0.1em] uppercase text-[#eae6dc] hover:border-[#ff4d00] flex items-center justify-center gap-2 cursor-pointer"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-[#ff4d00]" /> : <Link2 className="w-3.5 h-3.5" />}
          {copiedShare ? 'Shareable Link Copied' : 'Copy Shareable Link'}
        </button>
        <p className="text-[10px] leading-relaxed tracking-[0.06em] text-[#7b766e] uppercase">
          Encodes seed, locks and wordmark in the URL hash.
        </p>
      </section>

      {/* EXPORT */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Export
        </h2>

        <select
          aria-label="Export aspect ratio"
          value={config.aspect}
          onChange={(e) => onUpdateAspect(e.target.value as AspectRatioMode)}
          className="w-full h-8 px-2.5 border border-[#282828] bg-[#131313] text-[11px] tracking-[0.08em] text-[#eae6dc]"
        >
          <option value="SQUARE">SQUARE 1:1</option>
          <option value="POSTER">POSTER 2:3</option>
          <option value="WIDE">WIDE 2:1 / BANNER</option>
          <option value="AVATAR">AVATAR CROP 1:1</option>
        </select>

        <div className="grid grid-cols-[1fr_1fr_68px] gap-1.5">
          <button
            type="button"
            onClick={onDownloadSvg}
            className="h-8 border border-[#eae6dc] text-[11px] font-medium tracking-[0.1em] uppercase text-[#eae6dc] hover:bg-[#eae6dc] hover:text-[#0b0b0b] cursor-pointer"
          >
            SVG
          </button>
          <button
            type="button"
            onClick={() => onDownloadPng(pngScale)}
            className="h-8 border border-[#eae6dc] text-[11px] font-medium tracking-[0.1em] uppercase text-[#eae6dc] hover:bg-[#eae6dc] hover:text-[#0b0b0b] cursor-pointer"
          >
            PNG
          </button>
          <select
            aria-label="PNG scale multiplier"
            value={pngScale}
            onChange={(e) => setPngScale(Number(e.target.value))}
            className="h-8 px-1.5 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
          >
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleCopySvg}
            className="h-8 border border-[#2f2f2f] bg-[#131313] text-[10px] tracking-[0.1em] uppercase text-[#eae6dc] hover:border-[#ff4d00] cursor-pointer"
          >
            {copiedSvg ? 'Copied SVG' : 'Copy SVG'}
          </button>
          <button
            type="button"
            onClick={handleSaveServer}
            className="h-8 border border-[#2f2f2f] bg-[#131313] text-[10px] tracking-[0.08em] uppercase text-[#eae6dc] hover:border-[#ff4d00] flex items-center justify-center gap-1 cursor-pointer"
          >
            <HardDrive className="w-3 h-3" />
            Save Server
          </button>
        </div>

        {savedNotice && <p className="text-[10px] text-[#ff4d00]">{savedNotice}</p>}
        {serverExports.length > 0 && (
          <p className="text-[10px] text-[#7b766e] truncate">
            Server exports ({serverExports.length}): {serverExports[0]}
          </p>
        )}
      </section>

      {/* BATCH */}
      <section className="border border-[#242424] bg-[#0e0e0e] p-3.5 space-y-2.5">
        <h2 className="text-[10px] font-semibold tracking-[0.14em] text-[#9d978e] uppercase">
          Batch
        </h2>

        <div className="grid grid-cols-[72px_1fr] gap-1.5">
          <select
            aria-label="Batch count"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="h-8 px-2 border border-[#282828] bg-[#131313] text-[11px] text-[#eae6dc]"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
          <button
            type="button"
            onClick={() => onRollBatch(batchSize)}
            className="h-8 border border-[#ff4d00] bg-[#ff4d00]/10 text-[11px] font-medium tracking-[0.1em] uppercase text-[#ff4d00] hover:bg-[#ff4d00] hover:text-[#0b0b0b] transition-colors cursor-pointer"
          >
            Roll Batch
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            disabled={!hasBatch}
            onClick={onOpenBatchModal}
            className="h-8 border border-[#2f2f2f] text-[10px] tracking-[0.1em] uppercase text-[#eae6dc] hover:border-[#ff4d00] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Grid
          </button>
          <button
            type="button"
            disabled={!hasBatch}
            onClick={onDownloadBatchZip}
            className="h-8 border border-[#2f2f2f] text-[10px] tracking-[0.1em] uppercase text-[#eae6dc] hover:border-[#ff4d00] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            ZIP ({hasBatch ? batchCount : 0})
          </button>
          <button
            type="button"
            disabled={!hasBatch}
            onClick={onDownloadBatchSheet}
            className="h-8 border border-[#2f2f2f] text-[10px] tracking-[0.1em] uppercase text-[#eae6dc] hover:border-[#ff4d00] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Sheet
          </button>
        </div>

        <p className="text-[10px] leading-relaxed tracking-[0.06em] text-[#7b766e] uppercase">
          Batch respects locked traits. Sheet exports a single contact-sheet poster.
        </p>
      </section>
    </div>
  );
};
