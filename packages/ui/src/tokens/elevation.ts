/**
 * Elevation & shadow tokens — soft, diffused light from above.
 * Blueprint: Vol 4 §3.5. In dark mode, shadows are replaced with subtle border
 * highlights / elevated background lightening.
 */
import type { ViewStyle } from 'react-native';

export type ElevationLevel = 'low' | 'medium' | 'high';

export const lightElevation: Record<ElevationLevel, ViewStyle> = {
  low: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  high: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const darkElevation: Record<ElevationLevel, ViewStyle> = {
  low: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  high: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
};
