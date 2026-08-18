# AI Business Discovery to POC — Frontend

Next.js interface for the discovery-to-POC pipeline — a chat-driven flow on the left, a document/artifact viewer on the right, styled after Claude's own chat + artifact layout.

## Features

- **Ingestion** — paste text, or upload files/screenshots via the chat input's attach menu.
- **Document viewer** — Doc A, Doc B, Doc C rendered as formatted document cards; the POC rendered as a sandboxed `iframe` preview, with a fullscreen toggle.
- **Doc list / status strip** — shows draft/locked status for each stage (Doc A → Doc B → Doc C → POC).
- **Sidebar** — collapsible (icon-only when collapsed, matching Claude's own sidebar pattern), with a "New Project" action and a list of past sessions.
- **Projects page** (`/projects`) — full list of all sessions with status and delete.
- **Generation detail page** (`/generation/[id]`) — revisit any past session directly by URL, with its own Artifacts panel.
- **Model switcher** — toggle between Anthropic and DeepSeek per request.
- **Human-in-the-loop editing** — once a document is open, the main chat input routes feedback ("remove X", "add a login screen") to the backend's regeneration endpoint for that specific document, rather than treating every message as new raw input.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Styling | Tailwind CSS |
| HTTP | Axios (single configured client) |
| State | React state/context — no external state library |

## Running locally

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to the backend's URL
npm run dev
```

## Environment variables

```
NEXT_PUBLIC_API_URL   # backend base URL (local FastAPI or the deployed Cloud Run URL)
```

## Deployment

Deployed on Vercel, connected directly to this repository — every push to `main` auto-deploys, with preview deployments on other branches/PRs. `NEXT_PUBLIC_API_URL` is set in Vercel's project environment variables to point at the deployed backend.

## Assumptions

- Single-user context — no login/authentication UI.
- The generated POC is a self-contained HTML/React (CDN + Babel Standalone) document rendered via `iframe srcDoc` — an in-browser preview, not a full WebContainer runtime, and not wired to a live backend.
- No persistence beyond what the backend session stores; there is no client-side caching layer.