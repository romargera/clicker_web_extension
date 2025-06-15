importScripts('ga.js');

let clickCount = 0;
let clickTimestamps = [];
let maxSpeed = 0;

// Restore stats on startup
chrome.runtime.onStartup.addListener(loadDataFromStorage);

chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Clicker challenge",
    contexts: ["action"]
  });
  sendAnalyticsEvent('extension_installed');
  updateBadge();
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.action.setBadgeBackgroundColor({ color: '#1976d2' });

// Handle toolbar icon click
chrome.action.onClicked.addListener(() => {
  registerClick('toolbar');
});

// Handle icon click from options page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'icon_click') {
    registerClick('options');
    sendResponse({ ok: true });
  } else if (message && message.type === 'reset_stats') {
    resetStats();
    sendResponse({ ok: true });
  }
});

// Handle context menu
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

function registerClick(from) {
  clickCount++;
  const now = Date.now();
  clickTimestamps.push(now);

  // Remove timestamps older than 10 seconds (to avoid memory leak)
  clickTimestamps = clickTimestamps.filter(ts => ts > now - 10000);

  // Calculate true speed (clicks per second with precision)
  const recent = clickTimestamps.filter(ts => ts > now - 1000);
  let speed = 0;
  if (recent.length > 1) {
    const timeWindow = (recent[recent.length - 1] - recent[0]) / 1000;
    speed = timeWindow > 0 ? (recent.length - 1) / timeWindow : recent.length;
  } else {
    speed = recent.length;
  }
  speed = Number(speed.toFixed(2));
  if (speed > maxSpeed) maxSpeed = speed;

  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed });
  updateBadge();
  sendAnalyticsEvent('click', { speed, total_clicks: clickCount, from });
}

function updateBadge() {
  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });
}

function loadDataFromStorage() {
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;
    updateBadge();
  });
}

// Reset all stats (when "reset" is clicked)
function resetStats() {
  clickCount = 0;
  maxSpeed = 0;
  clickTimestamps = [];
  chrome.storage.local.set({ clickCount: 0, clickTimestamps: [], maxSpeed: 0 });
  updateBadge();
  sendAnalyticsEvent('reset_stats', {});
}