import { Hono } from "hono";
import { streamChatResponse } from "../services/llm.service";
import { ChatMessage, ChatContext } from "../types";

const chatRoute = new Hono();

chatRoute.post("/stream", async (c) => {
  const body = await c.req.json<{
    messages: ChatMessage[];
    context?: ChatContext;
  }>();

  const { messages, context } = body;

  // ---------- Validation ----------
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
    return c.json(
      {
        error:
          "Invalid payload. Expect { messages: Array<{ role: 'user'|'assistant', content: string }> }",
      },
      400
    );
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

  // ---------- Streaming ----------
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        await streamChatResponse(
          messages,
          parsedContext,
          async (delta: string) => {
            controller.enqueue(encoder.encode(delta));
          }
        );
      } catch (err) {
        console.error(err);
        controller.enqueue(encoder.encode("\n[STREAM_ERROR]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
});

export default chatRoute;
