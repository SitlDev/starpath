# Scalability Roadmap

## 🛑 MIGRATION REQUIRED AT 5 PAID USERS

This application is currently using a **Railway Background Worker Queue** (see `worker.ts`). This is extremely cost-effective for the MVP and prevents Edge Function timeouts/crashes when processing large videos.

**HOWEVER:** FFmpeg and `yt-dlp` are extremely CPU-heavy. 
When we hit > 5 active paid users uploading podcasts, this single-threaded worker will bottleneck and create long queue wait times.

### Action Items for Scaling:
When the platform hits 5-10 paid users, we must migrate the `worker.ts` logic off of Railway and onto a Serverless auto-scaling GPU platform:

*   **Option 1: Modal.com (Recommended)**
    *   **Why:** We can run the exact same pipeline but it gives us an instant Serverless T4/A10G GPU for OpenAI Whisper. This cuts a 10-minute transcription job down to 15 seconds.
    *   **Cost:** ~$0.05 per processed video video (Only charged during execution).
*   **Option 2: Google Cloud Run**
    *   **Why:** You can port the exact TypeScript code (wrapped in a Docker container) and Google Cloud Run will auto-scale to handle 100 simultaneous concurrent users uploading videos at once.

Until we hit that threshold, the `npm run worker` script will safely run in the background on your Railway instance, pulling `.mp4` files and slicing them reliably!
