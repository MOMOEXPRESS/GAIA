/**
 * Gaia AI Space — chat interface placeholder for Month 1: the orb avatar top
 * bar, a welcome message from Gaia, and a composer bar (disabled until the AI
 * service is wired in Month 2). Blueprint: Vol 3 §4.4.
 */
import React from 'react';
import { View } from 'react-native';
import { Icon, Input, Typography, useTheme } from '@gaia/ui';

export function GaiaAIScreen(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.backgroundPrimary,
        paddingTop: theme.spacing.xxl,
      }}
    >
      {/* Top bar with the Gaia orb */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderDefault,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.insightAccent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Gaia's orb avatar"
        >
          <Icon name="sparkle" size={18} color="#FFFFFF" />
        </View>
        <Typography variant="headingSmall">Gaia</Typography>
      </View>

      {/* Conversation area */}
      <View style={{ flex: 1, padding: theme.spacing.md }}>
        <View
          style={{
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: theme.radius.rounded,
            padding: theme.spacing.md,
            maxWidth: '85%',
            ...theme.elevation.low,
          }}
        >
          <Typography variant="bodyLarge">
            I'm here whenever you need me. Soon you'll be able to ask me about your health,
            your results, and how you're feeling. Remember — I support your care, I never
            replace your doctor.
          </Typography>
        </View>
      </View>

      {/* Composer bar (enabled when the AI service connects) */}
      <View
        style={{
          padding: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderDefault,
        }}
      >
        <Input
          placeholder="Message Gaia (coming soon)"
          editable={false}
          accessibilityLabel="Message Gaia. Chat is coming soon."
        />
      </View>
    </View>
  );
}
