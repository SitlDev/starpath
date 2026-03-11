import ffmpeg from 'fluent-ffmpeg';
import installer from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(installer.path);

export function extractAudio(videoPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .noVideo()
            .audioCodec('pcm_s16le')
            .audioFrequency(16000)
            .audioChannels(1)
            .format('wav')
            .on('end', () => resolve(outputPath))
            .on('error', (err: any) => reject(err))
            .save(outputPath);
    });
}

export function createClip(videoPath: string, outputFilePath: string, startTime: number, duration: number): Promise<string> {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .outputOptions('-c:v copy')
            .outputOptions('-c:a copy')
            .on('end', () => resolve(outputFilePath))
            .on('error', (err: any) => reject(err))
            .save(outputFilePath);
    });
}
