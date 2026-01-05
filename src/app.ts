import { Hono } from "hono";
import { cors } from "hono/cors";

import clarifyRoute from "./routes/clarify";
import chatRoute from "./routes/chat";
import healthRoute from "./routes/health";

const app = new Hono();

// CORS
app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.onError((err, c) => {
  console.error("GLOBAL ERROR:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Routes
app.route("/clarify", clarifyRoute);
app.route("/chat", chatRoute);
app.route("/health", healthRoute);

export default app;
