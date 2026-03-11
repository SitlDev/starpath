# Idea Tracker - Mobile App

A React Native mobile app to help you capture ideas, stay motivated with daily reminders, and actually complete the projects that matter to you.

## Features

### Core Functionality
- **Quick Idea Capture**: Add new ideas with mandatory "Why this matters to me" motivation field
- **Active Project Limit**: Maximum 3 active projects to prevent overwhelm
- **Task Management**: Break down projects into actionable tasks
- **Progress Tracking**: Visual progress bars showing completion percentage
- **Project Statuses**: Active, Started, Parked, Completed
- **Archive**: Review completed and parked projects

### Motivational System
- **Daily Reminders**: Customizable push notifications with motivational tips
- **Personal Motivation**: Each reminder includes YOUR reason for starting the project
- **Actionable Tips**: Rotating messages like:
  - "Just 15 minutes today. Set a timer."
  - "Break it into the smallest possible next step."
  - "Visualize using the finished project tomorrow."
  - "What would past-you think if you completed this today?"
  - "Start messy. Progress > perfection."
  - "Schedule it. Treat it like a meeting with yourself."

### Anti-Abandonment Features
- **Stale Project Alerts**: Visual warnings for projects untouched 7+ days
- **Weekly Challenge**: Reminder to complete one project per week
- **Completion Celebrations**: Satisfying acknowledgment when you finish

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Development Server**
```bash
npm start
# or
expo start
```

3. **Run on Device/Simulator**
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### First Run
The app includes sample data on first launch:
- "Learn Spanish" - High priority, active
- "Build Side Project" - High priority, active

## Project Structure

```
idea-tracker/
├── App.js                          # Main app with navigation setup
├── screens/
│   ├── HomeScreen.js              # Active projects display
│   ├── AddIdeaScreen.js           # Create new ideas
│   ├── IdeaDetailScreen.js        # View/edit project details
│   ├── ArchiveScreen.js           # Completed & parked projects
│   └── SettingsScreen.js          # Notification preferences
├── utils/
│   └── notifications.js           # Push notification logic
├── package.json                   # Dependencies
└── app.json                       # Expo configuration
```

## Usage Guide

### Adding an Idea
1. Tap the **+** tab
2. Enter a title (required)
3. **Crucially**: Write why this matters to you - this becomes your anchor
4. Select category, priority, and add initial tasks
5. Tap "Save Idea"

Note: If you have 3 active projects, you'll need to complete or park one first.

### Managing Projects
- **Mark tasks complete**: Tap the circle next to each task
- **Add tasks**: Type in the "Add a new task" field
- **Edit notes**: Tap the edit icon in the Notes section
- **Change status**: Use status buttons to move between Active/Parked/Completed
- **Delete**: Use the red "Delete Idea" button at the bottom

### Notifications
1. Go to **Settings** tab
2. Enable notifications with the toggle
3. Select your preferred time (6 AM - 9 PM)
4. Test with "Send Test Notification" button

Notifications include:
- The project name
- Your original motivation
- An actionable tip to get started

### Project States
- **Active**: Currently working on it
- **Started**: Initiated but not making regular progress
- **Parked**: Temporarily on hold (shows in Archive)
- **Completed**: Finished! (shows in Archive with celebration)

## Design Philosophy

### Why the 3-Project Limit?
Research shows people dramatically overestimate their capacity. By limiting active projects to 3, the app forces you to:
- Finish what you start
- Make conscious choices about priorities
- Avoid context-switching fatigue

### Why Mandatory Motivation?
When motivation fades (and it will), your original "why" is what brings you back. The app:
- Requires you to write it when creating the project
- Shows it prominently in reminders
- Displays it on every project view

This emotional connection is the difference between completion and abandonment.

### Dark Theme
The app uses a dark theme because:
- Reduces eye strain for frequent use
- Creates a focused, distraction-free environment
- Makes colorful accents (progress, priorities) stand out

## Customization

### Notification Times
Available times: 6 AM, 7 AM, 8 AM, 9 AM, 10 AM, 12 PM, 3 PM, 6 PM, 8 PM, 9 PM

### Categories
Default categories: Personal Growth, Career, Health, Creative, Learning, Finance, Other
(Edit `CATEGORIES` array in `AddIdeaScreen.js` to customize)

### Priorities
- **High** (red): Urgent and important
- **Medium** (yellow): Important but not urgent
- **Low** (teal): Nice to have

### Colors
Main theme colors in the app:
- Primary: `#FF6B35` (orange)
- Secondary: `#4ECDC4` (teal)
- Accent: `#F7B801` (yellow)
- Background: `#0F0F0F` (near black)
- Card: `#1A1A1A` (dark gray)

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Standalone App
Follow Expo's documentation for building standalone apps:
https://docs.expo.dev/distribution/building-standalone-apps/

## Troubleshooting

### Notifications Not Working
1. Check device notification permissions
2. Verify notifications are enabled in Settings tab
3. Test with "Send Test Notification" button
4. Check that notification time isn't in the past

### Data Not Persisting
- Data is stored locally using AsyncStorage
- Deleting the app removes all data
- Use "Clear All Data" in Settings to reset

### Performance Issues
- Restart the Expo development server
- Clear Metro bundler cache: `expo start -c`
- Reinstall node_modules: `rm -rf node_modules && npm install`

## Future Enhancements

Potential features to add:
- [ ] Cloud sync across devices
- [ ] Collaboration/sharing projects
- [ ] Time tracking analytics
- [ ] Habit streaks
- [ ] Custom notification messages
- [ ] Export projects to PDF/Markdown
- [ ] Integration with calendar apps
- [ ] Voice notes for ideas
- [ ] Image attachments
- [ ] Weekly review summaries

## License

MIT License - feel free to use and modify for your own needs.

## Credits

Built to solve the universal problem: too many ideas, not enough completions.

**Remember**: The best idea tracker is the one that helps you finish, not just start.
