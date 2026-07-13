/**
 * Health Space — Overview view: a grid of health-domain category cards, each
 * with an educational empty state until data is connected. Blueprint: Vol 3
 * §4.3, empty-state guidance in Vol 3 §7.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Icon, Typography, useTheme, type IconName } from '@gaia/ui';

const domains: Array<{ icon: IconName; title: string }> = [
  { icon: 'heart', title: 'Vitals' },
  { icon: 'timeline', title: 'Activity' },
  { icon: 'moon', title: 'Sleep' },
  { icon: 'gaia-ai', title: 'Mental Wellness' },
  { icon: 'health', title: 'Conditions' },
  { icon: 'pill', title: 'Medications' },
  { icon: 'flask', title: 'Labs' },
  { icon: 'check', title: 'Immunizations & Allergies' },
];

export function HealthScreen(): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}
      contentContainerStyle={{ padding: theme.spacing.md, paddingTop: theme.spacing.xxl }}
    >
      <Typography variant="headingLarge">Health</Typography>
      <Typography variant="bodyMedium" color="secondary" style={{ marginTop: theme.spacing.xs }}>
        Your health record, beautifully organized.
      </Typography>

      <View
        style={{
          marginTop: theme.spacing.lg,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xxl,
        }}
      >
        {domains.map(({ icon, title }) => (
          <Card key={title} style={{ width: '47%' }} accessibilityLabel={`${title}. No data yet.`}>
            <Icon name={icon} color={theme.colors.brandPrimary} />
            <Typography variant="headingSmall" style={{ marginTop: theme.spacing.xs }}>
              {title}
            </Typography>
            <Typography variant="caption" color="tertiary" style={{ marginTop: theme.spacing.xxs }}>
              No data yet
            </Typography>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
