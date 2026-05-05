import { ConfirmEventCard } from '@/components/confirm-event-card';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventDraft } from './_layout';
import { eventStyles } from './styles';

export default function ConfirmEventScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch, submit } = useEventDraft();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  console.log('Confirm screen data:', { campName: data.campName, campAddress: data.campAddress });

  const hasErrors = !data.campAddress || data.dates.length === 0 || !data.name || !data.time;
  const canSubmit = !loading && !success && !hasErrors;

  async function handleSubmit() {
    if (!data.campAddress) {
      Alert.alert('Missing info', 'Please select a camp');
      return;
    }
    if (data.dates.length === 0) {
      Alert.alert('Missing info', 'Please select at least one date');
      return;
    }
    if (!data.name) {
      Alert.alert('Missing info', 'Please enter an event name');
      return;
    }
    if (!data.time) {
      Alert.alert('Missing info', 'Please set a time');
      return;
    }

    setLoading(true);

    try {
      await submit();
      setSuccess(true);
      setTimeout(() => {
        router.replace('/');
      }, 1000);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create event. Please try again.');
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={[eventStyles.successContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={eventStyles.successContent}>
          <Text style={eventStyles.successText}>✓ Event created!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[eventStyles.containerWithPadding, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={eventStyles.body}>
        <Text variant="title">Confirm your event</Text>
        <Text style={eventStyles.subtitle}>Review details and set capacity</Text>

        {/* Event card */}
        <ConfirmEventCard
          campName={data.campName}
          campAddress={data.campAddress}
          eventName={data.name}
          description={data.description}
          date={data.dates[0] || ''}
          time={data.time}
          location={data.location_type === 'other' ? data.location_name : 'Our Camp'}
          maxCapacity={data.max_capacity ? parseInt(data.max_capacity, 10) : undefined}
        />

        {/* Max capacity */}
        <View style={eventStyles.field}>
          <Text style={eventStyles.title}>How many can come?</Text>
          <Text style={eventStyles.subtitle}>If the venue has a maximum capacity, please specify</Text>
          <TextInput
            style={eventStyles.input}
            placeholder="Leave empty for unlimited"
            placeholderTextColor={Colors.textSecondary}
            value={data.max_capacity}
            onChangeText={(value) => {
              const numValue = value.replace(/[^0-9]/g, '');
              dispatch({ type: 'SET_FIELD', field: 'max_capacity', value: numValue });
            }}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={eventStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        )}
      </View>

      {/* CTA */}
      <Pressable
        style={[eventStyles.submitBtn, (!canSubmit || loading) && eventStyles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={eventStyles.submitBtnText}>SUBMIT</Text>
        )}
      </Pressable>
    </View>
  );
}
