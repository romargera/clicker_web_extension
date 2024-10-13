let clickTimestamps = [];
let totalClicks = 0;
let maxSpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Load saved clicks and timestamps
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    totalClicks = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;  // Load saved max speed
    
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('maxSpeed').textContent = maxSpeed;

    updateClickSpeed();
  });

  // Only count clicks in the main click area
  document.body.addEventListener('click', (event) => {
    const target = event.target;

    // List of classes or tags we want to exclude from counting clicks
    const nonCountableElements = ['BUTTON', 'A', '.ignore-clicks', 'INPUT', 'TEXTAREA'];

    // If the clicked element or its parent has any of the non-countable classes or tags, ignore it
    if (nonCountableElements.includes(target.tagName) || target.closest('.ignore-clicks')) {
      return; // Ignore clicks on non-countable elements
    }

    totalClicks++;
    clickTimestamps.push(Date.now());

    // Save the total clicks and timestamps
    chrome.storage.local.set({ clickCount: totalClicks, clickTimestamps });

    document.getElementById('totalClicks').textContent = totalClicks;
    updateClickSpeed();
  });
});

function updateClickSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;  // Set interval to 1 second

  // Filter clicks that occurred within the last second
  const recentClicks = clickTimestamps.filter(timestamp => timestamp > oneSecondAgo);
  const clicksInLastSecond = recentClicks.length;

  if (clicksInLastSecond > maxSpeed) {
    maxSpeed = clicksInLastSecond;
    chrome.storage.local.set({ maxSpeed });
  }

  const elapsedTimeInSeconds = clickTimestamps.length > 1 ? 
    (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) / 1000 : 1;
  const avgSpeed = elapsedTimeInSeconds > 0 ? totalClicks / elapsedTimeInSeconds : 0;

  document.getElementById('maxSpeed').textContent = maxSpeed;
  document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2);
}