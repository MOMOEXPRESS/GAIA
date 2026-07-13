/**
 * Onboarding Step 3: Health Goals & Context — "What brings you to Gaia?" with
 * selectable friendly cards; multiple selections allowed. Seeds the initial
 * dashboard configuration. Blueprint: Vol 3 §4.1 Step 3.
 */
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HealthGoal } from '@gaia/shared-types';
import { Button, Icon, Typography, useTheme } from '@gaia/ui';
import { useOnboarding } from '../../state/OnboardingContext';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HealthGoals'>;

const goalOptions: Array<{ goal: HealthGoal; label: string }> = [
  { goal: 'understand_my_health', label: 'Understand my health better' },
  { goal: 'manage_a_condition', label: 'Manage a condition' },
  { goal: 'improve_fitness', label: 'Improve fitness' },
  { goal: 'support_mental_wellness', label: 'Support mental wellness' },
  { goal: 'track_family_health', label: 'Track family health' },
  { goal: 'just_explore', label: 'Just explore' },
];

export function HealthGoalsScreen({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const { healthGoals, toggleHealthGoal } = useOnboarding();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}
      contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: theme.spacing.xxl }}
    >
      <Typography variant="headingLarge">What brings you to Gaia?</Typography>
      <Typography variant="bodyMedium" color="secondary" style={{ marginTop: theme.spacing.xs }}>
        Choose as many as you like. You can change these anytime.
      </Typography>

      <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        {goalOptions.map(({ goal, label }) => {
          const selected = healthGoals.includes(goal);
          return (
            <Pressable
              key={goal}
              onPress={() => toggleHealthGoal(goal)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={label}
              style={{
                minHeight: 56,
                borderRadius: theme.radius.rounded,
                borderWidth: 1.5,
                borderColor: selected ? theme.colors.brandPrimary : theme.colors.borderDefault,
                backgroundColor: selected
                  ? theme.colors.statusPositive.background
                  : theme.colors.backgroundSecondary,
                paddingHorizontal: theme.spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="bodyLarge">{label}</Typography>
              {selected ? <Icon name="check" color={theme.colors.brandPrimary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Button
        label="Continue"
        onPress={() => navigation.navigate('DataConnection')}
        style={{ marginTop: theme.spacing.xl }}
      />
    </ScrollView>
  );
}
