/**
 * Me Space — profile, data & privacy, settings. Month 1: static layout with
 * the sections the Blueprint mandates, including a prominent (never hidden)
 * "Download My Data". Blueprint: Vol 3 §4.6.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Typography, useTheme } from '@gaia/ui';
import { useOnboarding } from '../state/OnboardingContext';

export function MeScreen(): React.JSX.Element {
  const theme = useTheme();
  const { firstName, connectedSources } = useOnboarding();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}
      contentContainerStyle={{ padding: theme.spacing.md, paddingTop: theme.spacing.xxl }}
    >
      {/* Profile header */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.backgroundTertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={`Profile avatar for ${firstName.trim() || 'you'}`}
        >
          <Typography variant="headingLarge" color="brand">
            {(firstName.trim()[0] ?? 'G').toUpperCase()}
          </Typography>
        </View>
        <Typography variant="headingMedium" style={{ marginTop: theme.spacing.sm }}>
          {firstName.trim() || 'Your profile'}
        </Typography>
        <Typography variant="caption" color="tertiary">
          Member since 2026 · {connectedSources.length} connected source
          {connectedSources.length === 1 ? '' : 's'}
        </Typography>
      </View>

      {/* Data & Privacy */}
      <Typography variant="headingSmall">Data & Privacy</Typography>
      <Card style={{ marginTop: theme.spacing.sm }}>
        <Typography variant="bodyMedium" color="secondary">
          Your data belongs to you. Export it anytime in FHIR and CSV formats.
        </Typography>
        <Button
          label="Download My Data"
          variant="secondary"
          onPress={() => {
            /* Wired to Health Graph bulk export when the API connects (Vol 8 §3.12). */
          }}
          style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }}
        />
      </Card>

      {/* Settings */}
      <Typography variant="headingSmall" style={{ marginTop: theme.spacing.lg }}>
        Settings
      </Typography>
      <Card style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl }}>
        {['Notifications', 'Home Layout', 'Appearance', 'Security', 'Language & Region'].map(
          (item, index) => (
            <View
              key={item}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.borderDefault,
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item} settings`}
            >
              <Typography variant="bodyLarge">{item}</Typography>
            </View>
          ),
        )}
      </Card>
    </ScrollView>
  );
}
