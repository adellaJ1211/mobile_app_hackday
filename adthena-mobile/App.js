import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import { ActionsProvider, useActions } from './src/context/ActionsContext';

import InsightsScreen from './src/screens/InsightsScreen';
import ActionsScreen from './src/screens/ActionsScreen';

const Tab = createBottomTabNavigator();

const tabIcons = {
  Insights: { active: 'flash', inactive: 'flash-outline' },
  Actions: { active: 'checkbox', inactive: 'checkbox-outline' },
};

function TabNavigator() {
  const { actionCount } = useActions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{
          tabBarBadge: actionCount > 0 ? actionCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            fontSize: 10,
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
    <ActionsProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </ActionsProvider>
  );
}
