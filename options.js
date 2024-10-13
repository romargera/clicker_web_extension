document.addEventListener('DOMContentLoaded', () => {
  // Load the selected icon from storage when the options page is opened
  chrome.storage.sync.get('selectedIcon', (data) => {
    if (data.selectedIcon) {
      // Add 'selected' class to the current selected icon
      const selectedImg = document.querySelector(`img[src="${data.selectedIcon}"]`);
      if (selectedImg) {
        selectedImg.classList.add('selected');
      }
    }
  });

  // Allow users to select an icon by clicking on it
  const icons = document.querySelectorAll('.icon-choice img');
  icons.forEach(icon => {
    icon.addEventListener('click', () => {
      // Remove 'selected' class from all icons
      icons.forEach(i => i.classList.remove('selected'));

      // Add 'selected' class to the clicked icon
      icon.classList.add('selected');

      // Save the selected icon in chrome.storage.sync
      const selectedIcon = icon.getAttribute('src');
      chrome.storage.sync.set({ selectedIcon });
    });
  });

  // Handle the Save button click
  document.querySelector('.save-button').addEventListener('click', () => {
    // Get the currently selected icon
    const selectedIcon = document.querySelector('.icon-choice img.selected').getAttribute('src');

    // Set the extension icon dynamically
    chrome.action.setIcon({ path: selectedIcon });

    // Notify the user
    alert('Icon updated!');
  });
});