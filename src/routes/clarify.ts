import { Router } from "express";
import { ClarifyRequestSchema } from "../schemas/clarify.schema";
import { runClarification } from "../services/llm.service";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = ClarifyRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten(),
    });
  }

  try {
    const answer = await runClarification(parsed.data);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Clarification failed" });
  }
});

export default router;
