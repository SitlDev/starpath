"use client";

import { clsx } from "clsx";

const GOALS = [
    "Grow Following",
    "Drive Traffic to Link",
    "Sell a Product",
    "Build Authority",
    "Entertain",
];

interface ContextFieldsProps {
    onAudienceChange: (val: string) => void;
    onGoalChange: (val: string) => void;
    onContextChange: (val: string) => void;
    audience: string;
    goal: string;
    context: string;
}

export default function ContextFields({
    onAudienceChange,
    onGoalChange,
    onContextChange,
    audience,
    goal,
    context,
}: ContextFieldsProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted ml-1">
                    Target Audience
                </label>
                <input
                    type="text"
                    value={audience}
                    onChange={(e) => onAudienceChange(e.target.value)}
                    placeholder="e.g. beginner entrepreneurs, fitness women 25-35"
                    className="w-full bg-base border border-border p-4 rounded-lg font-mono text-sm focus:outline-none focus:border-accent transition-all"
                />
            </div>

            <div className="space-y-4">
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted ml-1">
                    Primary Goal
                </label>
                <div className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                        <button
                            key={g}
                            onClick={() => onGoalChange(g)}
                            className={clsx(
                                "px-4 py-2 border rounded-full font-mono text-[10px] uppercase tracking-widest transition-all",
                                goal === g
                                    ? "bg-accent border-accent text-base"
                                    : "border-border text-text-secondary hover:border-accent/40 hover:text-text-primary"
                            )}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted ml-1">
                    Topic/Context (Optional)
                </label>
                <textarea
                    value={context}
                    onChange={(e) => onContextChange(e.target.value)}
                    rows={3}
                    placeholder="Any extra context about this video? Niche, key message, anything the AI should know."
                    className="w-full bg-base border border-border p-4 rounded-lg font-mono text-sm focus:outline-none focus:border-accent transition-all resize-none"
                />
            </div>
        </div>
    );
}
