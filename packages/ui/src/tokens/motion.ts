/**
 * Motion design tokens — Gentle, Meaningful, Responsive.
 * Blueprint: Vol 4 §7.2 (durations/easings), §7.4 (haptic map).
 * When "Reduce Motion" is enabled, durations are set to 0 and animations
 * replaced by opacity fades (Vol 4 §9).
 */

export const motionDuration = {
  /** 100ms — button press feedback, toggles */
  instant: 100,
  /** 200ms — card expansion, sheet open */
  fast: 200,
  /** 300ms — page transitions, modal appear */
  normal: 300,
  /** 500ms — onboarding animations, ring drawing */
  slow: 500,
  /** 800ms — AI typing indicators, ambient pulses */
  gentle: 800,
} as const;

/** cubic-bezier control points per Blueprint Vol 4 §7.2. */
export const motionEasing = {
  standardEaseOut: [0.0, 0.0, 0.2, 1.0],
  standard: [0.4, 0.0, 0.2, 1.0],
  emphasized: [0.4, 0.0, 0.6, 1.0],
} as const;

/** Spring config for interactive drag/swipe (Vol 4 §7.2). */
export const motionSpring = { damping: 0.7, stiffness: 200 } as const;

/** Haptic feedback map (Vol 4 §7.4). Disabled when system vibration is off. */
export const hapticMap = {
  buttonTapPrimary: 'light',
  successfulSave: 'medium',
  toggle: 'light',
  errorWarning: 'warning',
  pullToRefreshEnd: 'light',
  sheetDismiss: 'soft',
} as const;
