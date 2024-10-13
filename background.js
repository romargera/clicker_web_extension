let clickCount = 0;
let clickTimestamps = [];
let unsavedClickCount = 0;
const SAVE_INTERVAL = 10; // Save after every 10 clicks or a few seconds

// Load data from storage when the extension starts
chrome.runtime.onInstalled.addListener(() => {
  loadDataFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  loadDataFromStorage();
});

function loadDataFromStorage() {
  chrome.storage.local.get(['clickCount', 'clickTimestamps'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    console.log('Data loaded:', clickCount, clickTimestamps);
  });
}

chrome.action.onClicked.addListener(() => {
  // Increment the click count
  clickCount++;
  unsavedClickCount++;
  clickTimestamps.push(Date.now());

  // Periodically save data to storage
  if (unsavedClickCount >= SAVE_INTERVAL) {
    saveDataToStorage();
    unsavedClickCount = 0; // Reset unsaved count after saving
  }

  // Update badge with the click count
  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });
});

function saveDataToStorage() {
  chrome.storage.local.set({ clickCount, clickTimestamps }, () => {
    console.log('Click count and timestamps saved:', clickCount);
  });
}

// Save remaining clicks every 5 seconds in case the user closes the browser
setInterval(() => {
  if (unsavedClickCount > 0) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }
}, 5000); // 5 seconds backup save

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openStats",
    title: "Show Stats",
    contexts: ["action"] // Only show when right-clicking on the extension icon
  });

  // Other context menu for opening options page
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Open Clicker Options",
    contexts: ["action"]
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage(); // Open options.html on right-click
  } else if (info.menuItemId === "openStats") {
    chrome.storage.local.get(['clickCount', 'maxSpeed', 'avgSpeed'], (data) => {
      const statsMessage = `
        Total Clicks: ${data.clickCount || 0}
        Max Speed: ${data.maxSpeed || 0} clicks/sec
        Average Speed: ${data.avgSpeed || 0} clicks/sec
      `;
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon1.png",
        title: "Clicker Challenge Stats",
        message: statsMessage
      });
    });
  }
});