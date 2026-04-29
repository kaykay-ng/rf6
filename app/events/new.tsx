import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventDraft } from './_layout';
import { eventStyles } from './styles';

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
    <View style={[eventStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={eventStyles.scroll} contentContainerStyle={eventStyles.scrollContent}>
        {/* Event name */}
        <View style={eventStyles.field}>
          <Text style={eventStyles.title}>Event name</Text>
          <Text style={eventStyles.subtitle}>Give it a name</Text>
          <TextInput
            style={[eventStyles.input, nameError && eventStyles.inputError]}
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
          {nameError && <Text style={eventStyles.errorText}>{nameError}</Text>}
        </View>

        {/* Description */}
        <View style={eventStyles.field}>
          <View style={eventStyles.labelRow}>
            <Text style={eventStyles.title}>Description</Text>
            <Text style={eventStyles.charCount}>{data.description.length} / 200</Text>
          </View>
          <TextInput
            style={[
              eventStyles.input,
              eventStyles.inputMultiline,
              data.description.length > 180 && eventStyles.inputWarning,
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
        style={[eventStyles.cta, !canNext && eventStyles.ctaDisabled]}
        onPress={handleNext}
        disabled={!canNext}
      >
        <Text style={eventStyles.ctaText}>NEXT →</Text>
      </Pressable>
    </View>
  );
}
