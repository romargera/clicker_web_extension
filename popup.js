let clickTimestamps = [];
let totalClicks = 0;
let maxSpeed = 0;
let speedUpdateInterval = null; // To store the interval reference

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
  // Update the click speed every 200 milliseconds
  speedUpdateInterval = setInterval(() => {
    updateClickSpeed();
  }, 200); // Updates every 200ms
}

function updateClickSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;  // Set interval to 1 second

  // Filter clicks that occurred within the last second
  const recentClicks = clickTimestamps.filter(timestamp => timestamp > oneSecondAgo);
  const clicksInLastSecond = recentClicks.length;

  // Calculate max speed (max clicks per second)
  if (clicksInLastSecond > maxSpeed) {
    maxSpeed = clicksInLastSecond;
    chrome.storage.local.set({ maxSpeed }); // Save the new max speed
  }

  // Calculate average speed based on the total time since the first click
  const elapsedTimeInSeconds = (clickTimestamps.length > 1) ? 
    (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) / 1000 : 1;
  const avgSpeed = elapsedTimeInSeconds > 0 ? totalClicks / elapsedTimeInSeconds : 0;

  // Update the UI with max and average speeds
  document.getElementById('maxSpeed').textContent = maxSpeed;
  document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2);
}