/**
 * Home (Dashboard) — static Month 1 version with the Blueprint's new-user
 * empty state: an incomplete ring with "Establishing your baseline… 3 days to
 * go", a highlight card explaining how Gaia works, and a snapshot strip of
 * placeholders. Blueprint: Vol 3 §4.2 (layout + Empty State).
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Icon, Typography, useTheme } from '@gaia/ui';
import { useOnboarding } from '../state/OnboardingContext';

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const snapshotPlaceholders = ['Steps', 'Sleep', 'Heart Rate', 'Mood'] as const;

export function HomeScreen(): React.JSX.Element {
  const theme = useTheme();
  const { firstName } = useOnboarding();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}
      contentContainerStyle={{ padding: theme.spacing.md, paddingTop: theme.spacing.xxl }}
    >
      {/* 1. Dynamic Header */}
      <Typography variant="displayLarge" serif>
        {greetingForNow()}, {firstName.trim() || 'friend'}
      </Typography>

      {/* 2. Readiness Ring — empty state: soft incomplete circle */}
      <View style={{ alignItems: 'center', marginTop: theme.spacing.xl }}>
        <View
          accessibilityLabel="Your Readiness Score is being established. 3 days to go."
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            borderWidth: 10,
            borderColor: theme.colors.backgroundTertiary,
            borderTopColor: theme.colors.brandPrimary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="bodyMedium" color="secondary" style={{ textAlign: 'center' }}>
            Establishing your{'\n'}baseline…
          </Typography>
          <Typography variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xxs }}>
            3 days to go
          </Typography>
        </View>
      </View>

      {/* 3. Highlight Card — first insight (Vol 3 §4.1 Step 6) */}
      <Card variant="insight" style={{ marginTop: theme.spacing.xl }}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'center' }}>
          <Icon name="sparkle" color={theme.colors.insightAccent} size={20} />
          <Typography variant="headingSmall">Getting to know you</Typography>
        </View>
        <Typography variant="bodyMedium" color="secondary" style={{ marginTop: theme.spacing.xs }}>
          I'm getting to know your body. Over the next few days, I'll establish your baselines.
          For now, feel free to explore.
        </Typography>
      </Card>

      {/* 4. Daily Snapshot Strip — placeholders with educational empty state */}
      <Typography variant="headingMedium" style={{ marginTop: theme.spacing.xl }}>
        Daily snapshot
      </Typography>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: theme.spacing.sm }}
        contentContainerStyle={{ gap: theme.spacing.sm }}
      >
        {snapshotPlaceholders.map((metric) => (
          <Card key={metric} style={{ width: 140 }}>
            <Typography variant="bodySmall" color="secondary">
              {metric}
            </Typography>
            <Typography variant="headingMedium" color="tertiary" style={{ marginTop: theme.spacing.xs }}>
              —
            </Typography>
            <Typography variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xxs }}>
              Waiting for data
            </Typography>
          </Card>
        ))}
      </ScrollView>

      {/* 5. Up Next — calm, no alarms */}
      <Typography variant="headingMedium" style={{ marginTop: theme.spacing.xl }}>
        Up next
      </Typography>
      <Card style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl }}>
        <Typography variant="bodyMedium" color="secondary">
          Nothing scheduled. When you have appointments, medication doses, or check-ins,
          they'll appear here.
        </Typography>
      </Card>
    </ScrollView>
  );
}
