/**
 * Typography tokens — single family (Inter) plus Lora for rare emotional moments.
 * Blueprint: Vol 4 §3.2. Sizes converted from the rem-based scale (base 16px)
 * to the pixel values stated inline in the Blueprint table.
 */

export const fontFamilies = {
  /** Primary UI typeface across all platforms. */
  sans: 'Inter',
  /** Secondary serif for display quotes, onboarding greetings, milestone cards. */
  serif: 'Lora',
} as const;

export interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing: number;
}

export const typeScale = {
  displayLarge: { fontSize: 40, lineHeight: 48, fontWeight: '700', letterSpacing: -0.5 },
  displayMedium: { fontSize: 32, lineHeight: 40, fontWeight: '600', letterSpacing: 0 },
  headingLarge: { fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: 0 },
  headingMedium: { fontSize: 20, lineHeight: 28, fontWeight: '600', letterSpacing: 0 },
  headingSmall: { fontSize: 18, lineHeight: 27, fontWeight: '600', letterSpacing: 0 },
  bodyLarge: { fontSize: 16, lineHeight: 26, fontWeight: '400', letterSpacing: 0 },
  bodyMedium: { fontSize: 15, lineHeight: 24, fontWeight: '400', letterSpacing: 0 },
  bodySmall: { fontSize: 13, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '500', letterSpacing: 0.5 },
  button: { fontSize: 15, lineHeight: 18, fontWeight: '600', letterSpacing: 0 },
} as const satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof typeScale;
