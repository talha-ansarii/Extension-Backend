import { Router } from "express";
import { streamChatResponse } from "../services/llm.service";
import { ChatMessage, ChatContext } from "../types";

const router = Router();

router.post("/stream", async (req, res) => {
  const { messages, context } = req.body as {
    messages: ChatMessage[];
    context?: ChatContext;
  };

  if (
    !Array.isArray(messages) ||
    !messages.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0
    )
  ) {
    return res.status(400).json({
      error:
        "Invalid payload. Expect { messages: Array<{ role: 'user'|'assistant', content: string }> }",
    });
  }

  let parsedContext: ChatContext | undefined = undefined;
  if (context) {
    const validContentType =
      context.contentType === "chat" ||
      context.contentType === "article" ||
      context.contentType === "code";
    if (
      typeof context.selectedText === "string" &&
      context.selectedText.length > 0 &&
      typeof context.contextText === "string" &&
      context.contextText.length > 0 &&
      validContentType
    ) {
      parsedContext = {
        selectedText: context.selectedText,
        contextText: context.contextText,
        contentType: context.contentType,
        pageUrl:
          typeof context.pageUrl === "string" && context.pageUrl.length > 0
            ? context.pageUrl
            : undefined,
      };
    }
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    await streamChatResponse(messages, parsedContext, async (delta) => {
      res.write(delta);
    });
  } catch (err) {
    console.error(err);
    res.write("\n[STREAM_ERROR]");
  } finally {
    res.end();
  }
});

export default router;


