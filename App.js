import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/theme/colors';
import { ActionsProvider, useActions } from './src/context/ActionsContext';

import InsightsScreen from './src/screens/InsightsScreen';
import ActionsScreen from './src/screens/ActionsScreen';

// Inject Montserrat font for web
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
const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 812;
const BEZEL = 10;
const NOTCH_WIDTH = 126;
const NOTCH_HEIGHT = 30;
const CORNER_RADIUS = 40;

const tabIcons = {
  Insights: { active: 'sparkles', inactive: 'sparkles-outline' },
  Actions: { active: 'checkbox', inactive: 'checkbox-outline' },
};

function TabNavigator() {
  const { actionCount } = useActions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 1,
          height: 80,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined,
        },
        tabBarIcon: ({ focused, color }) => {
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

function PhoneFrame({ children }) {
  if (!IS_WEB) return children;

  return (
    <View style={frameStyles.backdrop}>
      <View style={frameStyles.bezel}>
        {/* Dynamic Island / notch */}
        <View style={frameStyles.notch} />
        {/* Screen */}
        <View style={frameStyles.screen}>
          {children}
        </View>
        {/* Home indicator */}
        <View style={frameStyles.homeIndicatorBar}>
          <View style={frameStyles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ActionsProvider>
      <PhoneFrame>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </PhoneFrame>
    </ActionsProvider>
  );
}

const frameStyles = IS_WEB
  ? StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: '#0D1B2A',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      },
      bezel: {
        width: PHONE_WIDTH + BEZEL * 2,
        height: PHONE_HEIGHT + BEZEL * 2,
        backgroundColor: '#111111',
        borderRadius: CORNER_RADIUS + BEZEL,
        padding: BEZEL,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      },
      notch: {
        position: 'absolute',
        top: BEZEL,
        left: '50%',
        marginLeft: -(NOTCH_WIDTH / 2),
        width: NOTCH_WIDTH,
        height: NOTCH_HEIGHT,
        backgroundColor: '#111111',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        zIndex: 10,
      },
      screen: {
        flex: 1,
        borderRadius: CORNER_RADIUS,
        overflow: 'hidden',
        backgroundColor: '#F5F3EE',
      },
      homeIndicatorBar: {
        position: 'absolute',
        bottom: BEZEL + 6,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
      },
      homeIndicator: {
        width: 134,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.25)',
      },
    })
  : StyleSheet.create({
      backdrop: {},
      bezel: {},
      notch: {},
      screen: {},
      homeIndicatorBar: {},
      homeIndicator: {},
    });
