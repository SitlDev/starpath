import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy_key_for_build",
});

export async function transcribeAudio(file: Blob) {
    const transcription = await openai.audio.transcriptions.create({
        file: file as any,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
    });

    return transcription;
}
