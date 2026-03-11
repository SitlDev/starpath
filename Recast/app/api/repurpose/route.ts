import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateRecast } from "@/lib/claude";
import { createClip } from "@/lib/ffmpeg";
import { NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: Request) {
    const supabase = await createServerSupabaseClient();
    const { recastId, videoPath } = await req.json();

    try {
        // 1. Get the recast data
        const { data: recast, error: fetchError } = await supabase
            .from("recasts")
            .select("*")
            .eq("id", recastId)
            .single();

        if (fetchError || !recast) throw new Error("Recast not found");

        // 2. Set status to repurposing
        await supabase
            .from("recasts")
            .update({ status: "repurposing" })
            .eq("id", recastId);

        // 3. Construct prompt
        const segments = recast.transcript_segments as any[];
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

        // 4. Call Claude
        const result = await generateRecast(prompt);

        // 5. Build Video Clip if Video Exists
        if (videoPath && fs.existsSync(videoPath)) {
            try {
                // If we have a key moment, let's clip it (using the first shortform or key moment timestamp)
                // For simplicity, we just extract the first key moment timestamps explicitly if Claude returned them, or parse from string
                // Note: Claude schema was update to include startSeconds / durationSeconds. If not, we fallback.
                const start = result.shortFormAssets?.tiktok?.startSeconds || 0;
                const duration = result.shortFormAssets?.tiktok?.durationSeconds || 30;

                if (start > 0) {
                    const clipPath = `/tmp/clip-${recastId}.mp4`;
                    await createClip(videoPath, clipPath, start, duration);

                    // Upload to Supabase Storage
                    const clipBuffer = fs.readFileSync(clipPath);
                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from('recasts') // Ensure a 'recasts' storage bucket exists
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
                console.error("Clip creation failed:", clipErr);
                // Continue saving text results even if clip fails
            }
            // Cleanup root mp4 video
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        }

        // 6. Update recast with result and complete status
        await supabase
            .from("recasts")
            .update({
                result: result,
                video_title: result.videoTitle || recast.video_title,
                viral_score: result.viralScore?.score || 0,
                status: "complete",
            })
            .eq("id", recastId);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Repurpose error:", err);
        await supabase
            .from("recasts")
            .update({
                status: "error",
                error_message: err.message,
            })
            .eq("id", recastId);

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

function formatSeconds(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}
