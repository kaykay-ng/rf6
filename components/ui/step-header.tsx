import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Pressable, StyleSheet, View } from 'react-native';

type Props = { step: number; total: number; onBack: () => void };

export function StepHeader({ step, total, onBack }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.arrow}>←</Text>
      </Pressable>
      <View style={styles.dots}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.dot, i + 1 === step && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 },
  arrow:     { fontSize: 22, color: Colors.text },
  dots:      { flexDirection: 'row', gap: 6 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 18, backgroundColor: Colors.accent },
});
