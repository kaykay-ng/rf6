import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useEventDraft } from './_layout';

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

  const dateSelected = !!data.date;
  const timeValid = hh && mm && !timeError;
  const locationOk = data.location_type === 'our_camp' || (data.location_type === 'other' && data.location_name.trim());
  const canNext = dateSelected && timeValid && locationOk;

  function handleNext() {
    if (!canNext) return;
    router.push('/events/confirm');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Date picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayScroll}
          >
            {FESTIVAL_DAYS.map(({ label, date }) => (
              <Pressable
                key={date}
                style={[styles.dayPill, data.date === date && styles.dayPillSelected]}
                onPress={() => dispatch({ type: 'SET_FIELD', field: 'date', value: date })}
              >
                <Text
                  style={[
                    styles.dayPillText,
                    data.date === date && styles.dayPillTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Time picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Time</Text>
          <View style={styles.timePicker}>
            <View style={styles.timeInput}>
              <TextInput
                style={styles.input}
                placeholder="HH"
                placeholderTextColor={Colors.textSecondary}
                value={hh}
                onChangeText={handleHourChange}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <Text style={styles.timeSeparator}>:</Text>
            <View style={styles.timeInput}>
              <TextInput
                style={styles.input}
                placeholder="MM"
                placeholderTextColor={Colors.textSecondary}
                value={mm}
                onChangeText={handleMinuteChange}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
          {timeError && <Text style={styles.errorText}>{timeError}</Text>}
        </View>

        {/* Location */}
        <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationPills}>
            <Pressable
              style={[
                styles.locationPill,
                data.location_type === 'our_camp' && styles.locationPillSelected,
              ]}
              onPress={() => {
                dispatch({ type: 'SET_FIELD', field: 'location_type', value: 'our_camp' });
                dispatch({ type: 'SET_FIELD', field: 'location_name', value: '' });
                setLocationNameError('');
              }}
            >
              <Text
                style={[
                  styles.locationPillText,
                  data.location_type === 'our_camp' && styles.locationPillTextSelected,
                ]}
              >
                Our Camp
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.locationPill,
                data.location_type === 'other' && styles.locationPillSelected,
              ]}
              onPress={() => dispatch({ type: 'SET_FIELD', field: 'location_type', value: 'other' })}
            >
              <Text
                style={[
                  styles.locationPillText,
                  data.location_type === 'other' && styles.locationPillTextSelected,
                ]}
              >
                Other location
              </Text>
            </Pressable>
          </View>

          {/* Location name input */}
          {data.location_type === 'other' && (
            <View style={styles.locationNameContainer}>
              <TextInput
                style={[styles.input, locationNameError && styles.inputError]}
                placeholder="e.g. Apollo stage hill"
                placeholderTextColor={Colors.textSecondary}
                value={data.location_name}
                onChangeText={(v) => {
                  dispatch({ type: 'SET_FIELD', field: 'location_name', value: v });
                  setLocationNameError('');
                }}
                maxLength={100}
              />
              {locationNameError && <Text style={styles.errorText}>{locationNameError}</Text>}
            </View>
          )}
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

  // Date pills
  dayScroll: {
    gap: 8,
    paddingRight: 28,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  dayPillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayPillText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 13,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  dayPillTextSelected: {
    color: Colors.white,
  },

  // Time picker
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Oswald_700Bold',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#B01020',
  },
  timeSeparator: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#B01020',
    letterSpacing: 0.3,
    marginTop: 6,
  },

  // Location
  locationPills: {
    flexDirection: 'row',
    gap: 10,
  },
  locationPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  locationPillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  locationPillText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 13,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  locationPillTextSelected: {
    color: Colors.white,
  },
  locationNameContainer: {
    marginTop: 12,
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
