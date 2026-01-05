import { Hono } from "hono";
import { ClarifyRequestSchema } from "../schemas/clarify.schema";
import { runClarification } from "../services/llm.service";

const clarifyRoute = new Hono();

clarifyRoute.post("/", async (c) => {
  const body = await c.req.json();

  const parsed = ClarifyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        error: "Invalid request",
        details: parsed.error.flatten(),
      },
      400
    );
  }

  try {
    const answer = await runClarification(parsed.data);
    return c.json({ answer });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Clarification failed" }, 500);
  }
});

export default clarifyRoute;
