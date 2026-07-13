/**
 * Gaia color tokens — semantic model: tokens describe intent, not appearance.
 * Blueprint: Vol 4 §3.1. Values are copied verbatim from the Blueprint tables.
 */

export interface StatusColorSet {
  background: string;
  foreground: string;
}

export interface ColorScheme {
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  borderDefault: string;
  borderFocus: string;
  brandPrimary: string;
  brandPrimaryHover: string;
  brandSecondary: string;
  /** Rendered as linear-gradient(135deg, from 0%, to 100%). */
  brandGradient: { from: string; to: string; angle: number };
  statusPositive: StatusColorSet;
  statusWarning: StatusColorSet;
  statusCritical: StatusColorSet;
  statusInfo: StatusColorSet;
  statusNeutral: StatusColorSet;
  /** AI-generated cards and the Gaia orb — distinct from medical data (Vol 4 §3.1). */
  insightAccent: string;
  /** Used sparingly to highlight "remembered" personal data. */
  memoryAccent: string;
  /** Overlay background for modals (Vol 4 §3.6). */
  overlay: string;
}

export const lightColors: ColorScheme = {
  backgroundPrimary: '#FAF9F7',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F0EFED',
  textPrimary: '#1A1A1A',
  textSecondary: '#5C5B5E',
  textTertiary: '#8E8D92',
  borderDefault: '#E0DEDC',
  borderFocus: '#007B6E',
  brandPrimary: '#007B6E',
  brandPrimaryHover: '#00695D',
  brandSecondary: '#4A90D9',
  brandGradient: { from: '#007B6E', to: '#4A90D9', angle: 135 },
  statusPositive: { background: '#E6F4EA', foreground: '#1E7B3B' },
  statusWarning: { background: '#FFF3E0', foreground: '#B85C00' },
  statusCritical: { background: '#FDE8E8', foreground: '#C62828' },
  statusInfo: { background: '#E3F2FD', foreground: '#1565C0' },
  statusNeutral: { background: '#F0EFED', foreground: '#5C5B5E' },
  insightAccent: '#7C4DFF',
  memoryAccent: '#FF9F4B',
  overlay: 'rgba(0,0,0,0.4)',
};

export const darkColors: ColorScheme = {
  backgroundPrimary: '#121113',
  backgroundSecondary: '#1E1D20',
  backgroundTertiary: '#28272B',
  textPrimary: '#EDEDED',
  textSecondary: '#A0A0A5',
  textTertiary: '#6B6A6F',
  borderDefault: '#3A393D',
  borderFocus: '#00C8B0',
  brandPrimary: '#00C8B0',
  brandPrimaryHover: '#00E0C5',
  brandSecondary: '#6DB3F2',
  brandGradient: { from: '#00C8B0', to: '#6DB3F2', angle: 135 },
  statusPositive: { background: '#1A3A24', foreground: '#4ADE80' },
  statusWarning: { background: '#3A2E1A', foreground: '#FFB84D' },
  statusCritical: { background: '#3A1C1C', foreground: '#F87171' },
  statusInfo: { background: '#1A2E4A', foreground: '#64B5F6' },
  statusNeutral: { background: '#28272B', foreground: '#A0A0A5' },
  insightAccent: '#7C4DFF',
  memoryAccent: '#FF9F4B',
  overlay: 'rgba(0,0,0,0.6)',
};

/**
 * 10-color qualitative data-visualization palette (Vol 4 §3.1),
 * ensuring perceptual distinction and accessibility.
 */
export const dataVizPalette = [
  '#007B6E', // Teal
  '#4A90D9', // Blue
  '#F5A623', // Amber
  '#7C4DFF', // Purple
  '#E94E77', // Coral
  '#50C878', // Emerald
  '#FF7F50', // Warm Orange
  '#6C5B7B', // Muted Plum
  '#BDB76B', // Olive
  '#88B04B', // Sage
] as const;
