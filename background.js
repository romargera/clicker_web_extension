importScripts('ga.js');

// Badge color
chrome.action.setBadgeBackgroundColor({ color: '#1976d2' });

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

// Handle toolbar icon click
chrome.action.onClicked.addListener(() => {
  registerClick('toolbar');
});

// Handle icon click from options page or reset
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'icon_click') {
    registerClick('options').then(() => sendResponse({ ok: true }));
    return true; // keep message channel open for async
  } else if (message && message.type === 'reset_stats') {
    resetStats().then(() => sendResponse({ ok: true }));
    return true;
  }
});

// Handle context menu
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

function updateBadge(count) {
  const displayCount = count > 999 ? '999+' : count.toString();
  chrome.action.setBadgeText({ text: displayCount });
}

// Always loads latest stats, updates, and writes back to storage
async function registerClick(from) {
  // Get last stats from storage
  const result = await new Promise(resolve => chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], resolve));
  let clickCount = result.clickCount || 0;
  let clickTimestamps = result.clickTimestamps || [];
  let maxSpeed = result.maxSpeed || 0;

  clickCount++;
  const now = Date.now();
  clickTimestamps.push(now);

  // Remove old timestamps (keep last 10s only, not total!)
  clickTimestamps = clickTimestamps.filter(ts => ts > now - 10000);

  // Calculate speed (real, float, two decimals)
  const recent = clickTimestamps.filter(ts => ts > now - 1000);
  let speed = 0;
  if (recent.length > 1) {
    const windowMs = recent[recent.length - 1] - recent[0];
    speed = windowMs > 0 ? (recent.length - 1) / (windowMs / 1000) : recent.length;
  } else {
    speed = recent.length;
  }
  speed = Number(speed.toFixed(2));
  if (speed > maxSpeed) maxSpeed = speed;

  // Save all back to storage
  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed });
  updateBadge(clickCount);
  sendAnalyticsEvent('click', { speed, total_clicks: clickCount, from });
}

// Also loads stats before reset (for consistency)
async function resetStats() {
  chrome.storage.local.set({ clickCount: 0, clickTimestamps: [], maxSpeed: 0 });
  updateBadge(0);
  sendAnalyticsEvent('reset_stats', {});
}

// On startup (for badge)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['clickCount'], (result) => {
    updateBadge(result.clickCount || 0);
  });
});

chrome.runtime.onInstalled.addListener(() => {
  sendAnalyticsEvent('debug_test', { manual: true });
});