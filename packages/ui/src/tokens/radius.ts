/**
 * Radius & shape tokens — soft and approachable; sharp corners avoided.
 * Blueprint: Vol 4 §3.4.
 */
export const radius = {
  /** 4px — small elements like badges, tooltips */
  sharp: 4,
  /** 8px — standard buttons, inputs, cards */
  default: 8,
  /** 12px — larger cards, modals, sheets */
  rounded: 12,
  /** 999px — tabs, chips, circular avatars, FAB */
  pill: 999,
} as const;
