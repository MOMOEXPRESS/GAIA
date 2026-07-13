/**
 * Root navigation: onboarding stack until completed, then the five-space tabs.
 * Blueprint: Vol 3 §3 (Five Spaces), §4.1 (Onboarding).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../state/OnboardingContext';
import { MainTabs } from './MainTabs';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { IdentityPrivacyScreen } from '../screens/onboarding/IdentityPrivacyScreen';
import { HealthGoalsScreen } from '../screens/onboarding/HealthGoalsScreen';
import { DataConnectionScreen } from '../screens/onboarding/DataConnectionScreen';
import { MeetGaiaScreen } from '../screens/onboarding/MeetGaiaScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  IdentityPrivacy: undefined;
  HealthGoals: undefined;
  DataConnection: undefined;
  MeetGaia: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function RootNavigator(): React.JSX.Element {
  const { completed } = useOnboarding();

  if (completed) {
    return <MainTabs />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="IdentityPrivacy" component={IdentityPrivacyScreen} />
      <Stack.Screen name="HealthGoals" component={HealthGoalsScreen} />
      <Stack.Screen name="DataConnection" component={DataConnectionScreen} />
      <Stack.Screen name="MeetGaia" component={MeetGaiaScreen} />
    </Stack.Navigator>
  );
}
