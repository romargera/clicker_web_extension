// content.js — collects basic page info and updates image if needed

// Collect page information (example: title, meta description, first h1)
const pageData = {
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
  h1Text: document.querySelector('h1')?.innerText || ''
};

// Optionally, send this info to background (can be expanded as needed)
chrome.runtime.sendMessage({ type: 'page_info', data: pageData });

// Log clicks on page elements (optionally send to background or GA4)
document.addEventListener('click', (event) => {
  // Example: send event to background or directly to GA4 if needed:
  // chrome.runtime.sendMessage({ type: 'page_click', element: event.target.tagName, time: Date.now() });
  // sendAnalyticsEvent('page_click', { tag: event.target.tagName });
});

// Set image on the page if user has selected custom icon (from storage)
chrome.storage.local.get('selectedIcon', ({ selectedIcon }) => {
  if (selectedIcon) {
    const img = document.querySelector('img'); // Change selector if needed for specific image
    if (img) img.src = selectedIcon;
  }
});