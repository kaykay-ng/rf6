import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventDraft } from './_layout';
import { eventStyles } from './styles';

// Festival dates: June 27 – July 4, 2026
const FESTIVAL_DAYS = [
  { label: 'Sat 27 Jun', date: '2026-06-27' },
  { label: 'Sun 28 Jun', date: '2026-06-28' },
  { label: 'Mon 29 Jun', date: '2026-06-29' },
  { label: 'Tue 30 Jun', date: '2026-06-30' },
  { label: 'Wed 1 Jul', date: '2026-07-01' },
  { label: 'Thu 2 Jul', date: '2026-07-02' },
  { label: 'Fri 3 Jul', date: '2026-07-03' },
  { label: 'Sat 4 Jul', date: '2026-07-04' },
];

export default function WhenEventScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch } = useEventDraft();
  const [timeError, setTimeError] = useState('');
  const [locationNameError, setLocationNameError] = useState('');
  const [hh, setHh] = useState(data.time.split(':')[0] || '');
  const [mm, setMm] = useState(data.time.split(':')[1] || '');

  useEffect(() => {
    const h = hh.padStart(2, '0');
    const m = mm.padStart(2, '0');
    setTimeError('');

    if (h && m) {
      const hNum = parseInt(h, 10);
      if (hNum < 0 || hNum > 23) {
        setTimeError('Hour must be 0–23');
        return;
      }
      const mNum = parseInt(m, 10);
      if (mNum < 0 || mNum > 59) {
        setTimeError('Minute must be 0–59');
        return;
      }
      dispatch({ type: 'SET_FIELD', field: 'time', value: `${h}:${m}` });
    }
  }, [hh, mm, dispatch]);

  function handleHourChange(value: string) {
    setHh(value.slice(0, 2));
  }

  function handleMinuteChange(value: string) {
    setMm(value.slice(0, 2));
  }

  const datesSelected = data.dates.length > 0;
  const timeValid = hh && mm && !timeError;
  const locationOk = data.location_type === 'our_camp' || (data.location_type === 'other' && data.location_name.trim());
  const canNext = datesSelected && timeValid && locationOk;

  function handleNext() {
    if (!canNext) return;
    router.push('/events/confirm');
  }

  return (
    <View style={[eventStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={eventStyles.scroll} contentContainerStyle={eventStyles.scrollContent}>
        {/* Date picker */}
        <View style={eventStyles.field}>
          <Text style={eventStyles.title}>Date</Text>
          <Text style={eventStyles.subtitle}>You can click on multiple dates if they are recurring</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={eventStyles.dayScroll}
          >
            {FESTIVAL_DAYS.map(({ label, date }) => {
              const isSelected = data.dates.includes(date);
              return (
                <Pressable
                  key={date}
                  style={[eventStyles.dayPill, isSelected && eventStyles.dayPillSelected]}
                  onPress={() => {
                    if (isSelected) {
                      dispatch({ type: 'SET_DATES', dates: data.dates.filter((d) => d !== date) });
                    } else {
                      dispatch({ type: 'SET_DATES', dates: [...data.dates, date] });
                    }
                  }}
                >
                  <Text
                    style={[
                      eventStyles.dayPillText,
                      isSelected && eventStyles.dayPillTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Time picker */}
        <View style={eventStyles.field}>
          <Text style={eventStyles.title}>Time</Text>
          <View style={eventStyles.timePicker}>
            <View style={eventStyles.timeInput}>
              <TextInput
                style={eventStyles.inputLarge}
                placeholder="HH"
                placeholderTextColor={Colors.textSecondary}
                value={hh}
                onChangeText={handleHourChange}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={eventStyles.timeSeparator}>:</Text>
            <View style={eventStyles.timeInput}>
              <TextInput
                style={eventStyles.inputLarge}
                placeholder="MM"
                placeholderTextColor={Colors.textSecondary}
                value={mm}
                onChangeText={handleMinuteChange}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
          {timeError && <Text style={eventStyles.errorText}>{timeError}</Text>}
        </View>

        {/* Location */}
        <View style={eventStyles.field}>
          <Text style={eventStyles.title}>Location</Text>
          <View style={eventStyles.locationPills}>
            <Pressable
              style={[
                eventStyles.locationPill,
                data.location_type === 'our_camp' && eventStyles.locationPillSelected,
              ]}
              onPress={() => {
                dispatch({ type: 'SET_FIELD', field: 'location_type', value: 'our_camp' });
                dispatch({ type: 'SET_FIELD', field: 'location_name', value: '' });
                setLocationNameError('');
              }}
            >
              <Text
                style={[
                  eventStyles.locationPillText,
                  data.location_type === 'our_camp' && eventStyles.locationPillTextSelected,
                ]}
              >
                Our Camp
              </Text>
            </Pressable>
            <Pressable
              style={[
                eventStyles.locationPill,
                data.location_type === 'other' && eventStyles.locationPillSelected,
              ]}
              onPress={() => dispatch({ type: 'SET_FIELD', field: 'location_type', value: 'other' })}
            >
              <Text
                style={[
                  eventStyles.locationPillText,
                  data.location_type === 'other' && eventStyles.locationPillTextSelected,
                ]}
              >
                Other location
              </Text>
            </Pressable>
          </View>

          {/* Location name input */}
          {data.location_type === 'other' && (
            <View style={eventStyles.locationNameContainer}>
              <TextInput
                style={[eventStyles.input, locationNameError && eventStyles.inputError]}
                placeholder="e.g. Apollo stage hill"
                placeholderTextColor={Colors.textSecondary}
                value={data.location_name}
                onChangeText={(v) => {
                  dispatch({ type: 'SET_FIELD', field: 'location_name', value: v });
                  setLocationNameError('');
                }}
                maxLength={100}
              />
              {locationNameError && <Text style={eventStyles.errorText}>{locationNameError}</Text>}
            </View>
          )}
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
