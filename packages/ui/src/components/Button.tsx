/**
 * Button — strict hierarchy: Primary (brand gradient, pill), Secondary (outline),
 * Tertiary (text link). All states: default, pressed (scale 0.97), disabled
 * (opacity 0.4, solid gray — no gradient), loading.
 * Blueprint: Vol 4 §6.1. Accessible: role, label, min height 48, min width 120.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityHint,
  style,
  testID,
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();
  const [pressed, setPressed] = useState(false);
  const isInactive = disabled || loading;

  const baseStyle: ViewStyle = {
    minWidth: variant === 'tertiary' ? undefined : 120,
    height: variant === 'tertiary' ? undefined : 48,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    transform: [{ scale: pressed && !isInactive ? 0.97 : 1 }],
    opacity: disabled ? theme.disabledOpacity : 1,
  };

  const content = loading ? (
    <ActivityIndicator
      color={variant === 'primary' ? '#FFFFFF' : theme.colors.brandPrimary}
      accessibilityLabel="Loading"
    />
  ) : (
    <Typography
      variant="button"
      color={variant === 'primary' ? 'inverse' : variant === 'tertiary' ? 'brand' : 'primary'}
      style={variant === 'primary' ? { color: '#FFFFFF' } : undefined}
    >
      {label}
    </Typography>
  );

  const pressableProps = {
    onPress,
    disabled: isInactive,
    onPressIn: () => setPressed(true),
    onPressOut: () => setPressed(false),
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint,
    accessibilityState: { disabled: isInactive, busy: loading },
    testID,
  };

  if (variant === 'primary') {
    // Disabled primary buttons lose the gradient and become solid gray (Vol 4 §6.1).
    if (disabled) {
      return (
        <Pressable
          {...pressableProps}
          style={[baseStyle, { backgroundColor: theme.colors.statusNeutral.background }, style]}
        >
          {content}
        </Pressable>
      );
    }
    return (
      <Pressable {...pressableProps} style={[{ borderRadius: theme.radius.pill }, style]}>
        <LinearGradient
          colors={[theme.colors.brandGradient.from, theme.colors.brandGradient.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyle}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        {...pressableProps}
        style={[
          baseStyle,
          {
            borderWidth: 1.5,
            borderColor: theme.colors.borderDefault,
            backgroundColor: pressed ? theme.colors.backgroundTertiary : 'transparent',
          },
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      {...pressableProps}
      style={[baseStyle, { minHeight: theme.minTouchTarget }, style]}
    >
      {content}
    </Pressable>
  );
}
