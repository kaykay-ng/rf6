import { View, TextInput, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { VIBE_CATEGORIES, MIN_VIBES, MAX_VIBES } from '@/lib/vibes';

const BIO_MAX = 200;

export default function OnboardingProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data, setBio, setVibeTags } = useOnboarding();

  const vibeCount = data.vibeTags.length;
  const canNext   = data.bio.trim().length > 0 && vibeCount >= MIN_VIBES && vibeCount <= MAX_VIBES;

  function toggleVibe(tag: string) {
    if (data.vibeTags.includes(tag)) {
      setVibeTags(data.vibeTags.filter(t => t !== tag));
    } else if (vibeCount < MAX_VIBES) {
      setVibeTags([...data.vibeTags, tag]);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <StepHeader step={3} total={5} onBack={() => router.back()} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="heading" style={styles.title}>Tell people about your camp</Text>

        {/* ── Bio ── */}
        <View style={styles.bioBox}>
          <TextInput
            style={styles.bioInput}
            value={data.bio}
            onChangeText={setBio}
            placeholder="We cook for whoever shows up. Bring an instrument."
            placeholderTextColor={Colors.border}
            multiline
            maxLength={BIO_MAX}
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, data.bio.length > BIO_MAX - 20 && styles.charCountWarn]}>
            {data.bio.length} / {BIO_MAX}
          </Text>
        </View>

        {/* ── Vibe tags ── */}
        <Text variant="caption" style={styles.sectionLabel}>
          PICK {MIN_VIBES}–{MAX_VIBES} VIBES
        </Text>
        {VIBE_CATEGORIES.map(({ label, tags }) => (
          <View key={label} style={styles.category}>
            <Text style={styles.categoryLabel}>{label}</Text>
            <View style={styles.pills}>
              {tags.map(tag => {
                const selected  = data.vibeTags.includes(tag);
                const saturated = !selected && vibeCount >= MAX_VIBES;
                return (
                  <Pressable
                    key={tag}
                    style={[styles.pill, selected && styles.pillSelected, saturated && styles.pillSaturated]}
                    onPress={() => toggleVibe(tag)}
                  >
                    <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Text style={styles.vibeCount}>
          {vibeCount < MIN_VIBES
            ? `Select at least ${MIN_VIBES} vibes`
            : `${vibeCount} / ${MAX_VIBES} selected`}
        </Text>
      </ScrollView>

      <Pressable
        style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
        onPress={() => router.push('/onboarding/pin')}
        disabled={!canNext}
      >
        <Text style={styles.nextBtnText}>NEXT</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28 },
  header:        { },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  title:         { fontSize: 28, marginBottom: 20 },

  bioBox:        { marginBottom: 28 },
  bioInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36,
    fontSize: 16, lineHeight: 24,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    color: Colors.text, backgroundColor: Colors.white,
    minHeight: 110,
  },
  charCount:     { position: 'absolute', bottom: 10, right: 12, fontSize: 11, color: Colors.textSecondary },
  charCountWarn: { color: Colors.accent },

  sectionLabel:  { color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: 16 },
  category:      { marginBottom: 20 },
  categoryLabel: { fontFamily: 'Oswald_700Bold', fontSize: 11, letterSpacing: 2, color: Colors.textSecondary, marginBottom: 10 },
  pills:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:          { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.white },
  pillSelected:  { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pillSaturated: { opacity: 0.35 },
  pillText:      { fontSize: 13, color: Colors.text, fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' },
  pillTextSelected: { color: Colors.white },

  vibeCount:     { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 8 },

  nextBtn:        { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  nextBtnDisabled:{ opacity: 0.4 },
  nextBtnText:    { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
