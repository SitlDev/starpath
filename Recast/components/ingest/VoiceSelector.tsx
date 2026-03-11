"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

const VOICES = [
    "Casual & Conversational",
    "Professional & Authoritative",
    "Edgy & Opinionated",
    "Educational & Clear",
    "Storytelling & Narrative",
];

interface VoiceSelectorProps {
    value: string;
    onChange: (voice: string) => void;
}

export default function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted mb-2 ml-1">
                Creator Voice
            </label>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full bg-base border border-border p-4 rounded-lg flex items-center justify-between text-left transition-all hover:border-border-hover",
                    isOpen && "border-accent ring-1 ring-accent/20"
                )}
            >
                <span className={clsx(
                    "font-mono text-sm",
                    value ? "text-text-primary" : "text-text-muted"
                )}>
                    {value || "Select a voice aesthetic..."}
                </span>
                <ChevronDown className={clsx("w-4 h-4 text-text-muted transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-lg shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {VOICES.map((voice) => (
                            <button
                                key={voice}
                                onClick={() => {
                                    onChange(voice);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full p-4 text-left font-mono text-sm transition-colors hover:bg-accent hover:text-base",
                                    value === voice ? "text-accent" : "text-text-secondary"
                                )}
                            >
                                {voice}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
