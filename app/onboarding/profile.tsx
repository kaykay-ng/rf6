import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/text';

export default function OnboardingProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <StepHeader step={3} total={4} onBack={() => router.back()} />

      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>Tell people about your camp</Text>
        <Text variant="body" style={styles.hint}>
          Write a short bio and pick 3–5 vibes that describe your camp's energy.
        </Text>
        {/* Bio textarea + vibe tag selector coming in next task */}
      </View>

      <Pressable style={styles.nextBtn} onPress={() => router.push('/onboarding/pin')}>
        <Text style={styles.nextBtnText}>NEXT</Text>
      </Pressable>
    </View>
  );
}

function StepHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <View style={styles.stepHeader}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <View style={styles.stepDots}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.dot, i + 1 === step && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 },
  backArrow:  { fontSize: 22, color: Colors.text },
  stepDots:   { flexDirection: 'row', gap: 6 },
  dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive:  { backgroundColor: Colors.accent, width: 18 },
  body:       { flex: 1 },
  title:      { fontSize: 28, marginBottom: 10 },
  hint:       { color: Colors.textSecondary, lineHeight: 22 },
  nextBtn:    { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnText:{ fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
