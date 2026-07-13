/**
 * Timeline Space — the unified health feed. Month 1 shows the educational
 * empty state until events flow from the backend projection. Blueprint: Vol 3
 * §4.5, Vol 3 §7 (empty states).
 */
import React from 'react';
import { View } from 'react-native';
import { EmptyState, Typography, useTheme } from '@gaia/ui';

export function TimelineScreen(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.backgroundPrimary,
        paddingTop: theme.spacing.xxl,
      }}
    >
      <Typography variant="headingLarge" style={{ paddingHorizontal: theme.spacing.md }}>
        Timeline
      </Typography>
      <EmptyState
        icon="timeline"
        headline="Your health story starts here"
        description="Every health event — doctor visits, lab results, symptoms, sleep, and insights — will appear here as one beautiful, private story."
      />
    </View>
  );
}
