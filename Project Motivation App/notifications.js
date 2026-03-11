import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOTIVATIONAL_TIPS = [
  "Just 15 minutes today. Set a timer.",
  "Break it into the smallest possible next step.",
  "Visualize using the finished project tomorrow.",
  "What would past-you think if you completed this today?",
  "Start messy. Progress > perfection.",
  "Schedule it. Treat it like a meeting with yourself.",
  "What's the 5-minute version of progress?",
  "One small action right now. You can do this.",
  "Remember: you chose to start this for a reason.",
  "Focus on the next step, not the whole journey.",
];

export async function scheduleNotifications() {
  // Cancel existing notifications
  await cancelNotifications();

  // Check if notifications are enabled
  const enabled = await AsyncStorage.getItem('notificationsEnabled');
  if (enabled === 'false') return;

  // Get notification time preference
  const timeString = await AsyncStorage.getItem('notificationTime') || '9:00 AM';
  const [time, period] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  // Schedule daily notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💡 Remember why you started',
      body: await getMotivationalMessage(),
      sound: true,
      priority: 'high',
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  console.log(`Scheduled daily notification at ${hours}:${minutes}`);
}

export async function cancelNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function getMotivationalMessage() {
  // Get active ideas
  const stored = await AsyncStorage.getItem('ideas');
  if (!stored) {
    return getRandomTip();
  }

  const ideas = JSON.parse(stored);
  const activeIdeas = ideas.filter(
    idea => idea.status === 'active' || idea.status === 'started'
  );

  if (activeIdeas.length === 0) {
    return "Ready to start something new? Add an idea today!";
  }

  // Pick a random active idea
  const randomIdea = activeIdeas[Math.floor(Math.random() * activeIdeas.length)];
  const randomTip = getRandomTip();

  // Check if idea is stale
  const daysSince = Math.floor(
    (Date.now() - new Date(randomIdea.lastTouched).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince >= 7) {
    return `"${randomIdea.title}" needs you! You started this because: ${randomIdea.motivation.substring(0, 60)}...`;
  }

  return `"${randomIdea.title}" — ${randomTip}`;
}

function getRandomTip() {
  return MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)];
}

// Weekly challenge notification
export async function scheduleWeeklyChallenge() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎯 Weekly Challenge',
      body: 'Can you complete one project this week? You\'ve got this!',
      sound: true,
    },
    trigger: {
      weekday: 1, // Monday
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });
}
