"use client";

import { clsx } from "clsx";

interface AssetTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    tabs: { id: string; label: string }[];
}

export default function AssetTabs({ activeTab, onTabChange, tabs }: AssetTabsProps) {
    return (
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={clsx(
                        "px-6 py-4 text-[10px] font-mono uppercase tracking-[0.2em] whitespace-nowrap transition-all relative",
                        activeTab === tab.id
                            ? "text-accent"
                            : "text-text-muted hover:text-text-secondary"
                    )}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent animate-in fade-in slide-in-from-bottom-1" />
                    )}
                </button>
            ))}
        </div>
    );
}
