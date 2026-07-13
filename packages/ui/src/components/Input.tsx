/**
 * Text Input — radius-default, border-default, background-secondary, height 48.
 * Focus: border-focus with a gentle glow. Error: border-critical with message
 * below in text-body-small. Blueprint: Vol 4 §6.3.
 */
import React, { useState } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Typography } from './Typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  containerStyle,
  ...rest
}: InputProps): React.JSX.Element {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.statusCritical.foreground
    : focused
      ? theme.colors.borderFocus
      : theme.colors.borderDefault;

  return (
    <View style={containerStyle}>
      {label ? (
        <Typography variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.xxs }}>
          {label}
        </Typography>
      ) : null}
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        accessibilityLabel={label ?? rest.placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        style={{
          height: 48,
          borderRadius: theme.radius.default,
          borderWidth: 1,
          borderColor,
          backgroundColor: theme.colors.backgroundSecondary,
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.md,
          fontFamily: theme.fontFamilies.sans,
          fontSize: theme.typeScale.bodyLarge.fontSize,
          color: theme.colors.textPrimary,
          // Gentle focus glow (box-shadow equivalent), Vol 4 §6.3.
          ...(focused && !error
            ? { shadowColor: theme.colors.brandPrimary, shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }
            : {}),
        }}
      />
      {error ? (
        <Typography
          variant="bodySmall"
          style={{ color: theme.colors.statusCritical.foreground, marginTop: theme.spacing.xxs }}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Typography>
      ) : null}
    </View>
  );
}
