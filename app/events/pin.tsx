import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useEventDraft } from './_layout';

export default function PinVerificationScreen() {
  const insets = useSafeAreaInsets();
  const { data } = useEventDraft();
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = pin.length === 6 && !loading;

  // Auto-verify when PIN is complete
  useEffect(() => {
    if (pin.length === 6) {
      handleVerifyPin();
    }
  }, [pin]);

  async function handleVerifyPin() {
    setLoading(true);
    setPinError('');

    try {
      // Fetch the camp's PIN hash from Supabase
      const { data: campData, error: fetchError } = await supabase
        .from('camps')
        .select('pin_hash')
        .eq('address', data.campAddress)
        .single();

      if (fetchError || !campData) {
        setPinError('Camp not found');
        setPin('');
        setLoading(false);
        return;
      }

      // Hash the entered PIN and compare
      const pinHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
      );
      if (pinHash !== campData.pin_hash) {
        setPinError('Incorrect PIN — try again.');
        setPin('');
        setLoading(false);
        return;
      }

      // PIN is correct — proceed to event details
      router.push('/events/new');
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Verify Camp PIN</Text>
        <Text style={styles.subtitle}>
          Enter the PIN for {data.campAddress}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Camp PIN</Text>
          <TextInput
            style={[styles.pinInput, pinError && styles.inputError]}
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
            autoFocus
          />
          {pinError && <Text style={styles.errorText}>{pinError}</Text>}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Verifying PIN...</Text>
          </View>
        )}
      </ScrollView>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>The PIN will be entered automatically when all 6 digits are entered</Text>
      </View>
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
    paddingTop: 40,
  },

  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 40,
  },

  field: {
    alignItems: 'center',
    marginBottom: 40,
  },
  label: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 14,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 16,
  },

  pinInput: {
    width: 200,
    height: 80,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    fontSize: 40,
    fontFamily: 'Oswald_700Bold',
    letterSpacing: 12,
    textAlign: 'center',
    color: Colors.text,
  },
  inputError: {
    borderColor: '#B01020',
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#B01020',
    letterSpacing: 0.3,
    marginTop: 12,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 16,
  },

  infoBox: {
    marginHorizontal: 28,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
    borderRadius: 6,
  },
  infoText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#1565C0',
    letterSpacing: 0.3,
  },
});
