/**
 * The Five Spaces — Home, Health, Gaia AI, Timeline, Me. Always accessible via
 * a persistent bottom tab bar; active icon uses the brand color, inactive icons
 * are neutral gray outline. Blueprint: Vol 3 §3, Vol 4 §6.4.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, useTheme, type IconName } from '@gaia/ui';
import { HomeScreen } from '../screens/HomeScreen';
import { HealthScreen } from '../screens/HealthScreen';
import { GaiaAIScreen } from '../screens/GaiaAIScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { MeScreen } from '../screens/MeScreen';

export type MainTabParamList = {
  Home: undefined;
  Health: undefined;
  GaiaAI: undefined;
  Timeline: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabIcons: Record<keyof MainTabParamList, IconName> = {
  Home: 'home',
  Health: 'health',
  GaiaAI: 'gaia-ai',
  Timeline: 'timeline',
  Me: 'me',
};

export function MainTabs(): React.JSX.Element {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brandPrimary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundSecondary,
          borderTopColor: theme.colors.borderDefault,
          height: 56 + 24,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fontFamilies.sans,
          fontSize: theme.typeScale.caption.fontSize,
          fontWeight: theme.typeScale.caption.fontWeight,
        },
        tabBarIcon: ({ color, size }) => (
          <Icon name={tabIcons[route.name as keyof MainTabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Health" component={HealthScreen} options={{ tabBarLabel: 'Health' }} />
      <Tab.Screen name="GaiaAI" component={GaiaAIScreen} options={{ tabBarLabel: 'Gaia AI' }} />
      <Tab.Screen name="Timeline" component={TimelineScreen} options={{ tabBarLabel: 'Timeline' }} />
      <Tab.Screen name="Me" component={MeScreen} options={{ tabBarLabel: 'Me' }} />
    </Tab.Navigator>
  );
}
