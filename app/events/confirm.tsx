import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router, useSafeAreaInsets } from 'expo-router';
import { SHA256 } from 'expo-crypto';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useSession } from '@/context/session';
import { useEventDraft } from './_layout';

export default function ConfirmEventScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const { data, dispatch, submit } = useEventDraft();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = pin.length === 6 && !loading && !success;

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);

  async function handleSubmit() {
    if (!session?.pinHash) {
      Alert.alert('Error', 'Session invalid. Please log in again.');
      return;
    }

    setLoading(true);
    setPinError('');

    try {
      // Verify PIN matches stored hash
      const pinHash = await SHA256(pin);
      if (pinHash !== session.pinHash) {
        setPinError('Incorrect PIN — try again.');
        setPin('');
        setLoading(false);
        return;
      }

      // Submit event
      await submit(pinHash);

      // Show success state
      setSuccess(true);
      setTimeout(() => {
        router.replace('/');
      }, 1000);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.successContent}>
          <Text style={styles.successText}>✓ Event created!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Max capacity */}
        <View style={styles.field}>
          <Text style={styles.label}>Max attendees (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Leave blank for unlimited"
            placeholderTextColor={Colors.textSecondary}
            value={data.max_capacity}
            onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'max_capacity', value: v })}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        {/* PIN entry */}
        <View style={styles.field}>
          <Text style={styles.label}>Camp PIN</Text>
          <TextInput
            style={[styles.input, styles.pinInput, pinError && styles.inputError]}
            placeholder="000000"
            placeholderTextColor={Colors.textSecondary}
            value={pin}
            onChangeText={(v) => {
              setPin(v);
              setPinError('');
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
          />
          {pinError && <Text style={styles.errorText}>{pinError}</Text>}
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <Pressable
        style={[styles.cta, (!canSubmit || loading) && styles.ctaDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.ctaText}>SUBMIT</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
  },

  field: {
    marginBottom: 28,
  },
  label: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'Oswald_400Regular',
  },
  inputError: {
    borderColor: '#B01020',
  },
  pinInput: {
    fontSize: 28,
    fontFamily: 'Oswald_700Bold',
    letterSpacing: 10,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#B01020',
    letterSpacing: 0.3,
    marginTop: 6,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  cta: {
    marginHorizontal: 28,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 1.5,
  },

  // Success state
  successContainer: {
    justifyContent: 'center',
    backgroundColor: Colors.accent,
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 36,
    color: Colors.white,
    letterSpacing: 1,
  },
});
