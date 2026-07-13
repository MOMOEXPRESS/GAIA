/**
 * Skeleton loading placeholder — shape-matching rounded rectangles with a
 * gentle pulse (shimmer simplified to opacity animation; respects Reduce
 * Motion by rendering static). Blueprint: Vol 4 §6.9, Vol 3 §7.
 */
import React, { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { useTheme } from '../theme';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
}: SkeletonProps): React.JSX.Element {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: theme.motion.duration.gentle,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: theme.motion.duration.gentle,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    });
    return () => animation?.stop();
  }, [opacity, theme.motion.duration.gentle]);

  return (
    <Animated.View
      accessibilityLabel="Loading"
      style={{
        width,
        height,
        borderRadius: borderRadius ?? theme.radius.default,
        backgroundColor: theme.colors.backgroundTertiary,
        opacity,
      }}
    />
  );
}
