# RECAST — Full Build Prompt
### AI Video Repurposing SaaS — Next.js, Supabase, Whisper, Claude

---

## 1. PROJECT OVERVIEW

Build a production-ready SaaS called **Recast**. It accepts a long-form video (uploaded file, YouTube URL, or TikTok URL), transcribes the audio, and uses Claude to generate a complete multi-platform content bundle: Instagram Reel script, YouTube Short, TikTok script, Twitter/X thread, LinkedIn post, blog post, and email newsletter — plus a 7-day posting calendar.

**Target user:** YouTubers, podcasters, and course creators who produce long-form content and need short-form output without hiring an editor.

**Stack:**
- Framework: Next.js 14 (App Router)
- Auth + DB: Supabase (email/password auth, Postgres)
- Transcription: OpenAI Whisper API (file uploads) + yt-dlp server-side (YouTube/TikTok URLs) with AssemblyAI as fallback
- AI Repurposing: Anthropic Claude (`claude-sonnet-4-20250514`)
- Styling: Tailwind CSS + CSS variables
- Storage: Supabase Storage (for uploaded video files, temp audio extracts)

---

## 2. PROJECT STRUCTURE

```
/app
  /api
    /transcribe-upload/route.ts     — Whisper: handles video file uploads
    /transcribe-url/route.ts        — yt-dlp + Whisper pipeline for URLs
    /transcribe-url-fallback/route.ts — AssemblyAI fallback for URLs
    /repurpose/route.ts             — Claude repurposing call
    /video-meta/route.ts            — YouTube/TikTok oEmbed fetch
  /(auth)
    /login/page.tsx
    /signup/page.tsx
  /(app)
    /dashboard/page.tsx             — history of all past recasts
    /recast/page.tsx                — main ingest + output UI
    /recast/[id]/page.tsx           — saved recast result view
  /layout.tsx
/components
  /ingest/
    ModeToggle.tsx
    UploadZone.tsx
    URLInput.tsx
    TranscriptEditor.tsx
    VoiceSelector.tsx
    ContextFields.tsx
  /processing/
    ProgressScreen.tsx
    WaveformAnimation.tsx
  /dashboard/
    AssetTabs.tsx
    AssetCard.tsx
    BlogRenderer.tsx
    HashtagPills.tsx
    CalendarTable.tsx
    ViralScoreCard.tsx
    CopyButton.tsx
    RegenerateButton.tsx
  /ui/
    Modal.tsx
    Badge.tsx
    Skeleton.tsx
/lib
  supabase.ts                       — client + server Supabase instances
  whisper.ts                        — Whisper API call wrapper
  assemblyai.ts                     — AssemblyAI polling wrapper
  claude.ts                         — Claude API call + JSON parser
  audio.ts                          — WAV encoder, chunking utilities
  ytdlp.ts                          — yt-dlp subprocess wrapper
/middleware.ts                      — Supabase auth session refresh
```

---

## 3. SUPABASE SCHEMA

```sql
-- Users are handled by Supabase Auth (auth.users)

create table public.recasts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  input_type text not null check (input_type in ('upload', 'youtube', 'tiktok')),
  source_url text,
  source_filename text,
  video_title text,
  video_thumbnail_url text,
  transcript text not null,
  transcript_segments jsonb,       -- Whisper verbose_json segments with timestamps
  creator_voice text not null,
  target_audience text,
  primary_goal text,
  topic_context text,
  result jsonb,                    -- Full Claude JSON output
  viral_score integer,
  status text default 'pending' check (status in ('pending', 'transcribing', 'repurposing', 'complete', 'error')),
  error_message text
);

-- RLS: users can only access their own recasts
alter table public.recasts enable row level security;

create policy "Users access own recasts"
  on public.recasts for all
  using (auth.uid() = user_id);

-- Supabase Storage bucket for temp audio files
-- Create bucket named: recast-audio
-- Set to private. Files deleted after 1 hour via a cron or TTL policy.
```

---

## 4. AUTH FLOW

Use Supabase Auth with email/password. Implement using `@supabase/ssr` package for Next.js App Router.

- `/login` and `/signup` pages: minimal centered layout, dark theme matching app aesthetic
- `middleware.ts`: refresh session on every request, redirect unauthenticated users away from `/(app)` routes
- After signup: redirect to `/recast`
- After login: redirect to `/dashboard` if they have past recasts, otherwise `/recast`
- Session stored in cookies via `@supabase/ssr`

Supabase env vars required:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       — server-side only, never exposed to client
```

---

## 5. INGEST UI — `/recast/page.tsx`

### Layout
Full-height centered layout. App name **"RECAST"** top-left. Tagline: *"One video. Everywhere."*

### Mode Toggle
Three options rendered as pill toggle: **Upload** | **YouTube** | **TikTok**

---

### Mode: Upload
- Drag-and-drop zone + click-to-browse
- Accept: `.mp4 .mov .webm .mkv .m4v`
- On file select:
  - Display: filename, file size in MB
  - Extract video duration via hidden `<video>` element: `URL.createObjectURL(file)` → listen for `loadedmetadata` → read `video.duration`
  - Extract thumbnail: seek hidden video to 1 second → draw to `<canvas>` → `canvas.toDataURL('image/jpeg')`
  - Show preview card with thumbnail + title + duration
- Upload file to Supabase Storage (`recast-audio` bucket) via client, get back a signed URL
- Send signed URL to `/api/transcribe-upload` (avoids sending large binary through Next.js)

### Mode: YouTube
- URL input field. Validate regex: `/youtube\.com\/watch\?v=|youtu\.be\//`
- On valid URL, call `/api/video-meta?url={url}` which fetches YouTube oEmbed:
  `https://www.youtube.com/oembed?url={url}&format=json`
- Display preview card: thumbnail, title, channel name
- Auto-transcription triggered immediately after URL confirmed — no manual transcript field shown

### Mode: TikTok
- URL input field. Validate regex: `/tiktok\.com\/@.+\/video\//`
- Call `/api/video-meta?url={url}` which attempts TikTok oEmbed:
  `https://www.tiktok.com/oembed?url={url}`
  — wrap in try/catch, CORS will often block this; if it fails, show a TikTok-branded placeholder card with the URL confirmed
- Auto-transcription triggered immediately after URL confirmed

---

### Shared Fields (all modes)
Render below the source input/preview:

1. **Creator Voice** — styled custom dropdown (not browser default):
   - Casual & Conversational
   - Professional & Authoritative
   - Edgy & Opinionated
   - Educational & Clear
   - Storytelling & Narrative

2. **Target Audience** — short text input. Placeholder: *"e.g. beginner entrepreneurs, fitness women 25-35"*

3. **Primary Goal** — single-select pill group:
   - Grow Following
   - Drive Traffic to Link
   - Sell a Product
   - Build Authority
   - Entertain

4. **Topic/Context** — optional textarea. Placeholder: *"Any extra context about this video? Niche, key message, anything the AI should know."*

---

### CTA Button
**"Recast This →"** — amber, full-width on mobile.

Enabled when:
- Upload mode: file uploaded to storage successfully
- YouTube/TikTok mode: URL validated (oEmbed success or fail — URL alone is enough)
- Creator Voice selected

On click: create a `recasts` row in Supabase with `status: 'transcribing'`, get back the `id`, navigate to `/recast/[id]` where all processing and output happens.

---

## 6. TRANSCRIPTION PIPELINE

All transcription happens via Next.js API routes (server-side). The client polls `/api/recast-status?id={id}` every 3 seconds to get status updates and stream progress to the UI.

---

### Route A: `/api/transcribe-upload/route.ts`
Handles uploaded video files.

```typescript
// Input: { recastId, supabaseSignedUrl }
// 1. Download file from Supabase Storage signed URL
// 2. Extract audio via ffmpeg (must be installed on server):
//    ffmpeg -i input.mp4 -ar 16000 -ac 1 -f wav output.wav
// 3. Check WAV file size — if > 24MB, chunk into 10-minute segments
// 4. For each chunk: POST to Whisper API
// 5. Merge transcripts, offset timestamps
// 6. Update recasts row: transcript, transcript_segments, status: 'repurposing'
// 7. Trigger /api/repurpose
```

Whisper API call:
```typescript
const formData = new FormData();
formData.append('file', wavBlob, 'audio.wav');
formData.append('model', 'whisper-1');
formData.append('response_format', 'verbose_json');
formData.append('timestamp_granularities[]', 'segment');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  body: formData
});
```

Required env var: `OPENAI_API_KEY`

---

### Route B: `/api/transcribe-url/route.ts`
Handles YouTube and TikTok URLs using yt-dlp.

```typescript
// Input: { recastId, url, inputType }
// 1. Run yt-dlp subprocess to extract audio only:
//    yt-dlp -x --audio-format wav --audio-quality 0
//           -o /tmp/recast-{recastId}.wav {url}
// 2. yt-dlp must be installed on the server: pip install yt-dlp
//    or included as a binary in the project: /bin/yt-dlp
// 3. On success: proceed same as Route A from step 3 (chunk check → Whisper)
// 4. On failure (yt-dlp error, geo-block, private video, rate limit):
//    → call /api/transcribe-url-fallback with same recastId + url
```

yt-dlp subprocess:
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

await execAsync(
  `yt-dlp -x --audio-format wav --audio-quality 0 -o "/tmp/recast-${recastId}.%(ext)s" "${url}"`,
  { timeout: 120000 } // 2 min timeout
);
```

Note in prompt: yt-dlp must be available in the deployment environment. For Vercel, this requires a custom Docker image or using a platform that supports arbitrary binaries (Railway, Render, Fly.io recommended). Document this constraint clearly in the README.

---

### Route C: `/api/transcribe-url-fallback/route.ts`
AssemblyAI fallback for when yt-dlp fails.

AssemblyAI accepts a publicly accessible audio URL directly — no binary download needed.

```typescript
// Input: { recastId, url }
// 1. Submit URL to AssemblyAI:
const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
  method: 'POST',
  headers: {
    'Authorization': process.env.ASSEMBLYAI_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audio_url: url,
    auto_chapters: true,       // maps to keyMoments
    auto_highlights: true,     // surfaces key phrases
    sentiment_analysis: true   // useful for tone calibration
  })
});
const { id: assemblyId } = await submitRes.json();

// 2. Poll AssemblyAI every 5 seconds until status === 'completed'
// 3. Map AssemblyAI response to same transcript + segments format as Whisper
// 4. Update recasts row, trigger /api/repurpose
```

AssemblyAI segment format → normalize to match Whisper verbose_json:
```typescript
const normalizedSegments = chapters.map(ch => ({
  start: ch.start / 1000,  // AssemblyAI uses ms, convert to seconds
  end: ch.end / 1000,
  text: ch.summary
}));
```

Required env var: `ASSEMBLYAI_API_KEY`

---

### Fallback Chain Summary
```
URL input
  → yt-dlp audio extract
      → success → Whisper chunked transcription
      → failure → AssemblyAI URL transcription
                    → failure → update status: 'error', store error_message
                                show user: "Couldn't transcribe this video automatically.
                                            Paste your transcript manually below."
                                → show transcript textarea as last resort
```

---

## 7. REPURPOSING PIPELINE — `/api/repurpose/route.ts`

Called automatically after successful transcription. Updates the recast row to `status: 'repurposing'` at start, `status: 'complete'` on success.

### System Prompt
```
You are an expert content strategist, viral content writer, and SEO specialist.
You will receive a video transcript and metadata. Your job is to repurpose it into
a complete multi-platform content bundle.

Return ONLY a valid JSON object matching the schema below. No markdown fences,
no explanation, no preamble. Just the JSON.
```

### User Message Construction
```typescript
const timestampedTranscript = segments
  .map(s => `[${formatSeconds(s.start)}] ${s.text.trim()}`)
  .join('\n');

const userMessage = `
INPUT METADATA:
- Input Type: ${inputType}
- Video Title: ${videoTitle || 'Unknown'}
- Creator Voice: ${creatorVoice}
- Target Audience: ${targetAudience || 'General audience'}
- Primary Goal: ${primaryGoal}
- Additional Context: ${topicContext || 'None'}

TIMESTAMPED TRANSCRIPT:
${timestampedTranscript}
`.trim();
```

### Required JSON Output Schema
```json
{
  "videoTitle": "string — extracted or inferred title",
  "contentSummary": "string — 2-3 sentences summarizing the content",
  "keyMoments": [
    {
      "timestamp": "string — real timestamp from transcript e.g. '5:32'",
      "quote": "string — the actual words spoken at this moment",
      "why": "string — why this moment is shareable or important"
    }
  ],
  "shortFormAssets": {
    "instagramReel": {
      "hook": "string — first 3 seconds, pattern interrupt, no filler",
      "script": "string — 30-60 second spoken word script, punchy",
      "captionText": "string — caption with deliberate line breaks for readability",
      "hashtags": ["string"],
      "callToAction": "string",
      "bRollSuggestions": ["string"]
    },
    "youtubeShort": {
      "hook": "string",
      "script": "string — 60 seconds max, no filler words",
      "title": "string — under 60 chars",
      "description": "string — keyword-rich, under 200 chars",
      "callToAction": "string"
    },
    "tiktok": {
      "hook": "string",
      "script": "string — TikTok native style, conversational, 45-60 seconds",
      "caption": "string — under 150 chars",
      "hashtags": ["string"],
      "trendSuggestion": "string — a format or sound style this could pair with",
      "callToAction": "string"
    },
    "twitterThread": {
      "tweets": ["string"]
    },
    "linkedInPost": {
      "hook": "string — LinkedIn native pattern interrupt first line",
      "body": "string — 150-300 words, line break every 1-2 sentences",
      "callToAction": "string"
    }
  },
  "blogPost": {
    "title": "string — SEO-optimized",
    "metaDescription": "string — under 160 chars",
    "slug": "string — url-friendly",
    "estimatedReadTime": "string — e.g. '6 min read'",
    "fullPost": "string — 800-1200 words in markdown, H2 subheadings, strong intro, actionable body, CTA conclusion"
  },
  "emailNewsletter": {
    "subjectLine": "string",
    "previewText": "string — under 90 chars",
    "body": "string — 200-400 words, conversational, single CTA at end as [CTA_LINK]"
  },
  "contentCalendar": [
    {
      "day": "number 1-7",
      "platform": "string",
      "assetKey": "string — key matching shortFormAssets or blogPost/emailNewsletter",
      "postingTip": "string — platform-specific timing or format tip"
    }
  ],
  "viralScore": {
    "score": "number 0-100",
    "reasoning": "string",
    "weaknesses": ["string"],
    "suggestions": ["string"]
  }
}
```

### Error Handling
- Parse response with `JSON.parse()` inside try/catch
- If parse fails: attempt to extract JSON using `/\{[\s\S]*\}/` regex
- If that fails: store raw response in `result.rawFallback`, surface to user with "Something went wrong with formatting — raw output shown below"
- Always update recast row status — never leave it stuck at 'repurposing'

---

## 8. OUTPUT DASHBOARD — `/recast/[id]/page.tsx`

This page handles both the live processing state (polling) and the completed output state.

### Polling
On mount, if `status !== 'complete'`, poll `/api/recast-status?id={id}` every 3 seconds. Return `{ status, errorMessage }` from a simple Supabase select. Stop polling when status is `complete` or `error`.

### Processing Screen (status: transcribing | repurposing)
Centered card. Animated checklist — each item lights up as status progresses:

```
◉ Uploading source              ← always immediate
◉ Extracting audio              ← transcribing
◉ Transcribing with Whisper     ← transcribing
◉ Analyzing content structure   ← repurposing
◉ Writing short-form scripts    ← repurposing
◉ Building blog + email         ← repurposing
◉ Assembling your bundle        ← repurposing
```

Show below the checklist:
- Animated waveform (5 bars, CSS keyframes, staggered `animation-delay`)
- *"Estimated time: 2-4 minutes depending on video length"*
- Cost estimate: pulled from recast row once transcription completes — calculate as `(audioDurationMinutes * 0.006)` for Whisper + flat `$0.01` for Claude call → *"Estimated API cost: ~$0.42"*

### Completed Output Layout

**Fixed top header:**
- "RECAST" logo left
- Center: video title (truncated) 
- Right: Viral Score badge (green >75, amber 50-75, red <50) + "New Recast" button

**Tab navigation** (horizontally scrollable on mobile):
Overview | Reel | Short | TikTok | Thread | LinkedIn | Blog | Email | Calendar

---

### Tab: Overview
- Video thumbnail (if available) + title + channel
- Content Summary paragraph
- Key Moments list: each row shows timestamp badge (amber pill), quote in quotes, and "why" in muted text
- Viral Score card: large score number, reasoning paragraph, weaknesses as red-tinted pills, suggestions as green-tinted pills

### Tab: Instagram Reel
- Hook (labeled "First 3 seconds")
- Script (editable textarea, shows word count + `Math.round(wordCount / 130 * 60)` seconds estimated duration)
- Caption (editable textarea)
- Hashtags (pill badges, each individually copyable on click)
- B-Roll Suggestions (numbered list)
- CTA
- Copy All button (copies hook + script + caption + hashtags as one formatted block)

### Tab: YouTube Short
- Same structure as Reel tab
- Title field (shows character count, warns at >60)
- Description field

### Tab: TikTok
- Same structure + Trend Suggestion field (styled as an insight card, not editable)

### Tab: Twitter Thread
- Each tweet rendered as its own card with tweet number
- Character count shown per tweet (warns red at >280)
- "Copy All as Thread" button — copies tweets joined by `\n\n`

### Tab: LinkedIn
- Hook (editable, labeled "Opening line")
- Body (editable textarea with character count)
- CTA

### Tab: Blog Post
- Title (editable)
- Meta description (editable, character count, red at >160)
- Slug (editable)
- Read time badge
- Full post rendered as formatted HTML (parse markdown: `##` → `<h2>`, `**text**` → `<strong>`, `\n\n` → paragraph breaks — write a simple parser, no library)
- Toggle between "Preview" and "Markdown Source" views
- "Copy Markdown" button

### Tab: Email
- Subject line (editable)
- Preview text (editable, character count)
- Body (editable textarea)
- Note: `[CTA_LINK]` shown as an amber highlighted placeholder in the body

### Tab: Calendar
7-row table:

| Day | Platform | Content | Tip |
|-----|----------|---------|-----|
| 1   | TikTok   | [link to TikTok tab] | Post 7-9pm EST |

"Link to tab" means clicking the asset name jumps the user to that tab.

---

### Per-Asset Controls (every tab)
- **Copy button** — copies full asset to clipboard, shows "Copied!" for 2 seconds
- **Regenerate button** — fires a targeted Claude API call for just that asset:
  - Sends original transcript + metadata + `"Regenerate ONLY the {assetType}. Return ONLY the JSON object for that asset, no wrapper."`
  - Merges response back into the result object
  - Shows loading spinner on just that tab while regenerating
- **Editable fields** — all text fields use `<textarea>` with `onChange` updating local state
- **"Save Changes"** button (appears when local state diverges from saved state) — PATCHes the recast row `result` column in Supabase

---

## 9. DASHBOARD — `/dashboard/page.tsx`

Authenticated users see their history here.

**Layout:**
- Header: "RECAST" logo + "New Recast" button + user email + sign out
- Grid of recast cards (2 columns desktop, 1 column mobile)

**Each card shows:**
- Video thumbnail (or placeholder icon)
- Video title
- Input type badge (Upload / YouTube / TikTok)
- Created date
- Viral Score badge
- Status badge (complete / error / processing)
- Click → navigate to `/recast/[id]`

**Empty state:** Large centered message — *"No recasts yet. Drop your first video."* with CTA.

Query:
```typescript
const { data } = await supabase
  .from('recasts')
  .select('id, created_at, input_type, video_title, video_thumbnail_url, viral_score, status')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(50);
```

---

## 10. DESIGN SYSTEM

**Aesthetic:** Dark editorial. Newsroom meets audio production software. Not generic purple-gradient SaaS.

**Colors (CSS variables in `globals.css`):**
```css
:root {
  --bg-base: #0d0d0f;
  --bg-surface: #141416;
  --bg-elevated: #1c1c1f;
  --border: rgba(255, 255, 255, 0.07);
  --border-hover: rgba(245, 158, 11, 0.4);
  --accent: #f59e0b;         /* amber */
  --accent-dim: #78350f;
  --text-primary: #faf9f5;   /* warm cream */
  --text-secondary: #9ca3af;
  --text-muted: #4b5563;
  --success: #10b981;
  --error: #ef4444;
}
```

**Typography:**
- Load via `<link>` in `layout.tsx`: `Syne` (display/headings) + `DM Mono` (labels, badges, metadata) from Google Fonts
- Body text: `'Syne', sans-serif` at regular weight
- Labels, timestamps, scores, counts: `'DM Mono', monospace`
- Do not use Inter, Roboto, or system fonts anywhere

**Component patterns:**
- Cards: `background: var(--bg-surface)`, `border: 1px solid var(--border)`, `border-radius: 8px`
- Hover state on cards: `border-color: var(--border-hover)`, `box-shadow: 0 0 20px rgba(245,158,11,0.08)`
- Buttons (primary): amber background, dark text, no border-radius above 4px — sharp not rounded
- Buttons (secondary): transparent, amber border, amber text
- Badges: `DM Mono`, small, tight padding, uppercase, letter-spacing
- Tabs: underline style (not pill/box), amber underline on active
- Textareas: `background: var(--bg-base)`, amber outline on focus, no box-shadow
- Skeleton loaders: `var(--bg-elevated)` with CSS `@keyframes shimmer` animation

**No purple. No gradients on UI chrome. Amber is the only accent color.**

Subtle amber radial gradient only on the processing/loading screen background — nowhere else.

---

## 11. ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI (Whisper)
OPENAI_API_KEY=

# AssemblyAI (fallback transcription)
ASSEMBLYAI_API_KEY=

# Anthropic (Claude)
ANTHROPIC_API_KEY=
```

---

## 12. DEPLOYMENT NOTES

**Recommended platform: Railway or Render** (not Vercel) because:
- yt-dlp requires a binary available in the runtime environment
- ffmpeg required for audio extraction from video files
- Vercel serverless functions don't support arbitrary binaries and have a 10-second default timeout (transcription takes 30-120s)

Railway/Render Dockerfile additions:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg python3-pip
RUN pip3 install yt-dlp
```

If Vercel is required: move transcription to a dedicated microservice (separate Express app on Railway), call it from Next.js API routes as an internal HTTP call.

**Supabase Storage cleanup:** Set up a Supabase Edge Function or pg_cron job to delete audio files from the `recast-audio` bucket older than 2 hours — these are temp files and shouldn't accumulate.

---

## 13. README (include in project)

Document clearly:
- Required env vars and where to get each API key
- yt-dlp + ffmpeg installation requirement
- Deployment platform recommendation and why
- Supabase setup steps (create project, run schema SQL, create storage bucket, enable RLS)
- Local development setup: `npm install && npm run dev`
- Known limitations: TikTok oEmbed is CORS-blocked from browser (handled server-side); very long videos (3hr+) may timeout on transcription — recommend chunking or async job queue for v2
