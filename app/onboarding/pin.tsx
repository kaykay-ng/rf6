import { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/onboarding';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

export default function OnboardingPinScreen() {
  const insets = useSafeAreaInsets();
  const { data, setPin } = useOnboarding();
  const inputRef = useRef<TextInput>(null);

  const [pinError, setPinError] = useState(false);

  const canSubmit = data.pin.length === 6;

  useEffect(() => {
    if (data.pin.length === 6) {
      inputRef.current?.blur();
      Keyboard.dismiss();
    }
  }, [data.pin.length]);

  async function handleSubmit() {
    if (!canSubmit) return;
    inputRef.current?.blur();
    Keyboard.dismiss();
    router.push('/onboarding/flag');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <StepHeader step={4} total={5} onBack={() => router.back()} />

      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>Set your camp PIN</Text>
        <Text variant="body" style={styles.hint}>
          Pick a 6-digit PIN your whole camp can use to log back in. Share it verbally — no individual accounts.
        </Text>

        <TextInput
          ref={inputRef}
          autoFocus
          value={data.pin}
          onChangeText={(t) => { setPin(t.replace(/[^0-9]/g, '').slice(0, 6)); setPinError(false); }}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          placeholder="······"
          placeholderTextColor={Colors.border}
          style={[styles.pinInput, pinError && styles.pinInputError, { outlineStyle: 'none' } as any]}
        />
      </View>

      <Pressable
        style={[styles.doneBtn, !canSubmit && styles.doneBtnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.doneBtnText}>CONTINUE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.background },
  body:           { flex: 1, paddingHorizontal: 28 },
  title:          { fontSize: 28, marginBottom: 10 },
  hint:           { color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },
  pinInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 18,
    fontSize: 28, letterSpacing: 10, textAlign: 'center',
    color: Colors.text, backgroundColor: Colors.white,
  },
  pinInputError:  { borderColor: Colors.accent },
  error:          { marginTop: 12, fontSize: 13, color: Colors.accent, textAlign: 'center' },
  doneBtn:        { marginHorizontal: 28, marginTop: 24, backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  doneBtnDisabled:{ opacity: 0.4 },
  doneBtnText:    { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
