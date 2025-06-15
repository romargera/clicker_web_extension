# Clicker Challenge Extension

Clicker Challenge is a Chrome extension that tracks how fast and how often you can click the browser toolbar icon. It stores your click stats and lets you track your maximum click speed over time.

## Features

- 🔘 Click the extension icon to record clicks
- 🧠 Tracks speed (clicks per second)
- 🏆 See your max speed and total clicks in a popup
- 🎨 Upload your own image to personalize the challenge
- 📊 Events tracked via Google Analytics 4

## Installation

1. Clone or download this repository
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder

## Privacy

No personal information is collected. All analytics are anonymous and use a random UUID per device.

## Analytics

This extension uses [Google Analytics 4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) to track:
- `extension_installed`
- `popup_opened`
- `click`
- `max_speed_updated`
- `image_changed`

All data is anonymous and used solely to understand how the extension is used.

## License

MIT License