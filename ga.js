// ga.js – Google Analytics 4 Measurement Protocol for Chrome Extension

const measurementId = 'G-LYTXW6HDHF';
const apiSecret = 'hz-x7LxLSFGLranZorF6Ww';
const clientIdKey = 'ga_client_id';

// Send event to Google Analytics 4 using Measurement Protocol
function sendAnalyticsEvent(name, params = {}) {
  chrome.storage.local.get(clientIdKey, (result) => {
    let clientId = result[clientIdKey];
    if (!clientId) {
      clientId = crypto.randomUUID();
      chrome.storage.local.set({ [clientIdKey]: clientId });
    }
    const payload = {
      client_id: clientId,
      events: [{ name, params }]
    };
    fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => {
      // Optionally log status for debugging
    }).catch(err => {
      // Optionally log error
    });
  });
}