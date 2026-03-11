"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Video, ExternalLink, MoreVertical } from "lucide-react";
import { clsx } from "clsx";

interface Recast {
    id: string;
    created_at: string;
    input_type: string;
    video_title: string;
    video_thumbnail_url: string;
    viral_score: number;
    status: string;
}

export default function DashboardPage() {
    const supabase = createClient();
    const [recasts, setRecasts] = useState<Recast[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || "");

                const { data } = await supabase
                    .from("recasts")
                    .select("id, created_at, input_type, video_title, video_thumbnail_url, viral_score, status")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (data) setRecasts(data);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-base">
            {/* Header */}
            <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <Link href="/" className="text-2xl font-black italic uppercase tracking-tighter font-syne">
                    RECAST
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/recast" className="btn-primary flex items-center gap-2 py-2 px-4 text-xs">
                        <Plus className="w-4 h-4" /> New Recast
                    </Link>
                    <div className="hidden md:flex items-center gap-4 border-l border-border pl-6">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{userEmail}</span>
                        <button
                            onClick={handleSignOut}
                            className="text-[10px] font-mono text-text-secondary hover:text-accent uppercase tracking-widest transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-syne uppercase tracking-widest italic">
                        Your Recasts
                    </h2>
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em]">
                        Showing {recasts.length} total
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card h-64 skeleton" />
                        ))}
                    </div>
                ) : recasts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                        <div className="bg-surface border border-border p-8 rounded-full">
                            <Plus className="w-12 h-12 text-text-muted opacity-20" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-syne uppercase tracking-widest italic">No recasts yet</h3>
                            <p className="text-text-muted font-mono text-sm">Drop your first video to start growing your presence.</p>
                        </div>
                        <Link href="/recast" className="btn-secondary py-3 px-8">
                            Create First Recast
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recasts.map((r) => (
                            <Link
                                key={r.id}
                                href={`/recast/${r.id}`}
                                className="card group overflow-hidden flex flex-col"
                            >
                                <div className="relative aspect-video bg-elevated overflow-hidden">
                                    {r.video_thumbnail_url ? (
                                        <img
                                            src={r.video_thumbnail_url}
                                            alt={r.video_title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video className="w-12 h-12 text-text-muted opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={clsx(
                                            "px-2 py-1 rounded text-[8px] font-mono uppercase tracking-widest",
                                            r.status === 'complete' ? "bg-success text-base" : "bg-accent text-base animate-pulse"
                                        )}>
                                            {r.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-text-muted px-2 py-0.5 border border-border rounded">
                                                {r.input_type}
                                            </span>
                                            <span className="text-[8px] font-mono text-text-muted uppercase tracking-widest">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-syne font-bold text-text-primary line-clamp-2 uppercase tracking-wide group-hover:text-accent transition-colors">
                                            {r.video_title || "Untitled Recast"}
                                        </h4>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-text-muted uppercase">Viral Score:</span>
                                            <span className={clsx(
                                                "text-xs font-mono font-bold px-2 py-0.5 rounded",
                                                r.viral_score > 75 ? "text-success bg-success/10" :
                                                    r.viral_score > 50 ? "text-accent bg-accent/10" : "text-error bg-error/10"
                                            )}>
                                                {r.viral_score || "--"}
                                            </span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
