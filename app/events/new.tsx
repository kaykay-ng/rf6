import { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useEventDraft } from './_layout';

export default function NewEventScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch } = useEventDraft();
  const [nameError, setNameError] = useState('');

  const trimmedName = data.name.trim();
  const canNext = trimmedName.length >= 3;

  function handleNext() {
    setNameError('');
    if (!canNext) {
      setNameError('Event name must be at least 3 characters');
      return;
    }
    router.push('/events/when');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Event name */}
        <View style={styles.field}>
          <Text style={styles.label}>Event name</Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            placeholder="e.g. BBQ & Cold Ones"
            placeholderTextColor={Colors.textSecondary}
            value={data.name}
            onChangeText={(v) => {
              dispatch({ type: 'SET_FIELD', field: 'name', value: v });
              setNameError('');
            }}
            maxLength={60}
            autoFocus
          />
          {nameError && <Text style={styles.errorText}>{nameError}</Text>}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.charCount}>{data.description.length} / 200</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              styles.inputMultiline,
              data.description.length > 180 && styles.inputWarning,
            ]}
            placeholder="What's it about? (optional)"
            placeholderTextColor={Colors.textSecondary}
            value={data.description}
            onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'description', value: v })}
            maxLength={200}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* CTA */}
      <Pressable
        style={[styles.cta, !canNext && styles.ctaDisabled]}
        onPress={handleNext}
        disabled={!canNext}
      >
        <Text style={styles.ctaText}>NEXT →</Text>
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  charCount: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
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
  inputWarning: {
    borderColor: Colors.accent,
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: 12,
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#B01020',
    letterSpacing: 0.3,
    marginTop: 6,
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
});
