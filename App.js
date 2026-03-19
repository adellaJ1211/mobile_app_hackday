import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import { WorkflowsProvider, useWorkflows } from './src/context/WorkflowsContext';

import InsightsScreen from './src/screens/InsightsScreen';
import WorkflowsScreen from './src/screens/WorkflowsScreen';
import ReviewScreen from './src/screens/ReviewScreen';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
}

const Tab = createBottomTabNavigator();
const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

const tabIcons = {
  Insights: { active: 'flash', inactive: 'flash-outline' },
  Workflows: { active: 'git-branch', inactive: 'git-branch-outline' },
  Review: { active: 'document-text', inactive: 'document-text-outline' },
};

function TabNavigator() {
  const { workflowCount, reviewCount } = useWorkflows();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          paddingBottom: IS_WEB ? 8 : 28,
          height: IS_WEB ? 70 : 80,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: FONT_FAMILY,
        },
        tabBarIcon: ({ focused, color }) => {
          const icons = tabIcons[route.name];
          return <Ionicons name={focused ? icons.active : icons.inactive} size={18} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen
        name="Workflows"
        component={WorkflowsScreen}
        options={{
          tabBarBadge: workflowCount > 0 ? workflowCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.lime,
            color: colors.navy,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 17,
          },
        }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          tabBarBadge: reviewCount > 0 ? reviewCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.lime,
            color: colors.navy,
            fontSize: 10,
            fontWeight: '700',
            minWidth: 18,
            height: 18,
            lineHeight: 17,
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <WorkflowsProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </WorkflowsProvider>
  );
}
