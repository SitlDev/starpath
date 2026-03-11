import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    try {
        // Basic oEmbed fetch for YouTube
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
            const res = await fetch(oEmbedUrl);
            const data = await res.json();

            return NextResponse.json({
                title: data.title,
                thumbnail_url: data.thumbnail_url,
                author_name: data.author_name,
            });
        }

        // Basic TikTok oEmbed
        if (url.includes("tiktok.com")) {
            const oEmbedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
            const res = await fetch(oEmbedUrl);
            const data = await res.json();

            return NextResponse.json({
                title: data.title,
                thumbnail_url: data.thumbnail_url,
                author_name: data.author_name,
            });
        }

        return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({
            title: "Video Link Confirmed",
            thumbnail_url: null,
            author_name: null
        });
    }
}
