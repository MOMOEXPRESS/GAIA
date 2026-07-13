/**
 * Gaia app root — theme follows system appearance by default (Vol 4 §8),
 * onboarding-first navigation (Vol 3 §4.1), five-space tab bar (Vol 3 §3).
 */
import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeContext, darkTheme, lightTheme } from '@gaia/ui';
import { OnboardingProvider } from './src/state/OnboardingContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App(): React.JSX.Element {
  const systemScheme = useColorScheme();
  const theme = systemScheme === 'dark' ? darkTheme : lightTheme;

  const navTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.backgroundPrimary,
      card: theme.colors.backgroundSecondary,
      text: theme.colors.textPrimary,
      border: theme.colors.borderDefault,
      primary: theme.colors.brandPrimary,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={theme}>
        <OnboardingProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
            <RootNavigator />
          </NavigationContainer>
        </OnboardingProvider>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
