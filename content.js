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
    const elementData = {
        tag: event.target.tagName,
        id: event.target.id || 'no-id',
        classes: event.target.className || 'no-classes',
        textContent: event.target.innerText.substring(0, 50) || 'no-text',  // Limiting text length for efficiency
        time: Date.now()
    };
    console.log("User clicked on:", elementData);

    // Send click data to the background script
    chrome.runtime.sendMessage(elementData);
});