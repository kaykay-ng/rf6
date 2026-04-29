import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useEventDraft } from './_layout';

export default function ConfirmEventScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch, submit } = useEventDraft();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = !loading && !success;

  async function handleSubmit() {
    setLoading(true);

    try {
      // Submit event
      await submit();

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
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.body}>
        <Text variant="heading" style={styles.title}>Confirm your event</Text>
        <Text variant="body" style={styles.hint}>Review details and set capacity</Text>

        {/* Event summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Event Details</Text>
          <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Event:</Text> {data.name}</Text>
          <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Date:</Text> {data.date}</Text>
          <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Time:</Text> {data.time}</Text>
          {data.location_type === 'other' ? (
            <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Location:</Text> {data.location_name}</Text>
          ) : (
            <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Location:</Text> Our Camp</Text>
          )}
          {data.description && (
            <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Details:</Text> {data.description}</Text>
          )}
        </View>

        {/* Max capacity */}
        <TextInput
          style={styles.input}
          placeholder="Leave blank for unlimited"
          placeholderTextColor={Colors.border}
          value={data.max_capacity}
          onChangeText={(v) => {
            // Only allow numeric input
            const sanitized = v.replace(/[^0-9]/g, '');
            dispatch({ type: 'SET_FIELD', field: 'max_capacity', value: sanitized });
          }}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.label} onPress={() => {}}>Max attendees (optional)</Text>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        )}
      </View>

      {/* CTA */}
      <Pressable
        style={[styles.submitBtn, (!canSubmit || loading) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.submitBtnText}>SUBMIT</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28 },
  body: { flex: 1 },
  title: { fontSize: 28, marginBottom: 10 },
  hint: { color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },

  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 28,
  },
  summaryTitle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 14,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryField: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 6,
    lineHeight: 18,
  },
  summaryLabel: {
    fontFamily: 'Oswald_700Bold',
  },

  label: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Oswald_400Regular',
    letterSpacing: 0.3,
  },

  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    color: Colors.text,
    backgroundColor: Colors.white,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  submitBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: 'Oswald_700Bold', fontSize: 16, letterSpacing: 1.5, color: Colors.white },

  // Success state
  successContainer: {
    flex: 1,
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
