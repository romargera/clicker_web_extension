importScripts('ga.js');

let clickCount = 0;
let clickTimestamps = [];
let maxSpeed = 0;
let unsavedClickCount = 0;
const SAVE_INTERVAL = 10;

// On install: add context menu and open options page
chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Clicker challenge",
    contexts: ["action"]
  });
  sendAnalyticsEvent('extension_installed');
  updateBadge();
  // Open options page automatically on install
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
});

// Set badge background color
chrome.action.setBadgeBackgroundColor({ color: '#1976d2' });

// Restore stats on startup
chrome.runtime.onStartup.addListener(loadDataFromStorage);

// Main click logic: toolbar icon
chrome.action.onClicked.addListener(() => {
  registerClick('toolbar');
});

// Message from options page: icon click
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'icon_click') {
    registerClick('options');
    sendResponse({ ok: true });
  }
});

// Handle context menu: open options page
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

// Save and update stats for a click
function registerClick(from) {
  clickCount++;
  const now = Date.now();
  clickTimestamps.push(now);

  // Limit clickTimestamps size for performance
  if (clickTimestamps.length > 5000) {
    clickTimestamps = clickTimestamps.slice(-1000);
  }

  // Calculate click speed in last second
  const speed = clickTimestamps.filter(t => t > now - 1000).length;
  if (speed > maxSpeed) maxSpeed = speed;

  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed });
  updateBadge();
  sendAnalyticsEvent('click', { speed, total_clicks: clickCount, from });
}

// Update the badge with current click count
function updateBadge() {
  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });
}

// Restore stats from local storage
function loadDataFromStorage() {
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;
    updateBadge();
  });
}