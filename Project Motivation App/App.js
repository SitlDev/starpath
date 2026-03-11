import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import AddIdeaScreen from './screens/AddIdeaScreen';
import IdeaDetailScreen from './screens/IdeaDetailScreen';
import ArchiveScreen from './screens/ArchiveScreen';
import SettingsScreen from './screens/SettingsScreen';
import { scheduleNotifications } from './utils/notifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Ideas') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Add') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Archive') {
            iconName = focused ? 'archive' : 'archive-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#333',
          paddingBottom: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen name="Ideas" component={HomeScreen} />
      <Tab.Screen name="Add" component={AddIdeaScreen} />
      <Tab.Screen name="Archive" component={ArchiveScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        // Schedule daily notifications
        scheduleNotifications();
      }
    };
    requestPermissions();

    // Initialize sample data if first run
    const initializeSampleData = async () => {
      const existing = await AsyncStorage.getItem('ideas');
      if (!existing) {
        const sampleIdeas = [
          {
            id: '1',
            title: 'Learn Spanish',
            motivation: 'I want to connect with my family and travel to South America confidently',
            category: 'Personal Growth',
            priority: 'high',
            status: 'active',
            createdAt: new Date().toISOString(),
            lastTouched: new Date().toISOString(),
            tasks: [
              { id: 't1', text: 'Download Duolingo', completed: true },
              { id: 't2', text: 'Practice 15 min daily', completed: false },
              { id: 't3', text: 'Find language exchange partner', completed: false },
            ],
            notes: 'Starting with basic conversational phrases',
            timeSpent: 0,
          },
          {
            id: '2',
            title: 'Build Side Project',
            motivation: 'To create passive income and have creative freedom outside my day job',
            category: 'Career',
            priority: 'high',
            status: 'active',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            lastTouched: new Date(Date.now() - 86400000 * 3).toISOString(),
            tasks: [
              { id: 't4', text: 'Brainstorm app ideas', completed: true },
              { id: 't5', text: 'Learn React Native', completed: false },
              { id: 't6', text: 'Build MVP', completed: false },
            ],
            notes: 'Focus on solving a real problem I have',
            timeSpent: 0,
          },
        ];
        await AsyncStorage.setItem('ideas', JSON.stringify(sampleIdeas));
      }
    };
    initializeSampleData();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={HomeTabs} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="IdeaDetail" 
          component={IdeaDetailScreen}
          options={{ title: 'Project Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
