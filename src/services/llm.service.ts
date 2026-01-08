import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClarifyRequest } from "../schemas/clarify.schema";
import { buildClarifyPrompt } from "../prompts/clarify.prompt";
import { ChatMessage, ChatContext, LLMEnv } from "../types";

/**
 * Minimal env contract for this service
 * This keeps the service runtime-agnostic
 */


function createGenAI(env: LLMEnv) {
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

export async function runClarification(
  input: ClarifyRequest,
  env: LLMEnv
): Promise<string> {
  const genAI = createGenAI(env);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = buildClarifyPrompt(input);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });

  return result.response.text();
}

export async function streamChatResponse(
  messages: ChatMessage[],
  context: ChatContext | undefined,
  onDelta: (text: string) => void,
  env: LLMEnv
): Promise<void> {
  const genAI = createGenAI(env);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const preface = context
    ? [
        {
          role: "user",
          parts: [
            {
              text:
                `You are given page context to help answer the user's question.\n` +
                `Content type: ${context.contentType}\n` +
                (context.pageUrl ? `Page URL: ${context.pageUrl}\n` : "") +
                `Selected Text:\n"""${context.selectedText}"""\n\n` +
                `Context:\n"""${context.contextText}"""\n\n` +
                `Instructions: When the user refers to "this", "the selected text", or similar pronouns, interpret them as referring to the Selected Text above. Use the provided context to disambiguate and explain. Answer directly and concisely, assuming the selected text is the subject unless otherwise specified.\n` +
                `IMPORTANT: do not add multiple "\\n" between paragraphs and points`,
            },
          ],
        },
      ]
    : [];

  const contents = [
    ...preface,
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];

  // Streaming (SDK supports async iteration)
  // @ts-ignore
  const streamed = await model.generateContentStream({
    contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 5000,
    },
  });

  for await (const chunk of streamed.stream) {
    const text = chunk.text();
    if (text) onDelta(text);
  }
}
