/**
 * Icon — Gaia's custom icon set is a 24x24 grid, 2px rounded stroke (Vol 4 §4).
 * Month 1 ("The Seed") ships a placeholder glyph implementation inside a
 * 24x24 touch-safe frame; the custom SVG sprite replaces the glyph map without
 * changing this component's API.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme';

export type IconName =
  | 'home'
  | 'health'
  | 'gaia-ai'
  | 'timeline'
  | 'me'
  | 'add'
  | 'search'
  | 'sparkle'
  | 'warning'
  | 'check'
  | 'lock'
  | 'heart'
  | 'moon'
  | 'flask'
  | 'pill';

const glyphs: Record<IconName, string> = {
  home: '⌂',
  health: '♥',
  'gaia-ai': '✦',
  timeline: '↕',
  me: '◉',
  add: '+',
  search: '⌕',
  sparkle: '✦',
  warning: '△',
  check: '✓',
  lock: '🔒',
  heart: '♥',
  moon: '☾',
  flask: '⚗',
  pill: '⬭',
};

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

export function Icon({ name, size = 24, color, accessibilityLabel }: IconProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={!accessibilityLabel}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: size * 0.83, color: color ?? theme.colors.textSecondary }}>
        {glyphs[name]}
      </Text>
    </View>
  );
}
