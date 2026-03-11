"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
    text: string;
    label?: string;
}

export default function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="btn-secondary py-1.5 px-3 flex items-center gap-2 min-w-[100px] justify-center"
        >
            {copied ? (
                <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-[10px] text-success">Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{label}</span>
                </>
            )}
        </button>
    );
}
