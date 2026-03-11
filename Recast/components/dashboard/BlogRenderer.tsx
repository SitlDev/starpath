"use client";

import { useMemo } from "react";

interface BlogRendererProps {
    markdown: string;
}

export default function BlogRenderer({ markdown }: BlogRendererProps) {
    // Simple markdown parser as requested in the prompt
    const html = useMemo(() => {
        if (!markdown) return "";

        return markdown
            .split('\n\n')
            .map(block => {
                // Headers
                if (block.startsWith('## ')) {
                    return `<h2 class="text-2xl font-bold font-syne uppercase tracking-tight italic mt-12 mb-6 text-text-primary">${block.replace('## ', '')}</h2>`;
                }
                if (block.startsWith('# ')) {
                    return `<h1 class="text-4xl font-black font-syne uppercase tracking-tighter italic mb-8 text-accent">${block.replace('# ', '')}</h1>`;
                }

                // Bold
                let content = block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent font-bold">$1</strong>');

                // List items
                if (block.startsWith('- ') || block.startsWith('* ')) {
                    const items = block.split('\n').map(item => `<li class="ml-4 pl-2 mb-2 italic">${item.substring(2)}</li>`).join('');
                    return `<ul class="list-disc list-outside space-y-2 mb-6 text-text-secondary">${items}</ul>`;
                }

                return `<p class="mb-6 leading-relaxed text-text-secondary font-medium">${content}</p>`;
            })
            .join('');
    }, [markdown]);

    return (
        <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
