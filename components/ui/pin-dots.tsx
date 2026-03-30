import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSequence, withTiming, withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

type Props = { value: string; error?: boolean; onErrorShown?: () => void };

export function PinDots({ value, error, onErrorShown }: Props) {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!error) return;
    shakeX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10,  { duration: 60 }),
      withTiming(-8,  { duration: 60 }),
      withTiming(8,   { duration: 60 }),
      withSpring(0,   { damping: 20, stiffness: 400 }),
    );
    onErrorShown?.();
  }, [error]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  return (
    <Animated.View style={[styles.row, animStyle]}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={[styles.dot, i < value.length && styles.dotFilled]} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', gap: 14, justifyContent: 'center', paddingVertical: 12 },
  dot:       { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: Colors.border },
  dotFilled: { backgroundColor: Colors.accent, borderColor: Colors.accent },
});
