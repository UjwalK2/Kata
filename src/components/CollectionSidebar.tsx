import React from 'react';
import { Trash2 } from 'lucide-react';
import type { CollectionItem, RecentRoll } from '../engine/types';

interface CollectionSidebarProps {
  collection: CollectionItem[];
  recent: RecentRoll[];
  activeSeed: number;
  loading: boolean;
  onLoadCollectionItem: (item: CollectionItem) => void;
  onDeleteCollectionItem: (id: string) => void;
  onLoadRecentRoll: (roll: RecentRoll) => void;
  onClearRecent: () => void;
}

export const CollectionSidebar: React.FC<CollectionSidebarProps> = ({
  collection,
  recent,
  activeSeed,
  loading,
  onLoadCollectionItem,
  onDeleteCollectionItem,
  onLoadRecentRoll,
  onClearRecent,
}) => {
  return (
    <aside
      aria-label="Collection and recent rolls"
      className="w-full lg:w-[248px] border-r border-[#222222] bg-[#0b0b0b] flex flex-col overflow-y-auto shrink-0"
    >
      {/* COLLECTION SECTION */}
      <section className="p-4 border-b border-[#1c1c1c]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-[#9d978e] uppercase">
            Collection
          </h2>
          <span className="text-[11px] tabular-nums text-[#7b766e]">
            {collection.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-12 bg-[#141414] border border-[#222222] animate-pulse" />
            <div className="h-12 bg-[#141414] border border-[#222222] animate-pulse" />
          </div>
        ) : collection.length === 0 ? (
          <p className="text-[11px] leading-relaxed tracking-[0.06em] text-[#7b766e] uppercase">
            Empty — Mint a piece
          </p>
        ) : (
          <ul className="space-y-2">
            {collection.map((item) => {
              const isCurrent = item.seed === activeSeed;
              return (
                <li
                  key={item.id}
                  className={`group flex items-center gap-2.5 p-2 border transition-colors ${
                    isCurrent
                      ? 'border-[#ff4d00] bg-[#161210]'
                      : 'border-[#222222] bg-[#101010] hover:border-[#3a3a3a]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onLoadCollectionItem(item)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00]"
                  >
                    <div className="w-10 h-10 shrink-0 border border-[#262626] bg-[#141414] overflow-hidden flex items-center justify-center">
                      {item.previewSvg ? (
                        <img
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(item.previewSvg)}`}
                          alt={`${item.title} preview`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-[#7b766e] tabular-nums">
                          #{item.editionNumber}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium text-[#eae6dc] truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] tabular-nums text-[#8d877f]">
                        ED.{String(item.editionNumber).padStart(3, '0')} · {item.seed}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.title} edition ${item.editionNumber}`}
                    onClick={() => onDeleteCollectionItem(item.id)}
                    className="p-1.5 text-[#7b766e] hover:text-[#ff4d00] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* RECENT SECTION */}
      <section className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold tracking-[0.16em] text-[#9d978e] uppercase">
            Recent
          </h2>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={onClearRecent}
              className="text-[10px] tracking-[0.1em] uppercase text-[#7b766e] hover:text-[#eae6dc] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-[11px] leading-relaxed tracking-[0.06em] text-[#7b766e] uppercase">
            No rolls yet
          </p>
        ) : (
          <ul className="space-y-1.5">
            {recent.map((roll) => {
              const isCurrent = roll.seed === activeSeed;
              return (
                <li key={roll.id}>
                  <button
                    type="button"
                    onClick={() => onLoadRecentRoll(roll)}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#ff4d00] ${
                      isCurrent
                        ? 'border-[#ff4d00] bg-[#161210] text-[#eae6dc]'
                        : 'border-[#1e1e1e] bg-[#0f0f0f] text-[#b4aea4] hover:border-[#333333] hover:text-[#eae6dc]'
                    }`}
                  >
                    <span className="text-[11px] truncate">{roll.title}</span>
                    <span className="text-[10px] tabular-nums text-[#7b766e] shrink-0">
                      {roll.seed}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
};
