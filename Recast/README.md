# RECAST — One video. Everywhere.

AI-powered video repurposing SaaS that transforms long-form content into viral clips, threads, blogs, and more.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database/Auth:** Supabase
- **AI:** Anthropic Claude 3.5 Sonnet
- **Transcription:** OpenAI Whisper
- **Media Processing:** FFmpeg + yt-dlp

## Environment Variables
Create a `.env.local` file with the following:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Setup
1. **Supabase Setup:**
   - Create a new project in Supabase.
   - Run the SQL in `schema.sql` to create the `recasts` table and RLS policies.
   - Create a private storage bucket named `recast-audio`.
2. **Local Environment:**
   - Ensure `ffmpeg` and `yt-dlp` are installed on your system.
   - `npm install`
   - `npm run dev`

## Deployment
Recommended platforms: **Railway** or **Render** (due to binary dependencies for ffmpeg and yt-dlp).

On Vercel, you will need to move transcription to a dedicated microservice.
