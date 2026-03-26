import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/text';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.body}>
        <Text variant="body" style={styles.hint}>
          Enter your camp name and 6-digit PIN to log back in.
        </Text>
        {/* Camp name input + PIN pad coming in next task */}
      </View>

      <Pressable style={styles.nextBtn} onPress={() => router.replace('/')}>
        <Text style={styles.nextBtnText}>LOG IN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28, paddingTop: 24 },
  body:       { flex: 1 },
  hint:       { color: Colors.textSecondary, lineHeight: 22 },
  nextBtn:    { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnText:{ fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
