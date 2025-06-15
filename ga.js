// background.js – Click tracking logic with GA4 Measurement Protocol

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

let clickCount = 0;
let clickTimestamps = [];
let maxSpeed = 0;
let unsavedClickCount = 0;
const SAVE_INTERVAL = 10;
let uniqueID;
let dailySessions = [];
let dailyClicksSessions = [];

chrome.runtime.onStartup.addListener(() => {
  loadDataFromStorage();
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Show Stats",
    contexts: ["action"]
  });
  sendAnalyticsEvent('extension_installed');
});

chrome.action.onClicked.addListener(() => {
  clickCount++;
  unsavedClickCount++;
  const now = Date.now();
  clickTimestamps.push(now);

  updateDailySessions(now);

  const speed = calculateCurrentSpeed();
  if (speed > maxSpeed) maxSpeed = speed;

  if (unsavedClickCount >= SAVE_INTERVAL) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }

  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });

  sendAnalyticsEvent('click', { speed, total_clicks: clickCount });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

function loadDataFromStorage() {
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed', 'dailySessions', 'dailyClicksSessions'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;
    dailySessions = result.dailySessions || [];
    dailyClicksSessions = result.dailyClicksSessions || [];
  });
}

function updateDailySessions(currentTime) {
  const today = new Date().toDateString();
  const lastSession = dailySessions[dailySessions.length - 1];
  if (!lastSession || new Date(lastSession).toDateString() !== today) {
    dailySessions.push(currentTime);
  }
  if (clickCount > 0) {
    if (!dailyClicksSessions.length || new Date(dailyClicksSessions[dailyClicksSessions.length - 1]).toDateString() !== today) {
      dailyClicksSessions.push(currentTime);
    }
  }
}

function calculateCurrentSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;
  const recentClicks = clickTimestamps.filter(t => t > oneSecondAgo);
  return recentClicks.length;
}

function saveDataToStorage() {
  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed, dailySessions, dailyClicksSessions });
}

setInterval(() => {
  if (unsavedClickCount > 0) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }
}, 5000);