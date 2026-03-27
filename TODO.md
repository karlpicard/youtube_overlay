# TODO - youtube_overlay

## Event Day Priority (Immediate)

- [ ] Stabilize Netlify token-auth function (`/.netlify/functions/ably-token`) and resolve Ably `40101` MAC mismatch.
  - **Root cause**: sign string is missing a trailing `\n` after the last field. Ably spec requires each field terminated with `\n`, including `nonce`.
  - **Fix**: in `netlify/functions/ably-token.js`, change `.join('\n')` → `.join('\n') + '\n'` on the `signText` array.
  - **Secondary check**: confirm `timestamp` is milliseconds (Ably REST API uses ms; `Date.now()` is correct — do NOT convert to seconds).
  - **Secondary check**: confirm `ttl` in sign string matches `ttl` in request body (both should be ms, e.g. `3600000`).
  - **Test after fix**: `curl "https://lincoln-scoreboard.netlify.app/.netlify/functions/ably-token?channel=test-001&role=subscriber"` — expect JSON with `keyName`, `ttl`, `capability`, `clientId`, `timestamp`, `nonce`, `mac`.
- [ ] Keep API-key mode as fallback and document exact operator steps (apply key, copy overlay URL, verify Live).
- [ ] Add a quick pre-game auth check step: hit token endpoint and confirm JSON token response before kickoff.

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
