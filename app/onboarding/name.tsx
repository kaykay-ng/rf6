import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useOnboarding } from '@/context/onboarding';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

export default function OnboardingNameScreen() {
  const insets = useSafeAreaInsets();
  const { data, setName } = useOnboarding();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const trimmed = data.name.trim();
  const canNext = trimmed.length >= 3 && !loading;

  async function handleNext() {
    setError('');
    setLoading(true);
    const { data: rows } = await supabase
      .from('camps')
      .select('id')
      .ilike('name', trimmed)
      .limit(1);
    setLoading(false);

    if (rows && rows.length > 0) {
      setError('That name is already taken — try something else.');
      return;
    }
    router.push('/onboarding/slot');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <StepHeader step={1} total={4} onBack={() => router.back()} />

      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>What's your camp called?</Text>
        <Text variant="body" style={styles.hint}>This is your public identity on the map. Make it memorable.</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={data.name}
          onChangeText={(t) => { setName(t); setError(''); }}
          placeholder="e.g. Camp Chaos"
          placeholderTextColor={Colors.border}
          autoFocus
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={canNext ? handleNext : undefined}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
        onPress={handleNext}
        disabled={!canNext}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <Text style={styles.nextBtnText}>NEXT</Text>
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28 },
  body:           { flex: 1 },
  title:          { fontSize: 28, marginBottom: 10 },
  hint:           { color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    color: Colors.text, backgroundColor: Colors.white,
  },
  inputError:     { borderColor: Colors.accent },
  error:          { marginTop: 8, fontSize: 13, color: Colors.accent },
  nextBtn:        { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  nextBtnDisabled:{ opacity: 0.4 },
  nextBtnText:    { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
