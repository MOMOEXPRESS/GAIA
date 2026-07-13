/**
 * Health Status Dot — 8pt circle using the softened status palette. Status is
 * never conveyed by color alone; always pair with text (Vol 4 §9, Vol 3 §8).
 * Blueprint: Vol 4 §6.7.
 */
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';

export type HealthStatus = 'positive' | 'warning' | 'critical' | 'info' | 'neutral';

export interface StatusDotProps {
  status: HealthStatus;
  size?: number;
  accessibilityLabel?: string;
}

export function StatusDot({
  status,
  size = 8,
  accessibilityLabel,
}: StatusDotProps): React.JSX.Element {
  const theme = useTheme();
  const color = {
    positive: theme.colors.statusPositive.foreground,
    warning: theme.colors.statusWarning.foreground,
    critical: theme.colors.statusCritical.foreground,
    info: theme.colors.statusInfo.foreground,
    neutral: theme.colors.statusNeutral.foreground,
  }[status];

  return (
    <View
      accessibilityLabel={accessibilityLabel ?? `Status: ${status}`}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
    />
  );
}
