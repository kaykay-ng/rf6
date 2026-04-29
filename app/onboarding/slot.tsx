import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useOnboarding } from '@/context/onboarding';
import { parseAddress } from '@/data/grid';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** After typing 2 digits, auto-advance unless the value could extend to 100. */
function shouldAutoAdvanceZone(z: string): boolean {
  if (z.length >= 3) return true;
  if (z.length === 2 && parseInt(z, 10) > 10) return true;
  return false;
}

function buildAddress(zone: string, slot: string): string {
  if (!zone) return '';
  const z = parseInt(zone, 10);
  if (isNaN(z)) return '';
  if (!slot) return `C${z}`;
  const s = parseInt(slot, 10);
  if (isNaN(s)) return `C${z}`;
  return `C${z}-${s}`;
}

export default function OnboardingSlotScreen() {
  const insets = useSafeAreaInsets();
  const { data, setAddress } = useOnboarding();

  // Initialise from existing context value if the user navigates back
  const initialMatch = data.address.match(/^C(\d+)-(\d+)$/);
  const [zone, setZone] = useState(initialMatch ? initialMatch[1] : '');
  const [slot, setSlot] = useState(initialMatch ? initialMatch[2] : '');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const slotRef = useRef<TextInput>(null);

  const address = buildAddress(zone, slot);
  const parsed  = parseAddress(address);
  const isValid = parsed !== null;
  const canNext = isValid && !loading;

  function handleZoneChange(text: string) {
    setError('');
    const digits = text.replace(/\D/g, '').slice(0, 3);
    setZone(digits);
    setAddress(buildAddress(digits, slot));
    if (shouldAutoAdvanceZone(digits)) {
      slotRef.current?.focus();
    }
  }

  function handleSlotChange(text: string) {
    setError('');
    const digits = text.replace(/\D/g, '').slice(0, 2);
    setSlot(digits);
    setAddress(buildAddress(zone, digits));
  }

  async function handleNext() {
    if (!parsed) return;
    setError('');
    setLoading(true);
    Keyboard.dismiss();
    const { data: rows } = await supabase
      .from('camps')
      .select('id')
      .eq('address', address)
      .limit(1);
    setLoading(false);

    if (rows && rows.length > 0) {
      setError('That slot is already registered by another camp.');
      return;
    }
    router.push('/onboarding/profile');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <StepHeader step={2} total={5} onBack={() => router.back()} />

      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>Where are you camped?</Text>
        <Text variant="body" style={styles.hint}>
          Enter your grid address — look for the signs on site.
        </Text>

        <View style={styles.row}>
          {/* Zone field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>ZONE</Text>
            <View style={[styles.inputRow, error ? styles.inputError : null]}>
              <Text style={styles.prefix}>C</Text>
              <TextInput
                style={[styles.input, { outlineStyle: 'none' } as any]}
                value={zone}
                onChangeText={handleZoneChange}
                placeholder="5"
                placeholderTextColor={Colors.border}
                autoFocus
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          <Text style={styles.separator}>–</Text>

          {/* Slot field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>SLOT</Text>
            <TextInput
              ref={slotRef}
              style={[styles.input, styles.inputStandalone, error ? styles.inputError : null, { outlineStyle: 'none' } as any]}
              value={slot}
              onChangeText={handleSlotChange}
              placeholder="3"
              placeholderTextColor={Colors.border}
              keyboardType="number-pad"
              maxLength={2}
              returnKeyType="done"
              onSubmitEditing={canNext ? handleNext : undefined}
            />
          </View>
        </View>

        {error
          ? <Text style={styles.error}>{error}</Text>
          : isValid
            ? <Text style={styles.success}>Zone {parsed.zoneId} · Slot {parsed.slot}</Text>
            : zone.length > 0 && slot.length > 0
              ? <Text style={styles.error}>Zone C1–C100 · Slot 1–10</Text>
              : null
        }
      </View>

      <Pressable
        style={[styles.continueBtn, !canNext && styles.continueBtnDisabled]}
        onPress={handleNext}
        disabled={!canNext}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <Text style={styles.continueBtnText}>CONTINUE</Text>
        }
      </Pressable>
    </View>
  );
}

const INPUT_FONT = { fontFamily: 'Oswald_400Regular', fontSize: 28, letterSpacing: 2 } as const;

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28 },
  body:            { flex: 1 },
  title:           { fontSize: 28, marginBottom: 10 },
  hint:            { color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },

  row:             { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  fieldWrap:       { flex: 1 },
  fieldLabel:      { fontFamily: 'Oswald_400Regular', fontSize: 11, letterSpacing: 1.5, color: Colors.textSecondary, marginBottom: 6 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: Colors.white,
  },
  prefix:          { ...INPUT_FONT, color: Colors.textSecondary, marginRight: 2 },
  input:           { ...INPUT_FONT, flex: 1, color: Colors.text, padding: 0 },

  inputStandalone: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: Colors.white,
    textAlign: 'center',
  },
  inputError:      { borderColor: Colors.accent },

  separator:       { ...INPUT_FONT, color: Colors.textSecondary, paddingBottom: 12, alignSelf: 'flex-end' },

  error:           { marginTop: 12, fontSize: 13, color: Colors.accent },
  success:         { marginTop: 12, fontSize: 13, color: '#3a8040', fontWeight: '600' },
  continueBtn:         { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText:     { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
