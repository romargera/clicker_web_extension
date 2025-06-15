document.addEventListener('DOMContentLoaded', () => {
  const totalClicksEl = document.getElementById('totalClicks');
  const maxSpeedEl = document.getElementById('maxSpeed');
  const iconClickArea = document.getElementById('iconClickArea');
  const iconClickCount = document.getElementById('iconClickCount');
  const hoverDialog = document.getElementById('hoverDialog');
  let hoverDialogShown = false;
  let clickCountSession = 0;

  // Instruction moved under h1 in HTML

  // 3s hover-once logic
  if (!localStorage.getItem('iconHoverDialogHidden')) {
    iconClickArea.addEventListener('mouseenter', () => {
      if (!hoverDialogShown) {
        iconClickArea.classList.add('show-hover');
        setTimeout(() => {
          iconClickArea.classList.remove('show-hover');
          localStorage.setItem('iconHoverDialogHidden', '1');
        }, 3000);
        hoverDialogShown = true;
      }
    });
  }

  // Instant feedback on click (fast animation)
  iconClickArea.addEventListener('mousedown', () => {
    iconClickArea.style.transform = 'scale(0.91)';
  });
  iconClickArea.addEventListener('mouseup', () => {
    iconClickArea.style.transform = '';
  });
  iconClickArea.addEventListener('mouseleave', () => {
    iconClickArea.style.transform = '';
  });

  // Count click on icon, update stats and badge
  iconClickArea.addEventListener('click', () => {
    chrome.storage.local.get(['clickCount', 'clickTimestamps', 'maxSpeed'], (result) => {
      let clickCount = result.clickCount || 0;
      let clickTimestamps = result.clickTimestamps || [];
      let maxSpeed = result.maxSpeed || 0;

      clickCount++;
      clickCountSession++;
      iconClickCount.textContent = clickCountSession;

      const now = Date.now();
      clickTimestamps.push(now);

      const recent = clickTimestamps.filter(t => t > now - 1000);
      const speed = recent.length;
      if (speed > maxSpeed) maxSpeed = speed;

      chrome.storage.local.set({ clickCount, clickTimestamps, maxSpeed }, () => {
        // UI will auto-update via interval
      });

      if (typeof sendAnalyticsEvent === 'function') {
        sendAnalyticsEvent('click', { speed, total_clicks: clickCount, from: 'options' });
      }
    });
  });

  // Update all stats every 0.1s
  setInterval(() => {
    chrome.storage.local.get(['clickCount', 'maxSpeed'], (result) => {
      totalClicksEl.textContent = result.clickCount || 0;
      maxSpeedEl.textContent = result.maxSpeed || 0;
    });
  }, 100);
});