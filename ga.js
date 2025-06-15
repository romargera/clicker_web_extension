// ga.js – Google Analytics 4 Measurement Protocol for Chrome Extension

const measurementId = 'G-QZFK45L6QD';  
const apiSecret = 'EwnsTPkcSLqxzEKrETe2aA'; 
const clientIdKey = 'ga_client_id';

// Send event to Google Analytics 4 using Measurement Protocol
function sendAnalyticsEvent(name, params = {}) {
    chrome.storage.local.get(clientIdKey, (result) => {
      let clientId = result[clientIdKey];
      if (!clientId) {
        clientId = crypto.randomUUID();
        chrome.storage.local.set({ [clientIdKey]: clientId });
      }
      params.debug_mode = true; // Для DebugView
      const payload = {
        client_id: clientId,
        events: [{ name, params }]
      };
      fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(res => {
        // Можно добавить логирование статуса, если нужно
        // console.log('GA4 send status', res.status);
      }).catch(err => {
        // console.log('GA4 error', err);
      });
    });
  }