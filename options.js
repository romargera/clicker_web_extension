document.addEventListener('DOMContentLoaded', () => {
  const clickIcon = document.getElementById('clickIcon');
  const iconImages = document.querySelectorAll('.icon-choice img');
  const totalClicksEl = document.getElementById('totalClicks');
  const maxSpeedEl = document.getElementById('maxSpeed');
  const errorMsg = document.getElementById('errorMsg');
  const reloadBtn = document.getElementById('reloadButton');

  // Load chosen icon and stats
  chrome.storage.local.get(['selectedIcon', 'clickCount', 'maxSpeed'], (result) => {
    const icon = result.selectedIcon || 'icons/icon1.png';
    clickIcon.src = icon;
    iconImages.forEach(img => {
      if (img.getAttribute('data-icon') === icon) img.classList.add('selected');
      else img.classList.remove('selected');
    });
    totalClicksEl.textContent = result.clickCount || 0;
    maxSpeedEl.textContent = result.maxSpeed || 0;
  });

  // Click on main icon = click event
  clickIcon.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'icon_click' }, (resp) => {
      if (resp && resp.ok) {
        sendAnalyticsEvent('click', { from: 'options' });
        chrome.storage.local.get(['clickCount', 'maxSpeed'], (result) => {
          totalClicksEl.textContent = result.clickCount || 0;
          maxSpeedEl.textContent = result.maxSpeed || 0;
        });
      }
    });
  });

  // Choosing icon from list
  iconImages.forEach(img => {
    img.addEventListener('click', () => {
      iconImages.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      const iconPath = img.getAttribute('data-icon');
      clickIcon.src = iconPath;
      chrome.storage.local.set({ selectedIcon: iconPath });
      sendAnalyticsEvent('image_changed', { icon: iconPath });
    });
  });

  // Reload button for error (hidden by default)
  reloadBtn.addEventListener('click', () => {
    location.reload();
  });

  // Error handling (if needed)
  try {
    // already handled in chrome.storage.local.get
  } catch (e) {
    errorMsg.style.display = '';
    reloadBtn.style.display = '';
  }
});