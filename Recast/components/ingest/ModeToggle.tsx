"use client";

import { clsx } from "clsx";

type Mode = "upload" | "youtube" | "tiktok";

interface ModeToggleProps {
    activeMode: Mode;
    onModeChange: (mode: Mode) => void;
}

export default function ModeToggle({ activeMode, onModeChange }: ModeToggleProps) {
    const modes: { id: Mode; label: string }[] = [
        { id: "upload", label: "Upload" },
        { id: "youtube", label: "YouTube" },
        { id: "tiktok", label: "TikTok" },
    ];

    return (
        <div className="flex p-1 bg-elevated rounded-lg w-fit mx-auto">
            {modes.map((mode) => (
                <button
                    key={mode.id}
                    onClick={() => onModeChange(mode.id)}
                    className={clsx(
                        "px-6 py-2 text-sm font-mono uppercase tracking-widest transition-all rounded-md",
                        activeMode === mode.id
                            ? "bg-accent text-base"
                            : "text-text-secondary hover:text-text-primary"
                    )}
                >
                    {mode.label}
                </button>
            ))}
        </div>
    );
}
