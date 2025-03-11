import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import GlobalProvider from '../GlobalProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <GlobalProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFC107', // Active tab color
        tabBarLabelStyle: {
          color: isDarkMode ? 'white' : 'black', 
        },
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#f0f0f0', // Tab bar background
          borderTopColor: isDarkMode ? '#333' : '#ccc', 
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Acasa',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={focused ? '#FFC107' : isDarkMode ? 'white' : 'black'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="buy"
        options={{
          title: 'Cauta',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'search' : 'search-outline'}
              color={focused ? '#FFC107' : isDarkMode ? 'white' : 'black'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Vinde',
          tabBarIcon: ({ focused }) => (
            <AntDesign
              name={focused ? 'pluscircle' : 'pluscircleo'}
              color={focused ? '#FFC107' : isDarkMode ? 'white' : 'black'}
              size={24} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificari',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'mail-open-outline' : 'mail-outline'}
              color={focused ? '#FFC107' : isDarkMode ? 'white' : 'black'}
              size={28} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={focused ? '#FFC107' : isDarkMode ? 'white' : 'black'}
              size={23}
            />
          ),
        }}
      />
    </Tabs>
    
    </GlobalProvider>
    
  );
}
