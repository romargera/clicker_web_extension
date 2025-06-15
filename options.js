document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['clickCount', 'maxSpeed'], (result) => {
    document.getElementById('totalClicks').textContent = result.clickCount || 0;
    document.getElementById('maxSpeed').textContent = result.maxSpeed || 0;
  });
});