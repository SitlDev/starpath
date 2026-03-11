"use client";

import CopyButton from "./CopyButton";

interface AssetCardProps {
    title?: string;
    label: string;
    value: string;
    onChange?: (val: string) => void;
    badge?: string;
    type?: "text" | "textarea";
    rows?: number;
}

export default function AssetCard({
    title,
    label,
    value,
    onChange,
    badge,
    type = "textarea",
    rows = 4,
}: AssetCardProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
                        {label}
                    </label>
                    {badge && (
                        <span className="text-[8px] font-mono uppercase tracking-widest bg-accent/10 text-accent px-1.5 py-0.5 rounded border border-accent/20">
                            {badge}
                        </span>
                    )}
                </div>
                <CopyButton text={value} />
            </div>

            {type === "textarea" ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    rows={rows}
                    className="w-full bg-base border border-border p-4 rounded-lg font-mono text-sm focus:outline-none focus:border-accent transition-all resize-none leading-relaxed"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full bg-base border border-border p-4 rounded-lg font-mono text-sm focus:outline-none focus:border-accent transition-all"
                />
            )}
        </div>
    );
}
