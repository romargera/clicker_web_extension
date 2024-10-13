const AIRTABLE_API_KEY = 'patR2LvBfeHAGSrnF.b8f6a95b6f1a12aff2d8244373a0249cd38a5fb1993c8e876afe950699bf406b';
const BASE_ID = 'appI0hrC2VIqxdkSN';
const TABLE_NAME = 'Main';

// Function to send the collected data to Airtable
function sendDataToAirtable(clickQty, maxSpeed) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  };

  chrome.storage.local.get(['uniqueID', 'installTimestamp', 'dailySessions', 'dailyClicksSessions'], (data) => {
    const body = JSON.stringify({
      fields: {
        "Unique ID": data.uniqueID || "",
        "Click Quantity": clickQty || 0,
        "Max Speed": maxSpeed || 0,
        "Installation Timestamp": data.installTimestamp || "",
        "First Daily Sessions": JSON.stringify(data.dailySessions) || "",
        "First Daily Click Sessions": JSON.stringify(data.dailyClicksSessions) || ""
      }
    });

    // Make the POST request to send data to Airtable
    fetch(url, {
      method: 'POST',
      headers: headers,
      body: body
    })
    .then(response => response.json())
    .then(data => console.log("Data successfully sent to Airtable:", data))
    .catch(error => console.error("Error sending data to Airtable:", error));
  });
}