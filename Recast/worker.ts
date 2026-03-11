import { createClient } from "@supabase/supabase-js";
import { downloadAudio } from "./lib/ytdlp";
import { extractAudio, createClip } from "./lib/ffmpeg";
import { transcribeAudio } from "./lib/whisper";
import { generateRecast } from "./lib/claude";
import fs from "fs";
import { Blob } from "buffer";

// Ensure environment variables are loaded
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function startWorker() {
    console.log("🚀 Starting Recast Background Worker...");

    while (true) {
        try {
            // Find a pending transcription job
            const { data: recasts, error } = await supabase
                .from("recasts")
                .select("*")
                .eq("status", "pending")
                .not("source_url", "is", null)
                .order("created_at", { ascending: true })
                .limit(1);

            if (error) {
                console.error("Error fetching queued recasts:", error);
                await sleep(5000);
                continue;
            }

            if (!recasts || recasts.length === 0) {
                // No jobs in queue
                await sleep(3000);
                continue;
            }

            const activeJob = recasts[0];
            await processJob(activeJob);

        } catch (err) {
            console.error("Worker error:", err);
            await sleep(5000);
        }
    }
}

async function processJob(recast: any) {
    const recastId = recast.id;
    console.log(`\n⏳ Processing Job: ${recastId}`);

    try {
        // 1. Mark as transcribing
        await supabase
            .from("recasts")
            .update({ status: "transcribing" })
            .eq("id", recastId);

        // 2. Download Media via yt-dlp (MP4)
        console.log("   ➤ Downloading video...");
        const videoPath = await downloadAudio(recast.source_url, recastId);

        // 3. Extract Audio for Whisper
        console.log("   ➤ Extracting audio for Whisper...");
        const wavPath = `/tmp/recast-${recastId}.wav`;
        await extractAudio(videoPath, wavPath);

        // 4. Transcribe with Whisper
        console.log("   ➤ Transcribing...");
        const audioBuffer = fs.readFileSync(wavPath);
        const audioBlob = new Blob([audioBuffer], { type: "audio/wav" });
        const transcription = await transcribeAudio(audioBlob as any);

        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);

        // 5. Repurposing Status
        console.log("   ➤ Beginning Claude AI Repurposing...");
        await supabase
            .from("recasts")
            .update({
                transcript: transcription.text,
                transcript_segments: transcription.segments,
                status: "repurposing",
            })
            .eq("id", recastId);

        // Construct Prompt
        const segments = transcription.segments as any[];
        const timestampedTranscript = segments
            .map((s) => `[${formatSeconds(s.start)}] ${s.text.trim()}`)
            .join("\n");

        const prompt = `
INPUT METADATA:
- Input Type: ${recast.input_type}
- Video Title: ${recast.video_title || "Unknown"}
- Creator Voice: ${recast.creator_voice}
- Target Audience: ${recast.target_audience || "General audience"}
- Primary Goal: ${recast.primary_goal}
- Additional Context: ${recast.topic_context || "None"}

TIMESTAMPED TRANSCRIPT:
${timestampedTranscript}

REQUIRED SCHEMA:
{
  "videoTitle": "string",
  "contentSummary": "string",
  "keyMoments": [{ "timestamp": "string", "quote": "string", "why": "string" }],
  "shortFormAssets": {
    "instagramReel": { "hook": "string", "script": "string", "captionText": "string", "hashtags": ["string"], "callToAction": "string", "bRollSuggestions": ["string"] },
    "youtubeShort": { "hook": "string", "script": "string", "title": "string", "description": "string", "callToAction": "string" },
    "tiktok": { "startSeconds": 0, "durationSeconds": 0, "hook": "string", "script": "string", "caption": "string", "hashtags": ["string"], "trendSuggestion": "string", "callToAction": "string" },
    "twitterThread": { "tweets": ["string"] },
    "linkedInPost": { "hook": "string", "body": "string", "callToAction": "string" }
  },
  "blogPost": { "title": "string", "metaDescription": "string", "slug": "string", "estimatedReadTime": "string", "fullPost": "string" },
  "emailNewsletter": { "subjectLine": "string", "previewText": "string", "body": "string" },
  "contentCalendar": [{ "day": 1, "platform": "string", "assetKey": "string", "postingTip": "string" }],
  "viralScore": { "score": 85, "reasoning": "string", "weaknesses": ["string"], "suggestions": ["string"] }
}
`.trim();

        // Call Claude
        const result = await generateRecast(prompt);

        // 6. Slicing Video (if available)
        console.log("   ➤ Generating Video Clip...");
        if (videoPath && fs.existsSync(videoPath)) {
            try {
                const start = result.shortFormAssets?.tiktok?.startSeconds || 0;
                const duration = result.shortFormAssets?.tiktok?.durationSeconds || 30;

                if (start > 0) {
                    const clipPath = `/tmp/clip-${recastId}.mp4`;
                    await createClip(videoPath, clipPath, start, duration);

                    const clipBuffer = fs.readFileSync(clipPath);
                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from('recasts')
                        .upload(`${recastId}/tiktok.mp4`, clipBuffer, {
                            contentType: 'video/mp4',
                            upsert: true
                        });

                    if (!uploadError && uploadData) {
                        const { data: { publicUrl } } = supabase.storage.from('recasts').getPublicUrl(`${recastId}/tiktok.mp4`);
                        result.shortFormAssets.tiktok.videoUrl = publicUrl;
                    }
                    if (fs.existsSync(clipPath)) fs.unlinkSync(clipPath);
                }
            } catch (clipErr) {
                console.error("   ➤ Clip creation failed:", clipErr);
            }
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }

        // 7. Mark as Complete
        console.log("   ✅ Job Complete!");
        await supabase
            .from("recasts")
            .update({
                result: result,
                video_title: result.videoTitle || recast.video_title,
                viral_score: result.viralScore?.score || 0,
                status: "complete",
            })
            .eq("id", recastId);

    } catch (err: any) {
        console.error("   ❌ Job Failed:", err.message);
        await supabase
            .from("recasts")
            .update({
                status: "error",
                error_message: err.message || "Unknown error occurred",
            })
            .eq("id", recastId);
    }
}

function formatSeconds(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

startWorker().catch(console.error);
