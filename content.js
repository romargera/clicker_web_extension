// Collect data from the webpage
const pageData = {
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
    h1Text: document.querySelector('h1')?.innerText
  };
  
  // Send collected data to the background script
  chrome.runtime.sendMessage(pageData);
  
  // Optionally, modify the page or track interactions
  document.addEventListener('click', (event) => {
    console.log("User clicked on:", event.target);
  
    // You can send click data as well if needed
    chrome.runtime.sendMessage({ element: event.target.tagName, time: Date.now() });
  });