/**
 * Typography component — renders text in a Blueprint type-scale variant.
 * Blueprint: Vol 4 §3.2. Supports Dynamic Type via allowFontScaling (default on),
 * per Vol 4 §9 (layouts must reflow up to 2x scale).
 */
import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useTheme } from '../theme';
import type { TypeVariant } from '../tokens/typography';

export interface TypographyProps extends TextProps {
  variant?: TypeVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'brand' | 'inverse';
  /** Lora serif for rare emotional moments (onboarding greetings, milestones). */
  serif?: boolean;
  children: React.ReactNode;
}

export function Typography({
  variant = 'bodyLarge',
  color = 'primary',
  serif = false,
  style,
  children,
  ...rest
}: TypographyProps): React.JSX.Element {
  const theme = useTheme();
  const scale = theme.typeScale[variant];
  const colorValue = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    brand: theme.colors.brandPrimary,
    inverse: theme.mode === 'light' ? '#FFFFFF' : '#1A1A1A',
  }[color];

  return (
    <Text
      allowFontScaling
      maxFontSizeMultiplier={2}
      {...rest}
      style={[
        {
          fontFamily: serif ? theme.fontFamilies.serif : theme.fontFamilies.sans,
          fontSize: scale.fontSize,
          lineHeight: scale.lineHeight,
          fontWeight: scale.fontWeight,
          letterSpacing: scale.letterSpacing,
          color: colorValue,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
