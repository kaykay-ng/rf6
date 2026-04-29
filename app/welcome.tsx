import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Text style={styles.title}>BOND</Text>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push('/onboarding/name')}
        >
          <Text style={styles.primaryBtnText}>REGISTER YOUR CAMP</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.accent,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 72,
    lineHeight: 100,
    color: Colors.white,
  },

  actions: {
    gap: 14,
  },
  primaryBtnText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    letterSpacing: 1.5,
    color: Colors.white,
    textAlign: 'center',
  },
});
