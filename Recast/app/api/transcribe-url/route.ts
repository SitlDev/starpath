import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { recastId, url } = await req.json();
    const supabase = await createServerSupabaseClient();

    try {
        // Just enqueue the job for the worker! The worker.ts will pick this up
        // since it scans for "pending" with a source_url
        await supabase
            .from("recasts")
            .update({
                source_url: url,
                status: "pending"
            })
            .eq("id", recastId);

        return NextResponse.json({ success: true, queued: true });
    } catch (err: any) {
        console.error("Queue error:", err);
        await supabase
            .from("recasts")
            .update({
                status: "error",
                error_message: `Queue failed: ${err.message}`,
            })
            .eq("id", recastId);

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
