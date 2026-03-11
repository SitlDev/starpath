"use client";

import { useState, useEffect } from "react";
import { Link2, Youtube, Music2 } from "lucide-react";
import { clsx } from "clsx";

interface URLInputProps {
    type: "youtube" | "tiktok";
    onURLChange: (url: string, isValid: boolean) => void;
    value: string;
}

export default function URLInput({ type, onURLChange, value }: URLInputProps) {
    const [error, setError] = useState<string | null>(null);

    const validate = (url: string) => {
        if (!url) return false;

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com)\/@.+\/video\/\d+/;

        if (type === "youtube" && !youtubeRegex.test(url)) {
            setError("Please enter a valid YouTube URL");
            return false;
        }
        if (type === "tiktok" && !tiktokRegex.test(url)) {
            setError("Please enter a valid TikTok URL");
            return false;
        }

        setError(null);
        return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        const isValid = validate(url);
        onURLChange(url, isValid);
    };

    useEffect(() => {
        if (value) validate(value);
    }, [type]);

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {type === "youtube" ? (
                        <Youtube className="w-5 h-5 text-red-500" />
                    ) : (
                        <Music2 className="w-5 h-5 text-cyan-400" />
                    )}
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={type === "youtube" ? "Paste YouTube URL..." : "Paste TikTok URL..."}
                    className={clsx(
                        "w-full bg-base border-2 p-4 pl-12 font-mono text-sm transition-all focus:outline-none focus:ring-0 rounded-lg",
                        error
                            ? "border-error/50 focus:border-error"
                            : "border-border group-hover:border-border-hover focus:border-accent"
                    )}
                />
            </div>
            {error && value && (
                <p className="text-error text-xs font-mono uppercase tracking-widest pl-4">
                    {error}
                </p>
            )}

            {!value && (
                <div className="card p-8 border-dashed flex flex-col items-center justify-center text-text-muted opacity-50">
                    <Link2 className="w-8 h-8 mb-2" />
                    <p className="text-xs uppercase tracking-widest font-mono">
                        Waiting for {type === "youtube" ? "YouTube" : "TikTok"} link
                    </p>
                </div>
            )}
        </div>
    );
}
