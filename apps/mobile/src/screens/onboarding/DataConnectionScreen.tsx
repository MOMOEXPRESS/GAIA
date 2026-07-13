/**
 * Onboarding Step 4: Data Connection (Permission Priming) — illustrative cards
 * per data source explaining what data it provides and how Gaia uses it. The
 * user can "Connect" or "Maybe later"; autonomy is respected. Blueprint: Vol 3
 * §4.1 Step 4.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Icon, Typography, useTheme, type IconName } from '@gaia/ui';
import { useOnboarding } from '../../state/OnboardingContext';
import type { OnboardingStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DataConnection'>;

const sources: Array<{ id: string; icon: IconName; title: string; description: string }> = [
  {
    id: 'health-platform',
    icon: 'heart',
    title: 'Apple Health / Health Connect',
    description: 'Steps, heart rate, sleep, and workouts — so Gaia can learn your baselines.',
  },
  {
    id: 'wearables',
    icon: 'moon',
    title: 'Wearable devices',
    description: 'Continuous signals from your watch, ring, or band for richer insights.',
  },
  {
    id: 'medical-records',
    icon: 'flask',
    title: 'Medical records',
    description: 'Labs, conditions, and visit notes from your providers — with your consent.',
  },
];

export function DataConnectionScreen({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const { connectedSources, connectSource } = useOnboarding();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}
      contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: theme.spacing.xxl }}
    >
      <Typography variant="headingLarge">Connect your health data</Typography>
      <Typography variant="bodyMedium" color="secondary" style={{ marginTop: theme.spacing.xs }}>
        You choose what Gaia can see. Everything is optional, and you can change it later.
      </Typography>

      <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        {sources.map((source) => {
          const connected = connectedSources.includes(source.id);
          return (
            <Card key={source.id}>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <Icon name={source.icon} color={theme.colors.brandPrimary} />
                <View style={{ flex: 1 }}>
                  <Typography variant="headingSmall">{source.title}</Typography>
                  <Typography
                    variant="bodyMedium"
                    color="secondary"
                    style={{ marginTop: theme.spacing.xxs }}
                  >
                    {source.description}
                  </Typography>
                  <Button
                    label={connected ? 'Connected' : 'Connect'}
                    variant={connected ? 'secondary' : 'primary'}
                    disabled={connected}
                    onPress={() => connectSource(source.id)}
                    style={{ marginTop: theme.spacing.sm, alignSelf: 'flex-start' }}
                  />
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      <Button
        label="Continue"
        onPress={() => navigation.navigate('MeetGaia')}
        style={{ marginTop: theme.spacing.xl }}
      />
      <Button
        label="Maybe later"
        variant="tertiary"
        onPress={() => navigation.navigate('MeetGaia')}
        style={{ marginTop: theme.spacing.xs }}
      />
    </ScrollView>
  );
}
