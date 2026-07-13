/**
 * Gaia web shell — Month 1: a token-faithful landing shell demonstrating the
 * design system on web. Follows system appearance (Vol 4 §8). Imports token
 * modules directly (pure TypeScript, no React Native dependency).
 */
import { useEffect, useState } from 'react';
import { lightColors, darkColors } from '@gaia/ui/src/tokens/colors';
import { fontFamilies, typeScale } from '@gaia/ui/src/tokens/typography';
import { spacing } from '@gaia/ui/src/tokens/spacing';
import { radius } from '@gaia/ui/src/tokens/radius';

function usePrefersDark(): boolean {
  const [dark, setDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return dark;
}

export function App(): React.JSX.Element {
  const dark = usePrefersDark();
  const colors = dark ? darkColors : lightColors;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: colors.backgroundPrimary,
        color: colors.textPrimary,
        fontFamily: `${fontFamilies.sans}, system-ui, sans-serif`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontFamily: `${fontFamilies.serif}, Georgia, serif`,
          fontSize: typeScale.displayLarge.fontSize,
          lineHeight: `${typeScale.displayLarge.lineHeight}px`,
          fontWeight: 700,
          letterSpacing: typeScale.displayLarge.letterSpacing,
          margin: 0,
          maxWidth: 640,
        }}
      >
        Your whole health, beautifully understood.
      </h1>
      <p
        style={{
          fontSize: typeScale.bodyLarge.fontSize,
          lineHeight: `${typeScale.bodyLarge.lineHeight}px`,
          color: colors.textSecondary,
          maxWidth: 520,
          marginTop: spacing.md,
        }}
      >
        Gaia is the operating system for your health — connecting every data point, every
        doctor's note, and every insight into one coherent, intelligent narrative.
      </p>
      <a
        href="#"
        style={{
          marginTop: spacing.lg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 120,
          height: 48,
          padding: `0 ${spacing.lg}px`,
          borderRadius: radius.pill,
          background: `linear-gradient(${colors.brandGradient.angle}deg, ${colors.brandGradient.from} 0%, ${colors.brandGradient.to} 100%)`,
          color: '#FFFFFF',
          fontSize: typeScale.button.fontSize,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Get the app
      </a>
    </main>
  );
}
