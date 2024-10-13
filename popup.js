let clickTimestamps = [];
let totalClicks = 0;
let maxSpeed = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Load saved data when the popup is opened
  chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
    totalClicks = result.clickCount || 0;
    clickTimestamps = result.clickTimestamps || [];
    maxSpeed = result.maxSpeed || 0;

    console.log("Data loaded in popup:", { totalClicks, maxSpeed, clickTimestamps });

    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('maxSpeed').textContent = maxSpeed;

    updateClickSpeed();
  });

  // Prevent clicks inside the stats section from registering as clicks
  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('.section')) {
      return;
    }

    totalClicks++;
    clickTimestamps.push(Date.now());

    chrome.storage.local.set({ clickCount: totalClicks, clickTimestamps }, () => {
      console.log("Click count and timestamps saved:", totalClicks);
    });

    document.getElementById('totalClicks').textContent = totalClicks;
    updateClickSpeed();
  });
});

function updateClickSpeed() {
  const now = Date.now();
  const oneSecondAgo = now - 1000;

  const recentClicks = clickTimestamps.filter(timestamp => timestamp > oneSecondAgo);
  const clicksInLastSecond = recentClicks.length;

  console.log("Clicks in the last second:", clicksInLastSecond);

  if (clicksInLastSecond > maxSpeed) {
    maxSpeed = clicksInLastSecond;
    chrome.storage.local.set({ maxSpeed }, () => {
      console.log("Max speed updated:", maxSpeed);
    });
  }

  const elapsedTimeInSeconds = (clickTimestamps.length > 1) ? (clickTimestamps[clickTimestamps.length - 1] - clickTimestamps[0]) / 1000 : 1;
  const avgSpeed = totalClicks / elapsedTimeInSeconds;

  document.getElementById('maxSpeed').textContent = maxSpeed;
  document.getElementById('avgSpeed').textContent = avgSpeed.toFixed(2);
}
