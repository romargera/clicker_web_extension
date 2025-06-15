importScripts('ga.js');

document.addEventListener('DOMContentLoaded', () => {
  const uploader = document.getElementById('imageUploader');
  const preview = document.getElementById('previewImage');

  // Load saved icon
  chrome.storage.local.get('clickImage', ({ clickImage }) => {
    if (clickImage) preview.src = clickImage;
  });

  uploader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imageDataUrl = e.target.result;
      preview.src = imageDataUrl;

      chrome.storage.local.set({ clickImage: imageDataUrl }, () => {
        sendAnalyticsEvent('image_changed');
      });
    };
    reader.readAsDataURL(file);
  });
});