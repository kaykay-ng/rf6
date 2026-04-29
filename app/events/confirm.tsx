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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Event summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Event Summary</Text>
          <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Name:</Text> {data.name}</Text>
          <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Date:</Text> {data.date}</Text>
          <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Time:</Text> {data.time}</Text>
          {data.location_type === 'other' ? (
            <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Location:</Text> {data.location_name}</Text>
          ) : (
            <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Location:</Text> Our Camp</Text>
          )}
          {data.description && (
            <Text style={styles.summaryField}><Text style={styles.summaryLabel}>Description:</Text> {data.description}</Text>
          )}
        </View>

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

  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 28,
  },
  summaryTitle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  summaryField: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'Oswald_700Bold',
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
