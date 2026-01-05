import { Hono } from "hono";
import { cors } from "hono/cors";

import clarifyRoute from "./routes/clarify";
import chatRoute from "./routes/chat";

const app = new Hono();

// CORS
app.use(
  "*",
  cors({
    origin: "*",
  })
);

// Routes
app.route("/clarify", clarifyRoute);
app.route("/chat", chatRoute);

export default app;
