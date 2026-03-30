import { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { useSession } from '@/context/session';
import { StepHeader } from '@/components/ui/step-header';
import { PinDots } from '@/components/ui/pin-dots';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

export default function OnboardingPinScreen() {
  const insets = useSafeAreaInsets();
  const { data, setPin, submit } = useOnboarding();
  const { reload } = useSession();

  const pinRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [pinError, setPinError] = useState(false);

  const canSubmit = data.pin.length === 6 && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    const result = await submit();
    setLoading(false);

    if ('error' in result) {
      if (result.error === 'name_taken') {
        router.navigate('/onboarding/name');
        return;
      }
      if (result.error === 'address_taken' || result.error === 'address_invalid') {
        router.navigate('/onboarding/slot');
        return;
      }
      setPinError(true);
      setError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }

    await reload();
    router.replace('/');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <StepHeader step={4} total={4} onBack={() => router.back()} />

      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>Set your camp PIN</Text>
        <Text variant="body" style={styles.hint}>
          Pick a 6-digit PIN your whole camp can use to log back in. Share it verbally — no individual accounts.
        </Text>

        <Pressable onPress={() => pinRef.current?.focus()}>
          <PinDots
            value={data.pin}
            error={pinError}
            onErrorShown={() => setPinError(false)}
          />
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* Hidden input — brings up native number-pad when focused */}
      <TextInput
        ref={pinRef}
        autoFocus
        value={data.pin}
        onChangeText={(t) => { setPin(t.replace(/[^0-9]/g, '').slice(0, 6)); setError(''); }}
        keyboardType="number-pad"
        maxLength={6}
        caretHidden
        style={styles.hiddenInput}
      />

      <Pressable
        style={[styles.doneBtn, !canSubmit && styles.doneBtnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <Text style={styles.doneBtnText}>DONE — SEE THE MAP</Text>
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  body:           { flex: 1, paddingHorizontal: 28 },
  title:          { fontSize: 28, marginBottom: 10 },
  hint:           { color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },
  error:          { marginTop: 12, fontSize: 13, color: Colors.accent, textAlign: 'center' },
  hiddenInput:    { position: 'absolute', opacity: 0, width: 1, height: 1 },
  doneBtn:        { marginHorizontal: 28, marginTop: 24, backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  doneBtnDisabled:{ opacity: 0.4 },
  doneBtnText:    { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
