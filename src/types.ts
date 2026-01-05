export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
export type LLMEnv = {
  GEMINI_API_KEY: string;
};

export type ContentType = "chat" | "article" | "code";

export interface ChatContext {
  selectedText: string;
  contextText: string;
  contentType: ContentType;
  pageUrl?: string;
}


