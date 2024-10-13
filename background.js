let clickCount = 0;
let clickTimestamps = [];
let maxSpeed = 0;
let unsavedClickCount = 0;
const SAVE_INTERVAL = 10; // Save after every 10 clicks
let uniqueID;
let dailySessions = [];
let dailyClicksSessions = [];
const COOKIE_NAME = 'user_id';  // Name of the cookie to use as the unique ID

// Use the unique ID from a cookie if available, otherwise don't generate any ID
chrome.cookies.getAll({ name: COOKIE_NAME }, (cookies) => {
  if (cookies.length > 0) {
    uniqueID = cookies[0].value;  // Use the cookie value as the unique ID
    console.log('Unique ID from cookie:', uniqueID);
  } else {
    console.log('No unique ID found in cookies');
  }
});

// Load data from storage on startup
chrome.runtime.onStartup.addListener(() => {
  loadDataFromStorage();
});

function loadDataFromStorage() {
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed', 'dailySessions', 'dailyClicksSessions'], (result) => {
    clickCount = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;
    dailySessions = result.dailySessions || [];
    dailyClicksSessions = result.dailyClicksSessions || [];
    console.log('Data loaded:', clickCount, clickTimestamps, maxSpeed, dailySessions, dailyClicksSessions);
  });
}

// Handle click action and update click count
chrome.action.onClicked.addListener(() => {
  clickCount++;
  unsavedClickCount++;
  const now = Date.now();
  clickTimestamps.push(now);

  // Add first session timestamp if today is a new day
  updateDailySessions(now);

  // Calculate max speed
  const speed = calculateCurrentSpeed();
  if (speed > maxSpeed) {
    maxSpeed = speed;
  }

  // Periodically save data
  if (unsavedClickCount >= SAVE_INTERVAL) {
    saveDataToStorage();
    unsavedClickCount = 0; // Reset after saving
  }

  // Update badge with click count
  const displayCount = clickCount > 999 ? '999+' : clickCount.toString();
  chrome.action.setBadgeText({ text: displayCount });
});

// Add daily sessions tracking
function updateDailySessions(currentTime) {
  const today = new Date().toDateString();
  const lastSession = dailySessions[dailySessions.length - 1];

  if (!lastSession || new Date(lastSession).toDateString() !== today) {
    dailySessions.push(currentTime); // New session for the day
  }

  if (clickCount > 0) {
    if (!dailyClicksSessions.length || new Date(dailyClicksSessions[dailyClicksSessions.length - 1]).toDateString() !== today) {
      dailyClicksSessions.push(currentTime); // New click session for the day
    }
  }
}

// Function to calculate current click speed
function calculateCurrentSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;
  const recentClicks = clickTimestamps.filter(timestamp => timestamp > oneSecondAgo);
  return recentClicks.length;
}

// Save data to storage
function saveDataToStorage() {
  chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed, dailySessions, dailyClicksSessions }, () => {
    console.log('Data saved:', clickCount, maxSpeed, dailySessions, dailyClicksSessions);
  });
}

// Save data periodically in case the browser closes
setInterval(() => {
  if (unsavedClickCount > 0) {
    saveDataToStorage();
    unsavedClickCount = 0;
  }
}, 5000); // Save every 5 seconds

// Context menu for showing stats
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openOptions",
    title: "Show Stats",
    contexts: ["action"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});