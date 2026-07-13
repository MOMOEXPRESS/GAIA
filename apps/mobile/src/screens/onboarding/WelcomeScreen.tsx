/**
 * Onboarding Step 1: Welcome — the "health web" moment. A single phrase:
 * "Your health, beautifully understood." No sign-up button yet, only a gentle
 * "Let's begin." Blueprint: Vol 3 §4.1 Step 1.
 */
import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Icon, Typography, useTheme } from '@gaia/ui';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.backgroundPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
      }}
    >
      {/* Placeholder for the animated "health web" illustration (Vol 4 §5.2). */}
      <View
        style={{
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: theme.colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl,
        }}
        accessibilityLabel="An illustration of people connected by flowing lines — the health web"
      >
        <Icon name="sparkle" size={64} color={theme.colors.brandPrimary} />
      </View>

      <Typography variant="displayLarge" serif style={{ textAlign: 'center' }}>
        Your health, beautifully understood.
      </Typography>

      <Button
        label="Let's begin"
        onPress={() => navigation.navigate('IdentityPrivacy')}
        accessibilityHint="Starts setting up your Gaia experience"
        style={{ marginTop: theme.spacing.xxl }}
      />
    </View>
  );
}
