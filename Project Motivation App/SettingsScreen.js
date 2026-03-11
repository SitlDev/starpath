import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { scheduleNotifications, cancelNotifications } from '../utils/notifications';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('9:00 AM');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const enabled = await AsyncStorage.getItem('notificationsEnabled');
    const time = await AsyncStorage.getItem('notificationTime');
    
    if (enabled !== null) {
      setNotificationsEnabled(enabled === 'true');
    }
    if (time) {
      setNotificationTime(time);
    }
  };

  const toggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', value.toString());
    
    if (value) {
      await scheduleNotifications();
      Alert.alert(
        'Notifications Enabled',
        'You\'ll receive daily motivational reminders!'
      );
    } else {
      await cancelNotifications();
      Alert.alert(
        'Notifications Disabled',
        'You won\'t receive daily reminders anymore.'
      );
    }
  };

  const selectTime = (time) => {
    setNotificationTime(time);
    AsyncStorage.setItem('notificationTime', time);
    
    if (notificationsEnabled) {
      scheduleNotifications();
      Alert.alert('Time Updated', `You'll now receive notifications at ${time}`);
    }
  };

  const testNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💡 Remember why you started',
        body: 'Just 15 minutes today. Set a timer.',
        sound: true,
      },
      trigger: {
        seconds: 2,
      },
    });
    Alert.alert('Test Sent', 'Check your notifications in 2 seconds!');
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your ideas and settings. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Data Cleared', 'All your data has been deleted.');
            setNotificationsEnabled(true);
            setNotificationTime('9:00 AM');
          },
        },
      ]
    );
  };

  const TIMES = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
    '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM', '9:00 PM'
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="settings" size={40} color="#FF6B35" />
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your motivation experience
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={24} color="#FFF" />
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Get daily motivational reminders about your active projects
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#333', true: '#FF6B35' }}
            thumbColor={notificationsEnabled ? '#FFF' : '#888'}
          />
        </View>

        {notificationsEnabled && (
          <>
            <Text style={styles.subSectionTitle}>Notification Time</Text>
            <View style={styles.timeGrid}>
              {TIMES.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    notificationTime === time && styles.timeButtonActive,
                  ]}
                  onPress={() => selectTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      notificationTime === time && styles.timeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.testButton} onPress={testNotification}>
              <Ionicons name="send" size={20} color="#FFF" />
              <Text style={styles.testButtonText}>Send Test Notification</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={24} color="#FFF" />
          <Text style={styles.sectionTitle}>About</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Idea Tracker</Text>
          <Text style={styles.infoText}>
            This app helps you capture ideas, stay motivated with daily reminders, 
            and actually complete the projects that matter to you.
          </Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Pro Tip</Text>
            <Text style={styles.tipText}>
              Limit yourself to 3 active projects at a time. Focus beats quantity.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={24} color="#FFF" />
          <Text style={styles.sectionTitle}>Motivational Tips</Text>
        </View>
        
        <View style={styles.tipsContainer}>
          <View style={styles.tipItem}>
            <Ionicons name="timer-outline" size={20} color="#4ECDC4" />
            <Text style={styles.tipItemText}>Just 15 minutes today. Set a timer.</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="trending-up-outline" size={20} color="#4ECDC4" />
            <Text style={styles.tipItemText}>Progress > perfection. Start messy.</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="cube-outline" size={20} color="#4ECDC4" />
            <Text style={styles.tipItemText}>Break it into the smallest possible step.</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="eye-outline" size={20} color="#4ECDC4" />
            <Text style={styles.tipItemText}>Visualize using the finished project tomorrow.</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="calendar-outline" size={20} color="#4ECDC4" />
            <Text style={styles.tipItemText}>Schedule it. Treat it like a meeting with yourself.</Text>
          </View>
        </View>
      </View>

      <View style={styles.dangerSection}>
        <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
          <Ionicons name="warning" size={20} color="#FF6B35" />
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Made with ❤️ to help you finish what you start
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#888',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  timeButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  timeTextActive: {
    color: '#FFF',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#CCC',
    lineHeight: 22,
    marginBottom: 16,
  },
  tipBox: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
  },
  tipItemText: {
    flex: 1,
    fontSize: 15,
    color: '#FFF',
    lineHeight: 20,
  },
  dangerSection: {
    marginTop: 20,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  footer: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
    fontStyle: 'italic',
  },
});
