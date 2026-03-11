import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function downloadAudio(url: string, id: string) {
    const outputDir = "/tmp/recast";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `recast-${id}.mp4`);

    // Download best video (up to 1080p) + best audio, formatted as mp4
    const command = `yt-dlp -f 'bestvideo[ext=mp4][height<=1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=1080]/best' --no-playlist -o "${outputPath}" "${url}"`;

    try {
        const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 min timeout
        console.log("yt-dlp success:", stdout);
        return outputPath;
    } catch (error) {
        console.error("yt-dlp error:", error);
        throw error;
    }
}
