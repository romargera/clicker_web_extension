document.addEventListener('DOMContentLoaded', () => {
  const totalClicksEl = document.getElementById('totalClicks');
  const maxSpeedEl = document.getElementById('maxSpeed');
  const iconClickArea = document.getElementById('iconClickArea');
  const iconClickCount = document.getElementById('iconClickCount');
  const hoverDialog = document.getElementById('hoverDialog');
  let hoverDialogShown = false;
  let clickCountSession = 0;

  // Show "click me" hover dialog only once for 3s, then never again
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

  // Register click via background, update click badge
  iconClickArea.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'icon_click' }, (resp) => {
      if (resp && resp.ok) {
        clickCountSession++;
        iconClickCount.textContent = clickCountSession;
      }
    });
  });

  // Update displayed stats every 0.1s for live sync
  setInterval(() => {
    chrome.storage.local.get(['clickCount', 'maxSpeed'], (result) => {
      totalClicksEl.textContent = result.clickCount || 0;
      maxSpeedEl.textContent = result.maxSpeed || 0;
    });
  }, 100);
});