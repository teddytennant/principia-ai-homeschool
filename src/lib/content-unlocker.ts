import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function getContent(prompt: string, tier: number) {
  const system = tier === 0
    ? "Give hint only"
    : tier === 1
    ? "Give worked example, no final answer"
    : "Give full solution and deeper analysis";
  return openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ]
  });
}
