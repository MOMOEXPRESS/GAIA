/**
 * Onboarding Step 2: Identity & Privacy Promise — first name only, plus a clear
 * jargon-free privacy statement. Blueprint: Vol 3 §4.1 Step 2.
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Typography, useTheme } from '@gaia/ui';
import { useOnboarding } from '../../state/OnboardingContext';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'IdentityPrivacy'>;

export function IdentityPrivacyScreen({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const { firstName, setFirstName } = useOnboarding();
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.backgroundPrimary,
        justifyContent: 'center',
        padding: theme.spacing.xl,
      }}
    >
      <Typography variant="headingLarge">What should we call you?</Typography>
      <Input
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Your first name"
        autoFocus
        containerStyle={{ marginTop: theme.spacing.lg }}
      />

      <Typography variant="bodyMedium" color="secondary" style={{ marginTop: theme.spacing.lg }}>
        Gaia never sells your data. You control everything you share.
      </Typography>
      <Button
        label="Learn more"
        variant="tertiary"
        onPress={() => setShowPrivacy((v) => !v)}
        accessibilityHint="Shows a simple overview of how Gaia protects your privacy"
      />
      {showPrivacy ? (
        <Typography variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs }}>
          Your health data belongs to you. You can access it, export it, delete it, or share it
          with anyone you choose — and revoke that access at any time. Gaia is a custodian,
          never an owner.
        </Typography>
      ) : null}

      <Button
        label="Continue"
        onPress={() => navigation.navigate('HealthGoals')}
        disabled={firstName.trim().length === 0}
        style={{ marginTop: theme.spacing.xl }}
      />
    </View>
  );
}
