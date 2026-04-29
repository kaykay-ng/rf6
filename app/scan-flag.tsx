import { useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';

const DocumentScanner = Platform.OS === 'ios' ? require('react-native-document-scanner-plugin').default : null;

export default function ScanFlagScreen() {
  const insets = useSafeAreaInsets();

  const [scannedUri, setScannedUri] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function uploadFlag(localUri: string): Promise<string> {
    const filename = `scan-${Date.now()}.jpg`;

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
        setScannedUri(result.scannedImages[0]);
        setError('');
      }
    } catch (err) {
      Alert.alert('Scanner error', 'Could not scan document. Please try again.');
    }
  }

  async function handleSave() {
    if (!scannedUri) return;
    setError('');
    setLoading(true);

    try {
      await uploadFlag(scannedUri);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      Alert.alert('Upload error', msg);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← BACK</Text>
      </Pressable>

      {success ? (
        <View style={styles.centeredContent}>
          <Text variant="heading" style={styles.successTitle}>Uploaded!</Text>
          <Text variant="body" style={styles.hint}>Check your Supabase Storage bucket.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <Text variant="heading" style={styles.title}>Scan your flag</Text>
          <Text variant="body" style={styles.hint}>
            Hold your hand-drawn flag still for the camera. We'll clean it up automatically.
          </Text>

          {scannedUri ? (
            <>
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: scannedUri }}
                  style={styles.preview}
                  contentFit="contain"
                />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.secondaryBtn, { flex: 1, marginRight: 12 }]}
                  onPress={() => setScannedUri('')}
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
                    <Text style={styles.saveBtnText}>UPLOAD</Text>
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { paddingHorizontal: 28, paddingVertical: 12, marginBottom: 24 },
  backBtnText: { fontSize: 14, fontFamily: 'Oswald_700Bold', color: Colors.text, letterSpacing: 0.5 },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  body: { flex: 1, paddingHorizontal: 28 },
  title: { fontSize: 28, marginBottom: 10 },
  successTitle: { fontSize: 28, marginBottom: 10, textAlign: 'center' },
  hint: { color: Colors.textSecondary, lineHeight: 22, marginBottom: 32, textAlign: 'center' },
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
});
