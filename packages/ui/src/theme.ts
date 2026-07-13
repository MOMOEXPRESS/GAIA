/**
 * Gaia theme — composition of all design tokens for light and dark modes.
 * Blueprint: Vol 4 §3 (tokens), §8 (Light & Dark Mode). Default setting follows
 * system appearance; users can override in Me > Appearance (Vol 3 §4.6).
 */
import { createContext, useContext } from 'react';
import {
  type ColorScheme,
  darkColors,
  dataVizPalette,
  lightColors,
} from './tokens/colors';
import { darkElevation, lightElevation, type ElevationLevel } from './tokens/elevation';
import { motionDuration, motionEasing, motionSpring } from './tokens/motion';
import { radius } from './tokens/radius';
import { spacing } from './tokens/spacing';
import { fontFamilies, typeScale } from './tokens/typography';
import type { ViewStyle } from 'react-native';

export interface GaiaTheme {
  mode: 'light' | 'dark';
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  typeScale: typeof typeScale;
  fontFamilies: typeof fontFamilies;
  elevation: Record<ElevationLevel, ViewStyle>;
  motion: {
    duration: typeof motionDuration;
    easing: typeof motionEasing;
    spring: typeof motionSpring;
  };
  dataVizPalette: typeof dataVizPalette;
  /** Minimum touch target — 44pt, most interactive elements 48pt+ (Vol 4 §9). */
  minTouchTarget: number;
  /** Disabled state opacity (Vol 4 §3.6). */
  disabledOpacity: number;
}

const shared = {
  spacing,
  radius,
  typeScale,
  fontFamilies,
  motion: { duration: motionDuration, easing: motionEasing, spring: motionSpring },
  dataVizPalette,
  minTouchTarget: 44,
  disabledOpacity: 0.4,
} as const;

export const lightTheme: GaiaTheme = {
  mode: 'light',
  colors: lightColors,
  elevation: lightElevation,
  ...shared,
};

export const darkTheme: GaiaTheme = {
  mode: 'dark',
  colors: darkColors,
  elevation: darkElevation,
  ...shared,
};

export const ThemeContext = createContext<GaiaTheme>(lightTheme);

export function useTheme(): GaiaTheme {
  return useContext(ThemeContext);
}
