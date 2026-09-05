"use client";
import { useState } from "react";
/**
 * Profile tabs. Every panel is rendered server-side and kept in the DOM — only
 * visibility is toggled — so all profile content stays crawlable.
 */
export default function ProfileTabs({ tabs }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-line bg-canvas/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveId(tab.id)}
                className={`shrink-0 border-b-2 px-3.5 py-3 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "border-brand-500 text-navy-900"
                    : "border-transparent text-ink-500 hover:text-navy-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== activeId}
          className="pt-6"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
