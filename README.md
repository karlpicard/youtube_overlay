# youtube_overlay

Simple livestream score overlay with a controller UI and a broadcast overlay view.

## Operator Quick Sheet

Use this before every match.

1. Open `controller.html` and confirm status is `Live`.
2. Confirm channel + auth, then click `Apply Live Settings`.
3. Click `Copy Overlay URL` and paste that exact URL in OBS Browser Source.
4. Tap `+` once for each team and confirm overlay updates in under 1 second.
5. Return score/period to correct pre-game values.
6. Keep controller open and avoid reload/close during the match.

If anything fails:

- `Local mode (no key)`: no key and token auth not available.
- `Local mode`: connection/auth failed.
- OBS mismatch: recopy overlay URL from controller and re-paste in OBS.

## What It Does

- Shows a thin, broadcast-style score bar at the bottom of video.
- Lets you update team names, team colors, score, and match period (1H, 2H, HT, FT).
- Supports real-time sync between devices using Ably.
- Falls back to local browser sync using `localStorage` when real-time is unavailable.
- Keeps a mini preview in the controller so operators can see what viewers should see.

## How It Works

- `controller.html` is the operator interface.
- `overlay.html` is the transparent display you place in Streamlabs as a Browser Source.
- Both pages subscribe/publish on the same channel.
- If you pass `channel`, `ablyKey`, or `ablyAuthUrl` in the URL, both pages persist those values locally for reuse after refresh.
- Controller includes a Live Links panel to generate/copy URLs and post them to Slack via webhook.

## Files

- `controller.html`: Control panel for names, colors, score, and period.
- `overlay.html`: Transparent overlay designed for Streamlabs Browser Source.

## Quick Start

1. Open `controller.html` and `overlay.html` in your browser.
2. Keep both tabs in the same browser/profile for local fallback sync.
3. Add `overlay.html` to Streamlabs as a Browser Source.

## Implementation Guide

### Option 1: Same Device (fast local test)

1. Open `controller.html` in one tab.
2. Open `overlay.html` in a second tab.
3. Update score/team values in the controller.
4. Confirm overlay tab updates.

This mode can work without Ably because both pages can share browser `localStorage`.

### Option 2: Two Devices (recommended for live use)

1. Host both files on a public URL (Netlify Drop works well).
2. Create an Ably app.
3. Preferred (secure): configure token auth with Netlify Function.
4. Open controller with params on device A:
	`https://your-site/controller.html?channel=match-001`
5. Open overlay with matching channel on device B/Streamlabs:
	`https://your-site/overlay.html?channel=match-001`
6. Verify controller status shows `Live`.

### Option 2B: Netlify Token Auth Setup (recommended)

1. In Netlify Site Settings, add environment variable `ABLY_API_KEY` with your Ably API key.
2. Deploy this repo so `netlify/functions/ably-token.js` is available.
3. Use controller/overlay URLs with `channel` only (no client-side API key required).
4. Optional: provide custom token endpoint with `ablyAuthUrl` query param.

### Option 4: Share Live URLs to Slack

1. In `controller.html`, open the `Live Links + Slack` panel.
2. Paste your YouTube viewer URL into `YouTube live stream URL`.
3. Set `Live channel` and `Ably key`, then click `Apply Live Settings`.
4. Paste your Slack incoming webhook URL.
5. Click `Send to Slack`.
6. Optional: enable `Auto-send Slack update when applying settings`.

Slack message includes:

- YouTube live stream URL (primary viewer link)
- overlay URL
- controller URL

### Optional: Local Default Slack Webhook (not committed)

If you want a default webhook value without storing it in the repo:

1. Copy `local-config.example.js` to `local-config.js`.
2. Set your webhook in `local-config.js`:
	`window.SCOREPAD_DEFAULTS = { slackWebhook: "https://hooks.slack.com/services/..." };`
3. Keep `local-config.js` local only. It is gitignored.

You can also set a default token endpoint there:
	`window.SCOREPAD_DEFAULTS = { ablyAuthUrl: "https://your-site/.netlify/functions/ably-token" };`

Load order in controller is:

1. URL param `slackWebhook`
2. Saved `localStorage` value
3. `local-config.js` default

### Option 3: Streamlabs Setup

1. In Streamlabs, add a Browser Source.
2. Paste your hosted `overlay.html` URL (include `channel` and `ablyKey`).
3. Set width/height to your stream resolution (for example 1920x1080).
4. Enable source refresh when needed while testing.
5. Keep `controller.html` open on your control phone/laptop.

## URL Configuration

Both pages support the same query params:

- `channel`: Realtime channel name (default: `scoreboard-overlay-v1`)
- `ablyKey`: Ably API key for realtime sync (legacy/fallback)
- `ablyAuthUrl`: Token auth endpoint URL (default: `/.netlify/functions/ably-token`)
- `youtubeLiveUrl`: Optional YouTube viewer link saved in controller for sharing

Important: for production, prefer token auth (`ablyAuthUrl`) and keep `ABLY_API_KEY` only on the server/Netlify env vars.

Example:

`overlay.html?channel=my-match-1`

Use the same query string on both `controller.html` and `overlay.html`.

If no valid realtime connection is available, the app falls back to local mode using `localStorage` (works when both pages are in the same browser profile on the same machine).

## Troubleshooting

### Controller says Local mode (no key)

- No `ablyKey` is configured and token endpoint is unavailable.
- This is expected for same-browser local testing.
- For cross-device sync, use token auth (`ABLY_API_KEY` in Netlify env) or provide `?ablyKey=...`.

### Controller says Reconnecting

- The device lost internet or Ably connection.
- Check mobile signal/Wi-Fi and disable script/ad blockers.

### Overlay is not updating

- Confirm both pages use the same `channel`.
- Confirm the controller status shows `Live` for realtime mode.
- If status shows `Local mode`, make sure controller and overlay are in the same browser profile.

### Realtime not connecting

- Check internet access and ad/script blockers (they can block the Ably CDN).
- Verify token endpoint is reachable and `ABLY_API_KEY` is set in Netlify.
- If using legacy key mode, verify `ablyKey` is valid and has publish/subscribe permission.
- Open browser devtools and check for network or auth errors.

### Works in browser but not in Streamlabs

- Ensure Streamlabs Browser Source URL exactly matches your tested overlay URL (including query params).
- Disable Streamlabs Browser Source cache while testing updates.
- If using local mode, Streamlabs and controller must share browser storage context; realtime mode is recommended for Streamlabs.

## Ably Quick Links

- Dashboard: https://ably.com/accounts
- API keys docs: https://ably.com/docs/auth/api-keys
- JavaScript quickstart: https://ably.com/docs/getting-started/javascript

## Game Day Preflight

Run this 2-3 minute checklist before going live.

1. Open `controller.html` and verify top-right status shows `Live` (green dot).
2. Confirm `Live channel` and `Ably key` are set, then click `Apply Live Settings`.
3. Click `Copy Overlay URL` and use that exact URL in Streamlabs Browser Source.
4. In Streamlabs, temporarily disable Browser Source cache while validating updates.
5. Press `+` on home and away once, confirm overlay updates in under 1 second.
6. Set score back to correct values and confirm period (`1H/2H/HT/FT`).
7. Verify team names and colors are correct for the match.
8. If using YouTube/Slack links, send one test update and confirm it arrives.
9. Keep controller tab active on operator device and avoid closing/reloading mid-match.

If preflight fails:

- `Local mode (no key)`: apply key/channel again.
- `Local mode`: realtime failed; verify Netlify token function, ABLY_API_KEY, network, and blockers.
- Overlay mismatch in Streamlabs: paste the controller-generated overlay URL again.

## Manual Smoke Checklist (iPhone + Streamlabs)

Run this quick checklist after any update.

1. On iPhone Safari, open `controller.html` and verify all major buttons are fully visible in portrait mode.
2. Set team names with spaces (example: `NEW YORK`) and verify the names persist without punctuation inserts.
3. Set one light team color (`#ffffff`) and one dark team color (`#111111`); verify score text flips to dark/light for readability.
4. Change score and period on iPhone; verify the Streamlabs Browser Source updates in near real time.
5. Refresh only the Streamlabs source and confirm state is restored correctly.
6. Confirm reset flow requires confirmation and fully resets names, score, and period.
