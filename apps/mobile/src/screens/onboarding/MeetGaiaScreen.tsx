/**
 * Onboarding Step 5: Meet Gaia (AI Introduction) — a simulated chat bubble that
 * sets honest expectations: "I'll never replace your doctor... I promise to be
 * honest about what I don't know." Quick-reply completes onboarding into Home.
 * Blueprint: Vol 3 §4.1 Steps 5–6.
 */
import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Icon, Typography, useTheme } from '@gaia/ui';
import { useOnboarding } from '../../state/OnboardingContext';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'MeetGaia'>;

export function MeetGaiaScreen(_props: Props): React.JSX.Element {
  const theme = useTheme();
  const { firstName, complete } = useOnboarding();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.backgroundPrimary,
        justifyContent: 'center',
        padding: theme.spacing.xl,
      }}
    >
      {/* Gaia orb avatar (Vol 4 §5.3) */}
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: theme.colors.insightAccent,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.lg,
          alignSelf: 'center',
        }}
        accessibilityLabel="Gaia's glowing orb avatar"
      >
        <Icon name="sparkle" size={32} color="#FFFFFF" />
      </View>

      <View
        style={{
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.radius.rounded,
          padding: theme.spacing.md,
          ...theme.elevation.low,
        }}
        accessibilityRole="text"
      >
        <Typography variant="bodyLarge">
          Hi {firstName.trim() || 'there'}, I'm Gaia. I'll help you understand your health, but
          I'll never replace your doctor. I'll learn about you over time, and I promise to be
          honest about what I don't know.
        </Typography>
      </View>

      <Button
        label="Sounds good!"
        onPress={complete}
        accessibilityHint="Finishes onboarding and takes you to your Home dashboard"
        style={{ marginTop: theme.spacing.xl }}
      />
    </View>
  );
}
