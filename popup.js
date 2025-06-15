// popup.js — Displays click stats and tracks popup open in GA4

document.addEventListener('DOMContentLoaded', () => {
  // Track popup open event
  sendAnalyticsEvent('popup_opened');

  // Display current stats from storage
  chrome.storage.local.get(['clickCount', 'maxSpeed'], (result) => {
    document.getElementById('totalClicks').textContent = result.clickCount || 0;
    document.getElementById('maxSpeed').textContent = result.maxSpeed || 0;
  });
});