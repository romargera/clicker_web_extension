importScripts('ga.js');

let clickCount = 0;
let clickTimestamps = [];
let maxSpeed = 0;
let unsavedClickCount = 0;
const SAVE_INTERVAL = 10;

// Open Options once installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Clicker challenge",
    contexts: ["action"]
  });
  sendAnalyticsEvent('extension_installed');
  updateBadge();

  // Open options page on install
  chrome.runtime.openOptionsPage();
});

// Set badge color
chrome.action.setBadgeBackgroundColor({ color: '#1976d2' });

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

// Main logic: left click increments counter, saves to storage, updates badge and GA4
chrome.action.onClicked.addListener(() => {
  clickCount++;
  unsavedClickCount++;
  const now = Date.now();
  clickTimestamps.push(now);

  const speed = calculateCurrentSpeed();
  if (speed > maxSpeed) maxSpeed = speed;

  if (unsavedClickCount >= SAVE_INTERVAL) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }

  updateBadge();
  sendAnalyticsEvent('click', { speed, total_clicks: clickCount });
});

// Context menu to open options page
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

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

function calculateCurrentSpeed() {
  const now = Date.now();
  return clickTimestamps.filter(t => t > now - 1000).length;
}

function saveDataToStorage() {
  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed });
}

setInterval(() => {
  if (unsavedClickCount > 0) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }
}, 5000);