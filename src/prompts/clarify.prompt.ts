import { ClarifyRequest } from "../schemas/clarify.schema";

function describeContextType(type: ClarifyRequest["contentType"]): string {
  switch (type) {
    case "chat":
      return `
The context is from a conversational explanation.
It may be incomplete or simplified.
You may infer missing details using standard domain knowledge,
but keep the explanation aligned with the conversation topic.
`.trim();

    case "article":
      return `
The context is from an informational article or documentation.
The context may state facts without explaining reasons.
You are allowed to explain WHY something is done
using widely accepted domain knowledge,
as long as it does not contradict the context.
`.trim();

    case "code":
      return `
The context is from source code or code-related content.
Explain intent, behavior, or consequences of the code.
Inference about typical system behavior is allowed.
`.trim();

    default:
      return "";
  }
}

export function buildClarifyPrompt(input: ClarifyRequest): string {
  return `
You are a clarification assistant.

Goal:
Help the user understand a specific concept or statement
by explaining the reason, purpose, or implication behind it.

Context type:
${input.contentType.toUpperCase()}

Situation:
${describeContextType(input.contentType)}

Inference rules:
- The context anchors WHAT is being discussed.
- You MAY explain WHY or HOW using standard, well-known domain knowledge.
- Do NOT invent facts specific to this system beyond general principles.
- If multiple reasons exist, explain the most relevant ones briefly.

Answer rules:
- Answer ONLY the user's question.
- Give a complete answer.
- Do NOT stop mid-sentence.
- End the answer only after the explanation is complete.
- Be concise, precise, and technically accurate.
- Do NOT say "the context does not explain" unless the question
  truly cannot be answered even with general knowledge.

Context:
${input.contextText}

Selected fragment:
"${input.selectedText}"

User question:
${input.question}
`.trim();
}
