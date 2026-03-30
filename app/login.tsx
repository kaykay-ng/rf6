import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { saveSession } from '@/lib/session';
import { useSession } from '@/context/session';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { reload } = useSession();
  const [campName, setCampName] = useState('');
  const [pin, setPin]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [pinError, setPinError] = useState(false);

  const canLogin = campName.trim().length >= 3 && pin.length === 6 && !loading;

  async function handleLogin() {
    if (!canLogin) return;
    setError('');
    setLoading(true);

    const pinHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin,
    );

    const { data } = await supabase
      .from('camps')
      .select('id, name, address')
      .ilike('name', campName.trim())
      .eq('pin_hash', pinHash)
      .maybeSingle();

    setLoading(false);

    if (!data) {
      setPinError(true);
      setError('Incorrect camp name or PIN.');
      setPin('');
      return;
    }

    await saveSession({ campId: data.id, campName: data.name, address: data.address, pinHash });
    await reload();
    router.replace('/');
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.body}>
        <Text variant="body" style={styles.hint}>Enter your camp name and PIN to get back in.</Text>

        <TextInput
          style={styles.input}
          value={campName}
          onChangeText={(t) => { setCampName(t); setError(''); }}
          placeholder="Camp name"
          placeholderTextColor={Colors.border}
          autoFocus
          maxLength={40}
          returnKeyType="done"
        />

        <Text style={styles.pinLabel}>6-DIGIT PIN</Text>
        <TextInput
          value={pin}
          onChangeText={(t) => { setPin(t.replace(/[^0-9]/g, '').slice(0, 6)); setError(''); setPinError(false); }}
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          placeholder="······"
          placeholderTextColor={Colors.border}
          style={[styles.pinInput, pinError && styles.pinInputError, { outlineStyle: 'none' } as any]}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <Pressable
        style={[styles.loginBtn, !canLogin && styles.loginBtnDisabled]}
        onPress={handleLogin}
        disabled={!canLogin}
      >
        {loading
          ? <ActivityIndicator color={Colors.white} />
          : <Text style={styles.loginBtnText}>LOG IN</Text>
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background, paddingTop: 24 },
  body:            { flex: 1, paddingHorizontal: 28 },
  hint:            { color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 28,
    fontSize: 18, fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    color: Colors.text, backgroundColor: Colors.white,
  },
  pinLabel:      { fontFamily: 'Oswald_700Bold', fontSize: 11, letterSpacing: 2, color: Colors.textSecondary, marginBottom: 8 },
  pinInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 18,
    fontSize: 28, letterSpacing: 10, textAlign: 'center',
    color: Colors.text, backgroundColor: Colors.white,
  },
  pinInputError: { borderColor: Colors.accent },
  error:         { marginTop: 12, fontSize: 13, color: Colors.accent, textAlign: 'center' },
  loginBtn:        { marginHorizontal: 28, marginTop: 24, backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  loginBtnDisabled:{ opacity: 0.4 },
  loginBtnText:    { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },
});
