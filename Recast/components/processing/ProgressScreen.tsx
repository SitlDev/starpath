"use client";

import WaveformAnimation from "./WaveformAnimation";
import { clsx } from "clsx";

const STEPS = [
    { label: "Uploading source", statuses: ["transcribing", "repurposing", "complete"] },
    { label: "Extracting audio", statuses: ["transcribing", "repurposing", "complete"] },
    { label: "Transcribing with Whisper", statuses: ["transcribing", "repurposing", "complete"] },
    { label: "Analyzing content structure", statuses: ["repurposing", "complete"] },
    { label: "Writing short-form scripts", statuses: ["repurposing", "complete"] },
    { label: "Building blog + email", statuses: ["repurposing", "complete"] },
    { label: "Assembling your bundle", statuses: ["complete"] },
];

interface ProgressScreenProps {
    status: string;
}

export default function ProgressScreen({ status }: ProgressScreenProps) {
    return (
        <div className="max-w-md mx-auto py-12 px-6 card bg-surface/50 backdrop-blur-xl border-accent/10">
            <div className="flex flex-col items-center gap-8">
                <WaveformAnimation />

                <div className="w-full space-y-4">
                    {STEPS.map((step, i) => {
                        const isCompleted = step.statuses.includes(status) && (status !== step.statuses[0] || status === 'complete');
                        const isActive = status === 'transcribing' && i < 3 || status === 'repurposing' && i >= 3 && i < 6 || status === 'complete';

                        return (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className={clsx(
                                    "w-2 h-2 rounded-full transition-all duration-500",
                                    isCompleted ? "bg-success" : isActive ? "bg-accent animate-pulse" : "bg-text-muted/30"
                                )} />
                                <span className={clsx(
                                    "font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-500",
                                    isCompleted ? "text-success" : isActive ? "text-accent" : "text-text-muted"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center space-y-2 pt-4 border-t border-border w-full">
                    <p className="text-xs text-text-muted font-mono uppercase tracking-widest italic">
                        Estimated time: 2-4 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
