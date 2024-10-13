let clickTimestamps = [];
let totalClicks = 0;
let maxSpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Load saved clicks and timestamps
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    totalClicks = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;  // Load saved max speed
    
    console.log("Loaded total clicks from storage: ", totalClicks);
    console.log("Loaded max speed from storage: ", maxSpeed);
    
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('maxSpeed').textContent = maxSpeed;

    // Update click speed
    updateClickSpeed();
  });

  // Disable counting clicks on specific elements (buttons, etc.)
  document.body.addEventListener('click', (event) => {
    const target = event.target;

    // Ignore clicks on the buttons and the container of the buttons
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('.ignore-clicks')) {
      return; // Do not count click
    }

    totalClicks++;
    clickTimestamps.push(Date.now());

    console.log("Click registered. Total clicks: ", totalClicks);

    // Save the total clicks and timestamps in chrome.storage
    chrome.storage.local.set({ clickCount: totalClicks, clickTimestamps }, () => {
      console.log("Total clicks saved: ", totalClicks);
    });

    // Update stats
    document.getElementById('totalClicks').textContent = totalClicks;
    updateClickSpeed();
  });
});

function updateClickSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;

  // Filter clicks that occurred within the last second
  const recentClicks = clickTimestamps.filter(timestamp => timestamp > oneSecondAgo);
  const clicksInLastSecond = recentClicks.length;

  console.log("Clicks in the last second: ", clicksInLastSecond);

  // Update max speed (clicks per second)
  if (clicksInLastSecond > maxSpeed) {
    maxSpeed = clicksInLastSecond;
    chrome.storage.local.set({ maxSpeed }, () => {
      console.log("Max speed updated and saved: ", maxSpeed);
    });
  }

  // Calculate average speed based on time since first click (total time in seconds)
  const elapsedTimeInSeconds = (clickTimestamps.length > 1) ? 
    (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) / 1000 : 1;
  const avgSpeed = totalClicks > 0 ? totalClicks / elapsedTimeInSeconds : 0;

  // Update UI with max and average speeds (clicks per second)
  document.getElementById('maxSpeed').textContent = maxSpeed;
  document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2);
}