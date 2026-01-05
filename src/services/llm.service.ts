import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClarifyRequest } from "../schemas/clarify.schema";
import { buildClarifyPrompt } from "../prompts/clarify.prompt";
import { ChatMessage, ChatContext } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runClarification(input: ClarifyRequest): Promise<string> {
  const prompt = buildClarifyPrompt(input);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });

  const response = result.response;
  return response.text();
}

export async function streamChatResponse(
  messages: ChatMessage[],
  context: ChatContext | undefined,
  onDelta: (text: string) => void
): Promise<void> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const preface =
    context
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
                  "IMPORTANT: " +
                  `do not add multiple "\n" between paragraphs and points`
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

  // @ts-ignore - generateContentStream is available in the SDK version used
  const streamed = await model.generateContentStream({
    contents,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });

  for await (const chunk of streamed.stream) {
    const text = chunk.text();
    if (text) onDelta(text);
  }
}
