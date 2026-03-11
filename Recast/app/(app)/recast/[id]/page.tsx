"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProgressScreen from "@/components/processing/ProgressScreen";
import AssetTabs from "@/components/dashboard/AssetTabs";
import AssetCard from "@/components/dashboard/AssetCard";
import BlogRenderer from "@/components/dashboard/BlogRenderer";
import CopyButton from "@/components/dashboard/CopyButton";
import {
    ArrowLeft,
    ExternalLink,
    TrendingUp,
    MessageSquare,
    History,
    Plus,
    RotateCcw,
    Save,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { clsx } from "clsx";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "reel", label: "Insta Reel" },
    { id: "short", label: "YT Short" },
    { id: "tiktok", label: "TikTok" },
    { id: "thread", label: "Threads" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "blog", label: "Blog" },
    { id: "email", label: "Email" },
    { id: "calendar", label: "Calendar" },
];

export default function RecastResultPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const supabase = createClient();

    const [recast, setRecast] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [localData, setLocalData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        async function fetchRecast() {
            const { data, error } = await supabase
                .from("recasts")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                setRecast(data);
                if (data.result) {
                    setLocalData(data.result);
                }
                if (data.status === 'complete') {
                    checkRecastCount();
                }
            }
            setLoading(false);
        }

        async function checkRecastCount() {
            const { count } = await supabase
                .from("recasts")
                .select("*", { count: 'exact', head: true })
                .eq("status", "complete");

            if (count && count >= 5) {
                setShowUpgradeModal(true);
            }
        }

        fetchRecast();

        // Set up polling for processing state
        const interval = setInterval(async () => {
            const { data } = await supabase
                .from("recasts")
                .select("status, result, viral_score, video_title")
                .eq("id", id)
                .single();

            if (data) {
                if (data.status === 'complete' && !recast?.result) {
                    setRecast((prev: any) => ({ ...prev, ...data }));
                    setLocalData(data.result);
                    checkRecastCount();
                    clearInterval(interval);
                } else if (data.status === 'error') {
                    setRecast((prev: any) => ({ ...prev, ...data }));
                    clearInterval(interval);
                } else if (data.status !== 'complete') {
                    setRecast((prev: any) => ({ ...prev, status: data.status }));
                }
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [id, recast?.result]);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from("recasts")
            .update({ result: localData })
            .eq("id", id);

        if (!error) {
            setRecast((prev: any) => ({ ...prev, result: localData }));
        }
        setIsSaving(false);
    };

    if (loading) return null;

    if (recast?.status === 'transcribing' || recast?.status === 'repurposing') {
        return (
            <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6">
                <div className="max-w-xl w-full text-center space-y-8">
                    <header className="space-y-4">
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter font-syne">RECASTING</h1>
                        <p className="text-text-secondary font-mono text-[10px] uppercase tracking-[0.3em]">Processing your masterpiece...</p>
                    </header>
                    <ProgressScreen status={recast.status} />
                </div>
            </div>
        );
    }

    if (recast?.status === 'error') {
        return (
            <div className="min-h-screen bg-base flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full card p-12 text-center space-y-6">
                    <div className="bg-error/10 border border-error/20 p-6 rounded-full w-fit mx-auto">
                        <AlertCircle className="w-12 h-12 text-error" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-syne uppercase italic tracking-widest">Recast Failed</h2>
                        <p className="text-text-muted font-mono text-sm uppercase leading-relaxed">
                            {recast.error_message || "An unexpected error occurred during processing."}
                        </p>
                    </div>
                    <button onClick={() => router.push('/recast')} className="btn-primary w-full py-4">
                        Try Another Video
                    </button>
                </div>
            </div>
        );
    }

    const isDirty = JSON.stringify(localData) !== JSON.stringify(recast?.result);

    return (
        <div className="min-h-screen bg-base flex flex-col relative">
            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm">
                    <div className="card p-12 max-w-lg w-full bg-surface border-accent shadow-2xl relative space-y-8 animate-in zoom-in-95 duration-500">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
                        >
                            ✕
                        </button>
                        <div className="space-y-4 text-center">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter font-syne">Trial Complete.</h2>
                            <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                You've reached your limit of 5 free recasts. Upgrade to Professional to get unlimited recasts, custom AI training, and more.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Link href="/pricing" className="btn-primary w-full py-4 text-center block">
                                Upgrade Now
                            </Link>
                            <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary w-full py-4 text-center">
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Header */}
            <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-surface/80">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-bold font-syne uppercase tracking-tight italic truncate max-w-[200px] md:max-w-md">
                        {recast.video_title || "Processed Recast"}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn-primary py-2 px-4 text-[10px] flex items-center gap-2"
                        >
                            {isSaving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save Changes
                        </button>
                    )}
                    <Link href="/recast" className="btn-secondary py-2 px-4 text-[10px] flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5" />
                        New Recast
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">

                {/* Navigation Tabs */}
                <div className="card bg-surface/50 border-none">
                    <AssetTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        tabs={TABS}
                    />
                </div>

                {/* Tab Content */}
                <div className="flex-1">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-500">
                            <div className="md:col-span-2 space-y-8">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted border-l-2 border-accent pl-4">Summary</h3>
                                    <div className="card p-8 bg-surface/30">
                                        <p className="text-lg leading-relaxed text-text-primary italic font-medium">
                                            {localData?.contentSummary}
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted border-l-2 border-accent pl-4">Key Moments</h3>
                                    <div className="space-y-4">
                                        {localData?.keyMoments?.map((m: any, i: number) => (
                                            <div key={i} className="card p-6 flex flex-col md:flex-row gap-6 hover:bg-elevated transition-colors">
                                                <div className="bg-accent/10 border border-accent/20 px-3 py-1 rounded w-fit h-fit">
                                                    <span className="font-mono text-xs text-accent">{m.timestamp}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="font-mono text-sm text-text-primary">"{m.quote}"</p>
                                                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{m.why}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted border-l-2 border-accent pl-4">Performance Check</h3>
                                    <div className="card p-8 bg-surface/30 space-y-6">
                                        <div className="flex flex-col items-center text-center space-y-2">
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Viral Score</span>
                                            <div className={clsx(
                                                "text-7xl font-black font-syne italic",
                                                localData?.viralScore?.score > 75 ? "text-success" :
                                                    localData?.viralScore?.score > 50 ? "text-accent" : "text-error"
                                            )}>
                                                {localData?.viralScore?.score || "--"}
                                            </div>
                                        </div>
                                        <div className="space-y-4 pt-4 border-t border-border">
                                            <p className="text-xs font-mono text-text-secondary leading-relaxed uppercase">
                                                {localData?.viralScore?.reasoning}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {localData?.viralScore?.suggestions?.map((s: string, i: number) => (
                                                    <span key={i} className="text-[8px] font-mono uppercase tracking-widest bg-success/10 text-success border border-success/20 px-2 py-1 rounded">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === "reel" && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
                            <AssetCard
                                label="The Hook (First 3 Seconds)"
                                value={localData?.shortFormAssets?.instagramReel?.hook}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        instagramReel: { ...localData.shortFormAssets.instagramReel, hook: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Full Script"
                                value={localData?.shortFormAssets?.instagramReel?.script}
                                rows={10}
                                badge={`${Math.round((localData?.shortFormAssets?.instagramReel?.script?.split(' ').length || 0) / 130 * 60)}s EST. DUR`}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        instagramReel: { ...localData.shortFormAssets.instagramReel, script: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Instagram Caption"
                                value={localData?.shortFormAssets?.instagramReel?.captionText}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        instagramReel: { ...localData.shortFormAssets.instagramReel, captionText: val }
                                    }
                                })}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-muted">B-Roll Suggestions</h4>
                                    <ul className="space-y-2">
                                        {localData?.shortFormAssets?.instagramReel?.bRollSuggestions?.map((s: string, i: number) => (
                                            <li key={i} className="card p-4 text-[10px] font-mono text-text-secondary uppercase tracking-widest border-border/40">
                                                {i + 1}. {s}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                                <section className="space-y-4">
                                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Hashtags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {localData?.shortFormAssets?.instagramReel?.hashtags?.map((h: string, i: number) => (
                                            <span key={i} className="text-[10px] font-mono uppercase tracking-widest bg-elevated px-3 py-1.5 rounded-full text-text-primary border border-border">
                                                #{h}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === "blog" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
                            <div className="space-y-12">
                                <AssetCard
                                    label="SEO Title"
                                    value={localData?.blogPost?.title}
                                    type="text"
                                    onChange={(val) => setLocalData({
                                        ...localData,
                                        blogPost: { ...localData.blogPost, title: val }
                                    })}
                                />
                                <AssetCard
                                    label="Meta Description"
                                    value={localData?.blogPost?.metaDescription}
                                    badge={`${localData?.blogPost?.metaDescription?.length || 0}/160`}
                                    onChange={(val) => setLocalData({
                                        ...localData,
                                        blogPost: { ...localData.blogPost, metaDescription: val }
                                    })}
                                />
                                <AssetCard
                                    label="Markdown Content"
                                    value={localData?.blogPost?.fullPost}
                                    rows={25}
                                    onChange={(val) => setLocalData({
                                        ...localData,
                                        blogPost: { ...localData.blogPost, fullPost: val }
                                    })}
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                                    <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-accent">Interactive Preview</h4>
                                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">{localData?.blogPost?.estimatedReadTime}</span>
                                </div>
                                <div className="card p-12 bg-surface/20 min-h-[800px]">
                                    <BlogRenderer markdown={localData?.blogPost?.fullPost} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "short" && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
                            <AssetCard
                                label="Short Title"
                                value={localData?.shortFormAssets?.youtubeShort?.title}
                                type="text"
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        youtubeShort: { ...localData.shortFormAssets.youtubeShort, title: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="The Hook"
                                value={localData?.shortFormAssets?.youtubeShort?.hook}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        youtubeShort: { ...localData.shortFormAssets.youtubeShort, hook: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Full Script"
                                value={localData?.shortFormAssets?.youtubeShort?.script}
                                rows={10}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        youtubeShort: { ...localData.shortFormAssets.youtubeShort, script: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Channel Description"
                                value={localData?.shortFormAssets?.youtubeShort?.description}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        youtubeShort: { ...localData.shortFormAssets.youtubeShort, description: val }
                                    }
                                })}
                            />
                        </div>
                    )}

                    {activeTab === "tiktok" && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
                            <div className="card p-6 bg-accent-dim/10 border-accent/20 flex items-start gap-4">
                                <TrendingUp className="w-5 h-5 text-accent mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">Trend Suggestion</p>
                                    <p className="text-sm italic text-text-primary">{localData?.shortFormAssets?.tiktok?.trendSuggestion}</p>
                                </div>
                            </div>
                            <AssetCard
                                label="The Hook"
                                value={localData?.shortFormAssets?.tiktok?.hook}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        tiktok: { ...localData.shortFormAssets.tiktok, hook: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Native Script"
                                value={localData?.shortFormAssets?.tiktok?.script}
                                rows={10}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        tiktok: { ...localData.shortFormAssets.tiktok, script: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Mobile Caption"
                                value={localData?.shortFormAssets?.tiktok?.caption}
                                badge={`${localData?.shortFormAssets?.tiktok?.caption?.length || 0}/150`}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        tiktok: { ...localData.shortFormAssets.tiktok, caption: val }
                                    }
                                })}
                            />
                        </div>
                    )}

                    {activeTab === "thread" && (
                        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-muted">Twitter Thread</h3>
                                <CopyButton
                                    text={localData?.shortFormAssets?.twitterThread?.tweets?.join('\n\n')}
                                    label="Copy Full Thread"
                                />
                            </div>
                            <div className="space-y-6">
                                {localData?.shortFormAssets?.twitterThread?.tweets?.map((t: string, i: number) => (
                                    <div key={i} className="card p-6 space-y-4">
                                        <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                            <span className="text-[10px] font-mono text-text-muted uppercase">Tweet {i + 1}</span>
                                            <span className={clsx(
                                                "text-[10px] font-mono uppercase",
                                                t.length > 280 ? "text-error" : "text-text-muted"
                                            )}>
                                                {t.length}/280
                                            </span>
                                        </div>
                                        <textarea
                                            value={t}
                                            onChange={(e) => {
                                                const newTweets = [...localData.shortFormAssets.twitterThread.tweets];
                                                newTweets[i] = e.target.value;
                                                setLocalData({
                                                    ...localData,
                                                    shortFormAssets: {
                                                        ...localData.shortFormAssets,
                                                        twitterThread: { ...localData.shortFormAssets.twitterThread, tweets: newTweets }
                                                    }
                                                });
                                            }}
                                            className="w-full bg-transparent border-none p-0 font-mono text-sm focus:ring-0 resize-none leading-relaxed"
                                            rows={Math.ceil(t.length / 50) || 1}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "linkedin" && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
                            <AssetCard
                                label="Opening Line"
                                value={localData?.shortFormAssets?.linkedInPost?.hook}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        linkedInPost: { ...localData.shortFormAssets.linkedInPost, hook: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Post Body"
                                value={localData?.shortFormAssets?.linkedInPost?.body}
                                rows={15}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        linkedInPost: { ...localData.shortFormAssets.linkedInPost, body: val }
                                    }
                                })}
                            />
                            <AssetCard
                                label="Call to Action"
                                value={localData?.shortFormAssets?.linkedInPost?.callToAction}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    shortFormAssets: {
                                        ...localData.shortFormAssets,
                                        linkedInPost: { ...localData.shortFormAssets.linkedInPost, callToAction: val }
                                    }
                                })}
                            />
                        </div>
                    )}

                    {activeTab === "email" && (
                        <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500">
                            <AssetCard
                                label="Subject Line"
                                value={localData?.emailNewsletter?.subjectLine}
                                type="text"
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    emailNewsletter: { ...localData.emailNewsletter, subjectLine: val }
                                })}
                            />
                            <AssetCard
                                label="Preview Text"
                                value={localData?.emailNewsletter?.previewText}
                                badge={`${localData?.emailNewsletter?.previewText?.length || 0}/90`}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    emailNewsletter: { ...localData.emailNewsletter, previewText: val }
                                })}
                            />
                            <AssetCard
                                label="Email Body"
                                value={localData?.emailNewsletter?.body}
                                rows={15}
                                onChange={(val) => setLocalData({
                                    ...localData,
                                    emailNewsletter: { ...localData.emailNewsletter, body: val }
                                })}
                            />
                            <div className="card p-4 bg-accent-dim/10 border-accent/20 flex items-center gap-3">
                                <MessageSquare className="w-4 h-4 text-accent" />
                                <p className="text-[10px] font-mono text-accent uppercase tracking-widest">
                                    Note: [CTA_LINK] is a placeholder for your actual destination.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === "calendar" && (
                        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                            <div className="card overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-elevated border-b border-border">
                                            <th className="p-4 text-left text-[10px] font-mono uppercase tracking-widest text-text-muted">Day</th>
                                            <th className="p-4 text-left text-[10px] font-mono uppercase tracking-widest text-text-muted">Platform</th>
                                            <th className="p-4 text-left text-[10px] font-mono uppercase tracking-widest text-text-muted">Asset</th>
                                            <th className="p-4 text-left text-[10px] font-mono uppercase tracking-widest text-text-muted">Posting Tip</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {localData?.contentCalendar?.map((item: any, i: number) => (
                                            <tr key={i} className="border-b border-border/50 hover:bg-elevated/50 transition-colors">
                                                <td className="p-4 font-mono text-sm text-accent">Day {item.day}</td>
                                                <td className="p-4 font-mono text-xs text-text-primary uppercase tracking-wider">{item.platform}</td>
                                                <td className="p-4 text-sm">
                                                    <button
                                                        onClick={() => {
                                                            const tabId = item.assetKey.toLowerCase().includes('reel') ? 'reel' :
                                                                item.assetKey.toLowerCase().includes('short') ? 'short' :
                                                                    item.assetKey.toLowerCase().includes('tiktok') ? 'tiktok' :
                                                                        item.assetKey.toLowerCase().includes('blog') ? 'blog' :
                                                                            item.assetKey.toLowerCase().includes('email') ? 'email' : 'overview';
                                                            setActiveTab(tabId);
                                                        }}
                                                        className="text-text-secondary hover:text-accent underline underline-offset-4 decoration-accent/30 font-mono text-xs"
                                                    >
                                                        View Asset
                                                    </button>
                                                </td>
                                                <td className="p-4 text-[10px] font-mono text-text-muted uppercase italic tracking-widest">{item.postingTip}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
