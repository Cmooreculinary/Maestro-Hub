# Maestro Hub

Maestro Hub is a React and Express command center with tasks, focus sessions,
calendar, vault, wealth, golf, and a server-side Gemini assistant.

## Run locally

1. Run `npm ci`.
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` if AI responses are required.
3. Run `npm run dev`.

## Verification

- Type check: `npm run lint`
- Production build: `npm run build`
- Production server: `npm start`
- Health check: `GET /api/health`

## Render

The included `render.yaml` builds and runs the web service, mounts persistent SQLite
storage at `/var/data`, and prompts for the server-only Gemini key during setup.
