import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/text';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <View style={styles.accentBar} />
        <Text style={styles.label}>COMMON GROUND</Text>
        <Text style={styles.title}>CLASH{'\n'}OF{'\n'}CAMPS</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>
          Discover and connect with the camps around you at Roskilde Festival
        </Text>
        <Text style={styles.festivalInfo}>Roskilde · 27 June – 4 July 2026</Text>
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          onPress={() => router.push('/onboarding/name')}
        >
          <Text style={styles.primaryBtnText}>REGISTER YOUR CAMP</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={() => router.push('/login')}>
          <Text style={styles.secondaryBtnText}>Already registered? </Text>
          <Text style={[styles.secondaryBtnText, styles.secondaryBtnLink]}>Log in</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },

  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 32,
  },
  accentBar: {
    width: 48,
    height: 4,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginBottom: 28,
  },
  label: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.accent,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 72,
    lineHeight: 68,
    color: Colors.text,
    marginBottom: 28,
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  tagline: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  festivalInfo: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: 13,
    color: Colors.border,
    letterSpacing: 0.5,
  },

  actions: {
    gap: 14,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnPressed: {
    backgroundColor: Colors.accentDark,
  },
  primaryBtnText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    letterSpacing: 1.5,
    color: Colors.white,
  },
  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  secondaryBtnLink: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
