window.SCOREPAD_DEFAULTS = {
  // Copy this file to local-config.js and set your real webhook.
  // local-config.js is ignored by git.
  slackWebhook: "",
  // Optional: override token auth endpoint (defaults to /.netlify/functions/ably-token)
  ablyAuthUrl: "",
  // Optional: matches Netlify env var LIVE_LINK_WRITE_TOKEN if you want write protection.
  liveLinkWriteToken: ""
};
