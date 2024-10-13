let clickTimestamps = [];
let totalClicks = 0;
let maxSpeed = 0;
let speedUpdateInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // Load saved clicks, timestamps, and max speed
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    totalClicks = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;  // Load saved max speed
    
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('maxSpeed').textContent = maxSpeed;

    // Start the frequent update for click speed
    startSpeedUpdate();
  });

  // Only count clicks in the main click area
  document.body.addEventListener('click', (event) => {
    const target = event.target;

    // List of elements we want to exclude from counting clicks
    const nonCountableElements = ['BUTTON', 'A', 'INPUT', 'TEXTAREA'];

    // Ignore clicks on buttons, links, and any elements with the 'ignore-clicks' class
    if (nonCountableElements.includes(target.tagName) || target.closest('.ignore-clicks')) {
      return; // Do not count the click
    }

    // Register the click
    totalClicks++;
    clickTimestamps.push(Date.now());

    // Save the updated click count and timestamps in storage
    chrome.storage.local.set({ clickCount: totalClicks, clickTimestamps });

    // Update the total clicks display
    document.getElementById('totalClicks').textContent = totalClicks;
  });

  // Stop speed calculation when the page is closed or inactive
  window.addEventListener('beforeunload', () => {
    if (speedUpdateInterval) {
      clearInterval(speedUpdateInterval);
    }
  });
});

// Function to start the frequent update for click speed
function startSpeedUpdate() {
  // Update the click speed every second
  speedUpdateInterval = setInterval(() => {
    updateClickSpeed();
  }, 1000); // Updates every second
}

function updateClickSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;  // Time 1 second ago

  // Filter clicks that occurred within the last second
  const recentClicks = clickTimestamps.filter(timestamp => timestamp > oneSecondAgo);
  const clicksInLastSecond = recentClicks.length;

  // Calculate elapsed time in seconds from the first click to now
  const elapsedTimeInSeconds = (clickTimestamps.length > 1) ? (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) / 1000 : 1;

  // Calculate average speed (total clicks divided by total time in seconds)
  const avgSpeed = elapsedTimeInSeconds > 0 ? totalClicks / elapsedTimeInSeconds : 0;

  // Update max speed (max clicks per second)
  if (clicksInLastSecond > maxSpeed) {
    maxSpeed = clicksInLastSecond;
    chrome.storage.local.set({ maxSpeed }); // Save the new max speed
  }

  // Update only if there were clicks in the last second
  if (clicksInLastSecond > 0) {
    // Update the UI with max and average speeds
    document.getElementById('maxSpeed').textContent = maxSpeed;
    document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2);
  }
}