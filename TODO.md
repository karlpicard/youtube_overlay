# TODO - youtube_overlay

## High Priority

- [ ] Replace client-side Ably key usage with token auth or a server-issued capability token.
- [ ] Add in-app diagnostics panel (channel, realtime status, last publish time, last receive time).
- [x] Add a visible warning banner when running in local mode so operators know cross-device sync is off.
- [x] Add input validation/limits for team names and score bounds, including paste edge cases.

## Medium Priority

- [ ] Add optional query param support for default team names and colors.
- [x] Add a one-click "Copy Live URLs" helper in controller for overlay/controller links with current channel.
- [ ] Add reconnection backoff and clearer error text for failed/suspended realtime states.
- [ ] Add support for selecting layout presets (compact/standard).

## Production Readiness

- [ ] Add a small deployment guide for Netlify + cache-busting steps after updates.
- [x] Add game-day checklist to README (preflight test, URL parity check, score reset, stream scene check).
- [x] Add simple manual test checklist covering iPhone + Streamlabs/Browser Source behavior.

## Nice to Have

- [ ] Add keyboard shortcuts for score changes in controller.
- [ ] Add undo for last score action.
- [ ] Add optional possession indicator or event label.
