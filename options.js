document.addEventListener('DOMContentLoaded', () => {
  const totalClicksEl = document.getElementById('totalClicks');
  const maxSpeedEl = document.getElementById('maxSpeed');
  const iconClickArea = document.getElementById('iconClickArea');
  let lastSecondTimestamps = [];

  // Function to update stats display from storage
  function updateStatsDisplay() {
    chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
      const clicks = result.clickCount || 0;
      const maxSpeed = result.maxSpeed || 0;
      totalClicksEl.textContent = clicks;
      maxSpeedEl.textContent = maxSpeed;
    });
  }

  // Update stats every 0.1s (100 ms)
  setInterval(updateStatsDisplay, 100);

  // Clicking the icon also increases the counter (just like toolbar icon)
  iconClickArea.addEventListener('click', () => {
    chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
      let clickCount = result.clickCount || 0;
      let clickTimestamps = result.clickTimestamps || [];
      let maxSpeed = result.maxSpeed || 0;

      clickCount++;
      const now = Date.now();
      clickTimestamps.push(now);

      // Calculate speed for the last second
      const recent = clickTimestamps.filter(t => t > now - 1000);
      const speed = recent.length;

      // Update max speed if needed
      if (speed > maxSpeed) maxSpeed = speed;

      // Save updated stats
      chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed }, () => {
        // Optionally update stats immediately (can be omitted since setInterval updates anyway)
        totalClicksEl.textContent = clickCount;
        maxSpeedEl.textContent = maxSpeed;
      });

      // Send event to GA4
      if (typeof sendAnalyticsEvent === 'function') {
        sendAnalyticsEvent('click', { speed, total_clicks: clickCount, from: 'options' });
      }
    });
  });
});