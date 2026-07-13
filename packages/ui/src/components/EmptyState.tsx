/**
 * Empty State — illustration placeholder (top), headline (heading-medium),
 * description (body-medium, text-secondary), optional CTA. Center aligned.
 * A blank screen is an opportunity to educate (Vol 3 §7).
 * Blueprint: Vol 4 §6.9.
 */
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Typography } from './Typography';

export interface EmptyStateProps {
  icon?: IconName;
  headline: string;
  description: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export function EmptyState({
  icon = 'sparkle',
  headline,
  description,
  ctaLabel,
  onCtaPress,
}: EmptyStateProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
        paddingHorizontal: theme.spacing.xl,
      }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: theme.colors.backgroundTertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.lg,
        }}
      >
        <Icon name={icon} size={40} color={theme.colors.brandPrimary} />
      </View>
      <Typography variant="headingMedium" style={{ textAlign: 'center' }}>
        {headline}
      </Typography>
      <Typography
        variant="bodyMedium"
        color="secondary"
        style={{ textAlign: 'center', marginTop: theme.spacing.xs }}
      >
        {description}
      </Typography>
      {ctaLabel && onCtaPress ? (
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          style={{ marginTop: theme.spacing.lg }}
        />
      ) : null}
    </View>
  );
}
