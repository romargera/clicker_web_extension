document.addEventListener('DOMContentLoaded', () => {
  const totalClicksEl = document.getElementById('totalClicks');
  const maxSpeedEl = document.getElementById('maxSpeed');
  const iconClickArea = document.getElementById('iconClickArea');
  const iconClickCount = document.getElementById('iconClickCount');
  const hoverDialog = document.getElementById('hoverDialog');
  const resetLink = document.getElementById('resetStatsLink');
  let hoverDialogShown = false;

  // Show "click me" hover dialog once for 3s, then never again
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

  // Animate icon press
  iconClickArea.addEventListener('mousedown', () => {
    iconClickArea.style.transform = 'scale(0.91)';
  });
  iconClickArea.addEventListener('mouseup', () => {
    iconClickArea.style.transform = '';
  });
  iconClickArea.addEventListener('mouseleave', () => {
    iconClickArea.style.transform = '';
  });

  // Click handler (via background)
  iconClickArea.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'icon_click' });
  });

  // Reset stats handler
  resetLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to reset your stats?')) {
      chrome.runtime.sendMessage({ type: 'reset_stats' }, (resp) => {
        if (resp && resp.ok) {
          // UI will auto-update by next interval
        }
      });
    }
  });

  // Update stats every 0.1s, always from storage
  setInterval(() => {
    chrome.storage.local.get(['clickCount', 'maxSpeed'], (result) => {
      const clicks = result.clickCount || 0;
      const speed = (typeof result.maxSpeed === "number") ? result.maxSpeed.toFixed(2) : "0.00";
      totalClicksEl.textContent = clicks;
      iconClickCount.textContent = clicks;
      maxSpeedEl.textContent = speed;
    });
  }, 100);
});