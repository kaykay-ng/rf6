import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventDraft } from './_layout';
import { eventStyles } from './styles';

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
    <View style={[eventStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={eventStyles.scroll} contentContainerStyle={eventStyles.scrollContentLarge}>
        <Text style={eventStyles.title}>Verify Camp PIN</Text>
        <Text style={eventStyles.subtitleLarge}>
          Enter the PIN for {data.campAddress}
        </Text>

        <View style={eventStyles.fieldCentered}>
          <Text style={eventStyles.labelSmall}>Camp PIN</Text>
          <TextInput
            style={[eventStyles.pinInput, pinError && eventStyles.inputError]}
            placeholder=""
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
          {pinError && <Text style={eventStyles.errorText}>{pinError}</Text>}
        </View>

        {loading && (
          <View style={eventStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={eventStyles.loadingText}>Verifying PIN...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
