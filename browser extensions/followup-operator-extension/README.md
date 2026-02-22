# FollowUp Operator - Chrome Extension

**Never forget a warm lead again.**

Auto-tracks your sales emails in Gmail and reminds you when follow-ups are needed.

## Features

- **Auto-tracking**: Detects when you send emails in Gmail
- **Smart reminders**: Shows badge count for overdue follow-ups
- **Quick actions**: One-click follow-up from extension popup
- **Status tracking**: Mark leads as responded/dead
- **Persistent storage**: All data saved locally in browser

## Installation

### Load Unpacked Extension (Developer Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `followup-operator-extension` folder
5. Extension installed! Icon will appear in toolbar

### Using the Extension

1. **Track leads**: Send emails from Gmail - they're auto-tracked
2. **View pipeline**: Click extension icon to see leads needing follow-up
3. **Follow up**: Click "Follow Up" to open Gmail compose
4. **Mark outcomes**: Update status when leads respond or go cold

### Tabs

- **Urgent**: Leads past their follow-up window (action needed)
- **Active**: All currently active leads
- **All**: Complete history including closed leads

## How It Works

1. Content script monitors Gmail for sent emails
2. Background service worker stores lead data
3. Periodic checks identify overdue follow-ups
4. Badge shows count of urgent items
5. Desktop notifications for high-priority leads

## Technical Stack

- Manifest V3 (latest Chrome extension standard)
- Vanilla JavaScript (no frameworks)
- Chrome Storage API (local persistence)
- Chrome Alarms API (scheduled checks)
- Chrome Notifications API (desktop alerts)

## Privacy

- All data stored locally in browser
- No external servers or API calls
- Gmail integration is read-only for sent items
- No data collection or analytics

## Development

To modify the extension:

1. Edit files in `followup-operator-extension/`
2. Go to `chrome://extensions/`
3. Click reload icon on FollowUp Operator card
4. Test changes immediately

## Files

```
followup-operator-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (lead tracking logic)
├── content.js          # Gmail integration script
├── content.css         # Gmail styling
├── popup.html          # Extension popup UI
├── popup.js            # Popup interaction logic
├── icons/              # Extension icons (16, 48, 128px)
└── README.md           # This file
```

## Future Enhancements

- [ ] Auto-draft follow-up emails with AI
- [ ] Gmail API integration for better email parsing
- [ ] Custom follow-up templates
- [ ] Analytics dashboard
- [ ] Export to CSV
- [ ] Sync across devices
- [ ] Outlook support

## License

MIT
