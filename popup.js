const measurementId = 'G-LYTXW6HDHF';
const apiSecret = 'hz-x7LxLSFGLranZorF6Ww';
const clientIdKey = 'ga_client_id';

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
    }).then(res => console.log(`GA4 Event '${name}' sent:`, res.status))
      .catch(err => console.warn(`GA4 Event '${name}' failed:`, err));
  });
}

let clickTimestamps = [];
let totalClicks = 0;
let maxSpeed = 0;
let speedUpdateInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  sendAnalyticsEvent('popup_opened');

  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    totalClicks = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;

    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('maxSpeed').textContent = maxSpeed;

    startSpeedUpdate();
  });

  document.body.addEventListener('click', (event) => {
    const target = event.target;
    const nonCountable = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'];
    if (nonCountable.includes(target.tagName) || target.closest('.ignore-clicks')) return;

    totalClicks++;
    clickTimestamps.push(Date.now());

    chrome.storage.local.set({ clickCount: totalClicks, clickTimestamps });
    document.getElementById('totalClicks').textContent = totalClicks;
  });

  window.addEventListener('beforeunload', () => {
    if (speedUpdateInterval) clearInterval(speedUpdateInterval);
  });
});

function startSpeedUpdate() {
  speedUpdateInterval = setInterval(updateClickSpeed, 1000);
}

function updateClickSpeed() {
  const now = Date.now();
  const recentClicks = clickTimestamps.filter(t => t > now - 1000);
  const speed = recentClicks.length;

  if (speed > maxSpeed) {
    maxSpeed = speed;
    chrome.storage.local.set({ maxSpeed });
    sendAnalyticsEvent('max_speed_updated', { speed: maxSpeed });
  }

  if (speed > 0) {
    document.getElementById('maxSpeed').textContent = maxSpeed;
  }
}