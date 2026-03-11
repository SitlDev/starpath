import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "dummy_key_for_build",
});

export async function generateRecast(prompt: string) {
    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4000,
        system: `You are an expert content strategist, viral content writer, and SEO specialist.
You will receive a video transcript and metadata. Your job is to repurpose it into
a complete multi-platform content bundle.

Return ONLY a valid JSON object matching the requested schema. No markdown fences,
no explanation, no preamble. Just the JSON.`,
        messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error("Unexpected response type");

    try {
        return JSON.parse(content.text);
    } catch (e) {
        // Attempt to extract JSON if Claude included extra text
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw e;
    }
}
