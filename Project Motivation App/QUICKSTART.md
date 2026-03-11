# Quick Start Guide

Get the Idea Tracker app running in 5 minutes.

## Prerequisites

Install these first if you don't have them:

```bash
# Install Node.js from https://nodejs.org (v16 or higher)

# Install Expo CLI globally
npm install -g expo-cli

# Install Expo Go app on your phone (iOS/Android)
# iOS: https://apps.apple.com/app/expo-go/id982107779
# Android: https://play.google.com/store/apps/details?id=host.exp.exponent
```

## Setup (3 steps)

### 1. Install Dependencies
```bash
cd idea-tracker
npm install
```

### 2. Start the App
```bash
npm start
```

This opens Expo Developer Tools in your browser.

### 3. Run on Your Phone
1. Scan the QR code with:
   - **iPhone**: Camera app (opens in Expo Go)
   - **Android**: Expo Go app
2. Wait for app to build and load
3. Done! The app is running on your phone

## First Use

1. **Grant Notifications Permission** when prompted
2. Explore the 2 sample projects already loaded
3. Tap **+ tab** to add your first real idea
4. Go to **Settings** to customize notification time

## Common Issues

**QR code not working?**
- Make sure phone and computer are on the same WiFi
- Try clicking "Send link with email" in Expo Dev Tools

**App not loading?**
- Check that Expo Go app is updated
- Restart `npm start`
- Try `npm start -c` to clear cache

**Notifications not appearing?**
- Check phone notification settings
- Enable notifications in app Settings tab
- Use "Send Test Notification" to verify

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Customize categories and priorities in the code
- Start tracking your ideas!

## Testing on Simulator (Optional)

### iOS (Mac only)
```bash
npm run ios
```

### Android
```bash
npm run android
```

You'll need Xcode (Mac) or Android Studio installed.

---

**That's it!** You now have a fully functional idea tracker with motivational reminders.
