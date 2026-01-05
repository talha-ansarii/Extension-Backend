# Small GPT Backend

A lightweight, Hono-based backend service for the Small GPT extension.

## Features

- **Contextual Clarification**: Analyze selected text within its surrounding context to provide precise explanations using `/clarify`.
- **Streaming Chat**: Real-time conversational interface with `/chat/stream`.
- **Health Check**: Simple status monitoring via `/health`.

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Fast, lightweight web standard edge-first framework.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Generative AI](https://ai.google.dev/) (Gemini Flash 2.0)
- **Runtime/Platform**: Node.js / Cloudflare Workers (via Wrangler)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm
- A Google Gemini API Key

## Setup

1. **Clone the repository** (if applicable) and navigate to the backend directory.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

## Development

To run the development server with hot reloading:

```bash
npm run dev
```

The server will typically start on `http://localhost:8787` (default for Wrangler/Hono).

## Build and Start

To build the project:

```bash
npm run build
```

To start the built application:

```bash
npm start
```

## API Endpoints

### `POST /clarify`
Generates a clarification for a specific text selection.

**Body:**
```json
{
  "selectedText": "string",
  "contextText": "string",
  "contentType": "chat" | "article" | "code",
  "question": "string",
  "pageUrl": "string (optional)"
}
```

### `POST /chat/stream`
Streams a chat response based on a history of messages.

**Body:**
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "context": {
    "selectedText": "...",
    "contextText": "...",
    "contentType": "...",
    "pageUrl": "..."
  }
}
```

### `GET /health`
Returns the service status.
```json
{ "status": "ok" }
```
