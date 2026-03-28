// Archived controller additions for the removed live-link landing page feature.
// Restore these fragments into controller.html if the feature is brought back.

const urlLiveLinkToken = (params.get('liveLinkToken') || '').trim();
const runtimeDefaultLiveLinkToken = String(runtimeDefaults.liveLinkWriteToken || '').trim();

if (urlLiveLinkToken) safeStorageSet('liveLinkWriteToken', urlLiveLinkToken);

let currentLiveLinkWriteToken = urlLiveLinkToken || safeStorageGet('liveLinkWriteToken') || runtimeDefaultLiveLinkToken || '';

function buildLiveLinkEndpoint() {
  return new URL('/.netlify/functions/live-link', window.location.href).toString();
}

async function publishYoutubeLiveLink() {
  if (!currentYoutubeLiveUrl) {
    return { skipped: true };
  }

  const headers = { 'Content-Type': 'application/json' };
  if (currentLiveLinkWriteToken) headers['X-Live-Link-Token'] = currentLiveLinkWriteToken;

  const response = await fetch(buildLiveLinkEndpoint(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: currentYoutubeLiveUrl })
  });

  if (!response.ok) {
    let message = 'Landing page update failed.';
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (e) {}
    throw new Error(message);
  }

  return response.json();
}

// In sendYoutubeLiveToSlack(), replace the success status with:
// try {
//   await publishYoutubeLiveLink();
//   setLiveStatus('YouTube live link sent to Slack and published on the site home page.');
// } catch (error) {
//   setLiveStatus('Slack send requested, but home page link update failed. ' + error.message);
// }

// In sendSlackUpdate(), after the Slack fetch succeeds, replace the success status with:
// if (!currentYoutubeLiveUrl) {
//   setLiveStatus('Slack webhook request sent.');
//   return;
// }
// try {
//   await publishYoutubeLiveLink();
//   setLiveStatus('Slack webhook request sent and site home page updated.');
// } catch (error) {
//   setLiveStatus('Slack webhook request sent, but home page link update failed. ' + error.message);
// }