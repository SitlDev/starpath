import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export async function extractAudioFromFile(inputPath: string, id: string) {
    const outputDir = "/tmp/recast";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `upload-${id}.wav`);

    // ffmpeg extract audio: mono, 16k sample rate (good for transcription)
    const command = `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -f wav "${outputPath}"`;

    try {
        await execAsync(command);
        return outputPath;
    } catch (error) {
        console.error("FFmpeg error:", error);
        throw error;
    }
}

export async function splitAudio(filePath: string) {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    // OpenAI Whisper limit is 25MB. We'll chunk if > 24MB.
    if (fileSizeInMB <= 24) {
        return [filePath];
    }

    // Implementation for chunking would go here for production.
    // For now, return the file and document the limitation in README.
    return [filePath];
}
