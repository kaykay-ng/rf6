import { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { useOnboarding } from '@/context/onboarding';
import { useSession } from '@/context/session';
import { supabase } from '@/lib/supabase';
import { StepHeader } from '@/components/ui/step-header';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const DocumentScanner = Platform.OS === 'ios' ? require('react-native-document-scanner-plugin').default : null;

export default function OnboardingFlagScreen() {
  const insets = useSafeAreaInsets();
  const { data, setImageUri, submit, reset } = useOnboarding();
  const { reload, logout } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const checkScale = useSharedValue(0);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  async function uploadFlag(localUri: string, campName: string): Promise<string> {
    const filename = `${campName}-${Date.now()}.jpg`;

    // Read file as base64 string
    const base64String = await FileSystem.readAsStringAsync(localUri, {
      encoding: 'base64',
    });

    // Decode base64 to Uint8Array
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload the binary data
    const { error: uploadError } = await supabase.storage
      .from('flags')
      .upload(filename, bytes, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('flags').getPublicUrl(filename);
    return data.publicUrl;
  }

  async function handleScan() {
    if (!DocumentScanner) {
      Alert.alert('Not available', 'Document scanner is only available on iOS.');
      return;
    }
    try {
      const result = await DocumentScanner.scanDocument({
        colorMode: 'grayscale',
      });
      if (result && result.scannedImages.length > 0) {
        setImageUri(result.scannedImages[0]);
      }
    } catch (err) {
      Alert.alert('Scanner error', 'Could not scan document. Please try again.');
    }
  }

  async function handleSave() {
    if (!data.imageUri) return;
    setError('');
    setLoading(true);

    try {
      const url = await uploadFlag(data.imageUri, data.name.trim());
      // Pass the public URL directly to submit, no need to update context first
      const result = await submit(url);
      setLoading(false);

      if ('error' in result) {
        Alert.alert('Error', result.error ?? 'Something went wrong. Please try again.');
        return;
      }

      showSuccessAndNavigate();
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      Alert.alert('Upload error', msg);
    }
  }

  function handleSkip() {
    submit().then(async (result) => {
      if ('error' in result) {
        Alert.alert('Error', result.error ?? 'Something went wrong. Please try again.');
        return;
      }
      showSuccessAndNavigate();
    });
  }

  async function showSuccessAndNavigate() {
    setSuccess(true);
    checkScale.value = withSpring(1, { damping: 6, stiffness: 100 });
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (Platform.OS === 'web') {
      // Web: reload session and go to map
      await reload();
      router.replace('/');
    }
    // Mobile: stays on success screen, user taps button to reset
  }

  async function handleRegisterNext() {
    // Clear session and form data, return to welcome
    await logout();
    reset();
    router.replace('/welcome');
  }

  if (success) {
    const isWeb = Platform.OS === 'web';
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.successContainer}>
          <Animated.View style={[styles.checkmark, checkStyle]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </Animated.View>
          <Text style={styles.successTitle}>Camp registered!</Text>
          <Text style={styles.successText}>
            {isWeb ? `${data.name} is now live on the map. Get ready to clash!` : 'Your camp is now live on the map at our main display.'}
          </Text>
          {!isWeb && (
            <Pressable style={styles.registerNextBtn} onPress={handleRegisterNext}>
              <Text style={styles.registerNextBtnText}>REGISTER NEXT CAMP</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.headerRow}>
        <StepHeader step={5} total={5} onBack={() => router.back()} />
        {!data.imageUri && (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>SKIP</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>Scan your flag</Text>
        <Text variant="body" style={styles.hint}>
          Hold your hand-drawn flag still for the camera. We'll clean it up automatically.
        </Text>

        {data.imageUri ? (
          <>
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: data.imageUri }}
                style={styles.preview}
                contentFit="contain"
              />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.secondaryBtn, { flex: 1, marginRight: 12 }]}
                onPress={() => setImageUri('')}
                disabled={loading}
              >
                <Text style={styles.secondaryBtnText}>RETAKE</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { flex: 1 }, loading && styles.saveBtnLoading]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>SAVE FLAG</Text>
                )}
              </Pressable>
            </View>
          </>
        ) : (
          <Pressable style={styles.scanBtn} onPress={handleScan}>
            <Text style={styles.scanBtnText}>SCAN WITH CAMERA</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  checkmark: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  checkmarkText: { fontSize: 48, color: Colors.white, fontWeight: 'bold' },
  successTitle: { fontSize: 28, fontFamily: 'Oswald_700Bold', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  successText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 28, marginBottom: 24 },
  skipText: { fontSize: 13, fontFamily: 'Oswald_700Bold', color: Colors.textSecondary, letterSpacing: 1 },
  body: { flex: 1, paddingHorizontal: 28 },
  title: { fontSize: 28, marginBottom: 10 },
  hint: { color: Colors.textSecondary, lineHeight: 22, marginBottom: 32 },
  previewContainer: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, marginBottom: 24, overflow: 'hidden', minHeight: 240 },
  preview: { width: '100%', height: 240 },
  error: { marginBottom: 12, fontSize: 13, color: Colors.accent, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { backgroundColor: Colors.border, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: Colors.text, letterSpacing: 1 },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  saveBtnLoading: { opacity: 0.6 },
  saveBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 14, color: Colors.white, letterSpacing: 1 },
  scanBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 18, alignItems: 'center', marginTop: 32 },
  scanBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: Colors.white, letterSpacing: 1.5 },
  registerNextBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 32, paddingHorizontal: 28 },
  registerNextBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 16, color: Colors.white, letterSpacing: 1.5 },
});
