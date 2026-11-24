import React from 'react';

export type InspectorTab = 'studio' | 'customize' | 'assets' | 'export';

interface HeaderBarProps {
  activeTab: InspectorTab;
  onSelectTab: (tab: InspectorTab) => void;
  onOpenMobileArchive: () => void;
  collectionCount: number;
  onDownloadSvg: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileArchive,
  collectionCount,
  onDownloadSvg,
}) => {
  const navTabs: { id: InspectorTab; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'customize', label: 'Customize' },
    { id: 'assets', label: 'SVG Assets' },
    { id: 'export', label: 'Export & Batch' },
  ];

  return (
    <header className="h-14 border-b border-[#242424] bg-[#0b0b0b] px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-3 md:gap-8 shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('studio');
        }}
        className="text-xs sm:text-sm lg:text-base font-semibold tracking-[0.1em] sm:tracking-[0.16em] text-[#eae6dc] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
      >
        <span className="sm:hidden">KATA — STUDIO</span>
        <span className="hidden sm:inline">KATA — MICRO-GRAPHIC DESIGNER</span>
      </a>

      {/* Zone 2: Concise single-line navigation links */}
      <nav aria-label="Workspace sections" className="hidden md:flex items-center gap-6">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`text-xs tracking-[0.12em] uppercase py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00] ${
                isActive
                  ? 'text-[#ff4d00] border-[#ff4d00]'
                  : 'text-[#9d978e] border-transparent hover:text-[#eae6dc]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary action (+ mobile archive trigger) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileArchive}
          className="lg:hidden px-2.5 py-2 border border-[#2a2a2a] text-[10px] tracking-[0.08em] uppercase text-[#eae6dc] hover:border-[#ff4d00] whitespace-nowrap shrink-0 cursor-pointer"
        >
          Archive ({collectionCount})
        </button>
        <button
          type="button"
          onClick={onDownloadSvg}
          className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-medium tracking-[0.1em] uppercase bg-[#ff4d00] text-[#0b0b0b] hover:bg-[#ff6624] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4d00]"
        >
          Export SVG
        </button>
      </div>
    </header>
  );
};
