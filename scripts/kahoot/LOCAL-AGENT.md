# Local Agent for Kahoot Deploy

This is the bridge that lets the Dashboard page trigger the local Kahoot deployment pipeline.

## How it works

1. Start the local agent:

```bash
npm run agent:local
```

2. Open the Dashboard and use the `Publish` tab in `Kahoot Upload`.

```bash
npm run agent:local
```

Optional overrides:

```bash
export KAHOOT_WEBSITE_ROOT="/absolute/path/to/25maths-website"
export KAHOOT_AGENT_PORT=4318
```

## Why this is needed

A browser page cannot directly execute your local terminal. The page sends a request to `http://127.0.0.1:4318`, and the local agent runs the deployment scripts on your machine.

## Current state

- `deploy-kahoot-upload.mjs` is the end-to-end orchestrator used by the agent.
- `generate-kahoot-artifacts.mjs` builds the prompt files, question-set markdown, cover prompt, and SVG preview.
- `ensure_kahoot_session.py` verifies the persistent Kahoot login session and can wait for manual login.
- `playwright-upload.mjs` is the real uploader wrapper. It delegates to the Python Playwright uploader in `25maths-website`.
- `create_kahoot_challenge_link.py` opens the Kahoot details page, creates a challenge, and captures the final public link.
- `sync-website-links.mjs` backfills `Listing.md`, `kahoot-subtopic-links-working.csv`, and `_data/kahoot_subtopic_links.json`.

## Expected local prerequisites

- `python3`
- `openpyxl`
- `playwright` for Python plus installed Chromium
- a valid Kahoot creator login session in the Python Playwright profile
- sibling repo `25maths-website`, or `KAHOOT_WEBSITE_ROOT` pointing to it

## What the Dashboard can trigger

- generate artifacts and prompts
- verify or refresh the Kahoot login session
- resolve `creator_url` from an existing `challenge_url`
- build import XLSX
- run the Playwright uploader
- create the public `challenge` link for newly uploaded Kahoots
- backfill the website CSV/JSON/listing files when a `challenge_url` is available

## Limitation

The current pipeline can now attempt to create the public `challenge` link automatically after upload. If Kahoot changes the assign/share UI or the login session expires, the fallback mode keeps the browser window open so the operator can finish the final clicks manually while the script captures the returned link.
