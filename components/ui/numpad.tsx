import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

type Props = { value: string; onChange: (v: string) => void; maxLength?: number };

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export function Numpad({ value, onChange, maxLength = 6 }: Props) {
  const { width } = useWindowDimensions();
  const keySize = (width - 56 - 32) / 3; // 28px side padding, 2×16px gaps

  function press(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') { onChange(value.slice(0, -1)); return; }
    if (key === '')   return;
    if (value.length < maxLength) onChange(value + key);
  }

  return (
    <View style={styles.grid}>
      {KEYS.map((key, i) => (
        <NumKey key={i} label={key} size={keySize} onPress={() => press(key)} />
      ))}
    </View>
  );
}

function NumKey({ label, size, onPress }: { label: string; size: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (label === '') return <View style={{ width: size, height: 64 }} />;

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.88, { damping: 20, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1,    { damping: 20, stiffness: 400 }); }}
      onPress={onPress}
    >
      <Animated.View style={[styles.key, { width: size, height: 64 }, animStyle]}>
        <Text style={styles.keyLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 28 },
  key:      { borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  keyLabel: { fontFamily: 'Oswald_400Regular', fontSize: 22, color: Colors.text },
});
