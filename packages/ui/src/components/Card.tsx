/**
 * Card — primary information container. Variants: default, metric, insight.
 * - default/metric: radius-rounded, padding space-md, background-secondary, elevation-low.
 * - insight: subtle left accent border in insight purple (AI) or brand teal.
 * Blueprint: Vol 4 §6.2.
 */
import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'insight';
  /** Insight cards default to the AI insight accent (Vol 4 §6.2). */
  accent?: 'insight' | 'brand';
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Card({
  children,
  variant = 'default',
  accent = 'insight',
  onPress,
  accessibilityLabel,
  style,
  testID,
}: CardProps): React.JSX.Element {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    borderRadius: theme.radius.rounded,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    ...theme.elevation.low,
    ...(variant === 'insight'
      ? {
          borderLeftWidth: 3,
          borderLeftColor:
            accent === 'insight' ? theme.colors.insightAccent : theme.colors.brandPrimary,
        }
      : {}),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.9 : 1 }, style]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[cardStyle, style]} accessibilityLabel={accessibilityLabel} testID={testID}>
      {children}
    </View>
  );
}
