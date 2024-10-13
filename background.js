let clickCount = 0;
let clickTimestamps = [];

// Load data from storage when extension starts
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['clickCount', 'clickTimestamps'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    console.log('Data loaded on install:', clickCount, clickTimestamps);
  });
});

chrome.action.onClicked.addListener(() => {
  // Increment the click count and store the timestamp
  clickCount++;
  clickTimestamps.push(Date.now());

  // Save the updated data to chrome.storage.local
  chrome.storage.local.set({ clickCount, clickTimestamps }, () => {
    console.log('Click count and timestamps saved:', clickCount, clickTimestamps);
  });

  // Update badge display with click count
  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });
});

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openStats",
    title: "My Stats",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "openOptions",
    title: "Open Clicker Options",
    contexts: ["action"]
  });
});

// Handle right-click context menu
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  } else if (info.menuItemId === "openStats") {
    chrome.storage.local.get(['clickCount', 'maxSpeed', 'avgSpeed'], (data) => {
      const statsMessage = `
        Total Clicks: ${data.clickCount || 0}
        Max Speed: ${data.maxSpeed || 0} clicks/sec
        Average Speed: ${data.avgSpeed || 0} clicks/sec
      `;
      alert(statsMessage);
    });
  }
});
