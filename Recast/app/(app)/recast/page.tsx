"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModeToggle from "@/components/ingest/ModeToggle";
import UploadZone from "@/components/ingest/UploadZone";
import URLInput from "@/components/ingest/URLInput";
import VoiceSelector from "@/components/ingest/VoiceSelector";
import ContextFields from "@/components/ingest/ContextFields";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Loader2 } from "lucide-react";

type Mode = "upload" | "youtube" | "tiktok";

export default function RecastIngestPage() {
    const router = useRouter();
    const supabase = createClient();

    const [mode, setMode] = useState<Mode>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");
    const [isUrlValid, setIsUrlValid] = useState(false);
    const [voice, setVoice] = useState("");
    const [audience, setAudience] = useState("");
    const [goal, setGoal] = useState("");
    const [context, setContext] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEnabled =
        (mode === "upload" && file !== null) ||
        (mode !== "upload" && isUrlValid) &&
        voice !== "";

    const handleRecast = async () => {
        if (!isEnabled || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let finalUrl = url;
            let filename = null;

            if (mode === "upload" && file) {
                const fileExt = file.name.split('.').pop();
                filename = `${Math.random()}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('recast-audio') // Assuming bucket name from prompt
                    .upload(filename, file);

                if (uploadError) throw uploadError;
            }

            const { data, error } = await supabase
                .from("recasts")
                .insert({
                    user_id: user.id,
                    input_type: mode,
                    source_url: finalUrl || null,
                    source_filename: filename,
                    creator_voice: voice,
                    target_audience: audience,
                    primary_goal: goal,
                    topic_context: context,
                    status: "transcribing", // Start the pipeline
                    transcript: "Processing...", // Placeholder
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Trigger the appropriate transcription pipeline
            if (mode === "upload") {
                // Logic for file upload transcription would go here
                // For now, we manually trigger the repurposing or transcription-upload
                await fetch("/api/transcribe-upload", {
                    method: "POST",
                    body: JSON.stringify({ recastId: data.id }),
                    headers: { "Content-Type": "application/json" },
                }).catch(console.error);
            } else {
                await fetch("/api/transcribe-url", {
                    method: "POST",
                    body: JSON.stringify({ recastId: data.id, url: finalUrl }),
                    headers: { "Content-Type": "application/json" },
                }).catch(console.error);
            }

            router.push(`/recast/${data.id}`);
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-base py-12 px-6">
            <div className="max-w-2xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter font-syne">
                        RECAST
                    </h1>
                    <p className="text-text-secondary font-mono text-xs uppercase tracking-[0.3em]">
                        One video. Everywhere.
                    </p>
                </div>

                {/* Mode Toggle */}
                <ModeToggle activeMode={mode} onModeChange={setMode} />

                {/* Ingest Area */}
                <div className="space-y-8 animate-in fade-in duration-500">
                    {mode === "upload" ? (
                        <UploadZone
                            selectedFile={file}
                            onFileSelect={setFile}
                            onClear={() => setFile(null)}
                        />
                    ) : (
                        <URLInput
                            type={mode}
                            value={url}
                            onURLChange={(val, valid) => {
                                setUrl(val);
                                setIsUrlValid(valid);
                            }}
                        />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <VoiceSelector value={voice} onChange={setVoice} />
                            <ContextFields
                                audience={audience}
                                onAudienceChange={setAudience}
                                goal={goal}
                                onGoalChange={setGoal}
                                context={context}
                                onContextChange={setContext}
                            />
                        </div>

                        <div className="flex flex-col justify-end">
                            <button
                                disabled={!isEnabled || isSubmitting}
                                onClick={handleRecast}
                                className="btn-primary w-full py-6 text-lg flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group h-fit"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Recast This
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
