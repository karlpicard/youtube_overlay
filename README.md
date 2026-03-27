# youtube_overlay

Simple livestream score overlay with a controller UI and a broadcast overlay view.

## What It Does

- Shows a thin, broadcast-style score bar at the bottom of video.
- Lets you update team names, team colors, score, and match period (1H, 2H, HT, FT).
- Supports real-time sync between devices using Ably.
- Falls back to local browser sync using `localStorage` when real-time is unavailable.
- Keeps a mini preview in the controller so operators can see what viewers should see.

## How It Works

- `controller.html` is the operator interface.
- `overlay.html` is the transparent display you place in OBS/Streamlabs/browser source.
- Both pages subscribe/publish on the same channel.
- If you pass `channel` and `ablyKey` in the URL, both pages persist those values locally for reuse after refresh.
- Controller includes a Live Links panel to generate/copy URLs and post them to Slack via webhook.

## Files

- `controller.html`: Control panel for names, colors, score, and period.
- `overlay.html`: Transparent overlay designed for OBS/browser source.

## Quick Start

1. Open `controller.html` and `overlay.html` in your browser.
2. Keep both tabs in the same browser/profile for local fallback sync.
3. Add `overlay.html` to OBS as a Browser Source.

## Implementation Guide

### Option 1: Same Device (fast local test)

1. Open `controller.html` in one tab.
2. Open `overlay.html` in a second tab.
3. Update score/team values in the controller.
4. Confirm overlay tab updates.

This mode can work without Ably because both pages can share browser `localStorage`.

### Option 2: Two Devices (recommended for live use)

1. Host both files on a public URL (Netlify Drop works well).
2. Create an Ably app/key.
3. Open controller with params on device A:
	`https://your-site/controller.html?channel=match-001&ablyKey=YOUR_KEY`
4. Open overlay with the same params on device B/OBS:
	`https://your-site/overlay.html?channel=match-001&ablyKey=YOUR_KEY`
5. Verify controller status shows `Live`.

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

### Option 3: OBS/Stream Setup

1. In OBS, add a Browser Source.
2. Paste your hosted `overlay.html` URL (include `channel` and `ablyKey`).
3. Set width/height to your stream resolution (for example 1920x1080).
4. Enable source refresh when needed while testing.
5. Keep `controller.html` open on your control phone/laptop.

## URL Configuration

Both pages support the same query params:

- `channel`: Realtime channel name (default: `scoreboard-overlay-v1`)
- `ablyKey`: Ably API key for realtime sync
- `youtubeLiveUrl`: Optional YouTube viewer link saved in controller for sharing

Important: cross-device sync requires a valid `ablyKey` you control. If no key is set, the app runs in local mode only.

Example:

`overlay.html?channel=my-match-1&ablyKey=YOUR_ABLY_KEY`

Use the same query string on both `controller.html` and `overlay.html`.

If no valid realtime connection is available, the app falls back to local mode using `localStorage` (works when both pages are in the same browser profile on the same machine).

## Troubleshooting

### Controller says Local mode (no key)

- No `ablyKey` is configured.
- This is expected for same-browser local testing.
- For cross-device sync, open both pages with `?channel=...&ablyKey=...`.

### Controller says Reconnecting

- The device lost internet or Ably connection.
- Check mobile signal/Wi-Fi and disable script/ad blockers.

### Overlay is not updating

- Confirm both pages use the same `channel`.
- Confirm the controller status shows `Live` for realtime mode.
- If status shows `Local mode`, make sure controller and overlay are in the same browser profile.

### Realtime not connecting

- Check internet access and ad/script blockers (they can block the Ably CDN).
- Verify `ablyKey` is valid and has permission to publish/subscribe.
- Open browser devtools and check for network or auth errors.

### Works in browser but not in OBS

- Ensure OBS Browser Source URL exactly matches your tested overlay URL (including query params).
- Disable OBS source cache while testing updates.
- If using local mode, OBS and controller must share browser storage context; realtime mode is recommended for OBS.

## Game Day Preflight

Run this 2-3 minute checklist before going live.

1. Open `controller.html` and verify top-right status shows `Live` (green dot).
2. Confirm `Live channel` and `Ably key` are set, then click `Apply Live Settings`.
3. Click `Copy Overlay URL` and use that exact URL in OBS Browser Source.
4. In OBS, temporarily disable Browser Source cache while validating updates.
5. Press `+` on home and away once, confirm overlay updates in under 1 second.
6. Set score back to correct values and confirm period (`1H/2H/HT/FT`).
7. Verify team names and colors are correct for the match.
8. If using YouTube/Slack links, send one test update and confirm it arrives.
9. Keep controller tab active on operator device and avoid closing/reloading mid-match.

If preflight fails:

- `Local mode (no key)`: apply key/channel again.
- `Local mode`: key present but realtime failed; verify key/app, network, and blockers.
- Overlay mismatch in OBS: paste the controller-generated overlay URL again.
