import express from "express";
import cors from "cors";
import clarifyRoute from "./routes/clarify";
import chatRoute from "./routes/chat";

export const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "20kb" }));

app.use("/clarify", clarifyRoute);
app.use("/chat", chatRoute);
