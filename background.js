importScripts('ga.js');

let clickCount = 0;
let clickTimestamps = [];
let maxSpeed = 0;
let unsavedClickCount = 0;
const SAVE_INTERVAL = 10;
let dailySessions = [];
let dailyClicksSessions = [];

// Set badge background color
chrome.action.setBadgeBackgroundColor({ color: '#1976d2' });

// Load stats and initialize badge on startup/install
chrome.runtime.onStartup.addListener(loadDataFromStorage);
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Show Stats",
    contexts: ["action"]
  });
  sendAnalyticsEvent('extension_installed');
  updateBadge();
});

// Count click when user left-clicks extension icon
chrome.action.onClicked.addListener(() => {
  handleClick('toolbar');
});

// Count click when user clicks extension icon in options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'icon_click') {
    handleClick('options');
    sendResponse({ ok: true });
  }
});

// Main click handler: update stats and send event to GA4
function handleClick(origin) {
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

  updateBadge();
  sendAnalyticsEvent('click', { speed, total_clicks: clickCount, from: origin });
}

// Update extension badge with click count
function updateBadge() {
  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });
}

// Load all stats from local storage
function loadDataFromStorage() {
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed', 'dailySessions', 'dailyClicksSessions'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;
    dailySessions = result.dailySessions || [];
    dailyClicksSessions = result.dailyClicksSessions || [];
    updateBadge();
  });
}

// Track new day sessions for stats
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

// Calculate click speed (clicks per second)
function calculateCurrentSpeed() {
  const now = Date.now();
  return clickTimestamps.filter(t => t > now - 1000).length;
}

// Save stats to local storage
function saveDataToStorage() {
  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed, dailySessions, dailyClicksSessions });
}

// Periodically save unsaved click stats
setInterval(() => {
  if (unsavedClickCount > 0) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }
}, 5000);