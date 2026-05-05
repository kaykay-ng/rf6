import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { StyleSheet, View, TextInput, Pressable, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { Icon } from './icon';
import { supabase } from '@/lib/supabase';
import { type Camp } from './common-ground-map';

interface ConfirmEventCardProps {
  campName: string;
  campAddress: string;
  eventName: string;
  eventId?: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  maxCapacity?: number;
  registeredCount?: number;
  camps?: Camp[];
  onRegistrationSuccess?: () => void;
}

export function ConfirmEventCard({
  campName,
  campAddress,
  eventName,
  eventId,
  description,
  date,
  time,
  location,
  maxCapacity,
  registeredCount,
  camps = [],
  onRegistrationSuccess,
}: ConfirmEventCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [regCampName, setRegCampName] = useState('');
  const [campPin, setCampPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCampPicker, setShowCampPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [localRegisteredCount, setLocalRegisteredCount] = useState(registeredCount || 0);

  // Parse date for display
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Spots left calculation using local state for optimistic updates
  const capacity = maxCapacity || 40;
  const spotsLeft = capacity - localRegisteredCount;
  const isFull = spotsLeft <= 0;

  const handleSignUp = async () => {
    if (!numberOfPeople || !regCampName || !campPin || !eventId) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Verify camp PIN
      const selectedCamp = camps.find(c => c.name === regCampName);
      if (!selectedCamp) {
        setErrorMessage('Camp not found');
        setIsLoading(false);
        return;
      }

      // For now, we'll use a simple verification. In production, this should be properly secured
      // Assuming the camp has a pin property, or you can store pins separately
      // For demo, we'll accept any non-empty PIN
      if (!campPin) {
        setErrorMessage('PIN is required');
        setIsLoading(false);
        return;
      }

      // Insert registration
      const { error: insertError } = await supabase.from('registrations').insert([
        {
          event_id: eventId,
          camp_name: regCampName,
          camp_pin: campPin,
          number_of_people: parseInt(numberOfPeople),
          registered_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // Update event's registered_count
      const numPeople = parseInt(numberOfPeople);
      const newRegisteredCount = localRegisteredCount + numPeople;
      console.log('Updating event:', { eventId, newRegisteredCount, localRegisteredCount, numberOfPeople });

      const { error: updateError, data: updateData } = await supabase
        .from('events')
        .update({ registered_count: newRegisteredCount })
        .eq('id', eventId);

      console.log('Update result:', { error: updateError, data: updateData });
      if (updateError) throw updateError;

      // Optimistic update: immediately update local registered count
      setLocalRegisteredCount(newRegisteredCount);

      setShowSuccess(true);
      setNumberOfPeople('');
      setRegCampName('');
      setCampPin('');

      // Call the success callback to refetch events
      onRegistrationSuccess?.();

      setTimeout(() => {
        setIsFormOpen(false);
        setShowSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Spots left ribbon */}
      <View style={styles.ribbon}>
        <Text style={styles.ribbonText}>{spotsLeft}/{capacity}</Text>
        <Text style={styles.ribbonDescription}>spots left</Text>
      </View>

      {/* Orange title section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{eventName}</Text>
      </View>

      {/* Camp name header */}
      <View style={styles.header}>
        <Text style={styles.campName}>{campName} ⋅ {campAddress}</Text>
      </View>

      {/* Content section */}
      <View style={styles.content}>
        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          {/* Date detail */}
          <View style={styles.detailItem}>
            <Icon name="date" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{dateStr}</Text>
            </View>
          </View>

          {/* Time detail */}
          <View style={styles.detailItem}>
            <Icon name="time" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>
          </View>

          {/* Location detail */}
          <View style={styles.detailItem}>
            <Icon name="location" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>

          {/* Weather detail */}
          <View style={styles.detailItem}>
            <Icon name="weather" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Weather</Text>
              <Text style={styles.detailValue}>Sunny</Text>
            </View>
          </View>
        </View>

        {/* Sign Up Button */}
        <Pressable
          onPress={() => setIsFormOpen(!isFormOpen)}
          disabled={isFull}
          style={({ pressed }) => [
            styles.signUpBtn,
            isFull && styles.signUpBtnDisabled,
            pressed && !isFull && styles.signUpBtnPressed,
          ]}
        >
          <Text style={[styles.signUpBtnText, isFull && styles.signUpBtnTextDisabled]}>
            {isFull ? 'FULLY BOOKED' : 'SIGN UP'}
          </Text>
        </Pressable>

        {/* Registration Form */}
        {isFormOpen && (
          <View style={styles.registrationForm}>
            {showSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successCheckmark}>✓</Text>
                <Text style={styles.successText}>You are signed up!</Text>
              </View>
            ) : (
              <>
                {errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Number of people"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="number-pad"
                  value={numberOfPeople}
                  onChangeText={setNumberOfPeople}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => setShowCampPicker(true)}
                  disabled={isLoading}
                  style={styles.input}
                >
                  <Text style={regCampName ? styles.campPickerValue : styles.campPickerPlaceholder}>
                    {regCampName || 'Select camp'}
                  </Text>
                </Pressable>
                <TextInput
                  style={styles.input}
                  placeholder="Camp pin"
                  placeholderTextColor={Colors.textSecondary}
                  value={campPin}
                  onChangeText={setCampPin}
                  editable={!isLoading}
                  secureTextEntry
                />
                <Pressable
                  onPress={handleSignUp}
                  disabled={isLoading || !numberOfPeople || !regCampName || !campPin}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    (isLoading || !numberOfPeople || !regCampName || !campPin) && styles.submitBtnDisabled,
                    pressed && styles.submitBtnPressed,
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>REGISTER</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Camp Picker Modal */}
        <Modal
          visible={showCampPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCampPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCampPicker(false)}
          >
            <View style={styles.campPickerModal}>
              <Text style={styles.campPickerTitle}>Select Camp</Text>
              <ScrollView style={styles.campPickerList}>
                {camps.map((camp) => (
                  <Pressable
                    key={camp.address}
                    onPress={() => {
                      setRegCampName(camp.name);
                      setShowCampPicker(false);
                    }}
                    style={({ pressed }) => [
                      styles.campPickerItem,
                      pressed && styles.campPickerItemPressed,
                      regCampName === camp.name && styles.campPickerItemSelected,
                    ]}
                  >
                    <Text style={styles.campPickerItemText}>{camp.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.white,
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  ribbon: {
    position: 'absolute',
    top: 0,
    right: 30,
    zIndex: 10,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  ribbonText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  ribbonDescription: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  header: {
    paddingHorizontal: 16,
  },
  campName: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  
  titleSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 36,
    color: Colors.text,
    letterSpacing: 0,
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },

  description: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  detailsGrid: {
    flexDirection: 'row',
    paddingTop: 18,
    gap: 16,
    borderTopColor: Colors.accent,
    borderTopWidth: 1,
    borderStyle: 'dotted',
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  detailContent: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  capacityText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 0.3,
  },

  // ── Sign Up ──
  signUpBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  signUpBtnDisabled: {
    backgroundColor: Colors.border,
  },
  signUpBtnPressed: {
    opacity: 0.8,
  },
  signUpBtnText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 14,
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  signUpBtnTextDisabled: {
    opacity: 0.6,
  },

  // ── Registration Form ──
  registrationForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopColor: Colors.accent,
    borderTopWidth: 1,
    borderStyle: 'dotted',
    gap: 12,
  },
  errorText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: Colors.border,
  },
  submitBtnPressed: {
    opacity: 0.8,
  },
  submitBtnText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 14,
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  successCheckmark: {
    fontSize: 48,
    color: Colors.accent,
    fontWeight: 'bold',
  },
  successText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.3,
  },

  // ── Camp Picker ──
  campPickerPlaceholder: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  campPickerValue: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  campPickerModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingTop: 16,
    paddingBottom: 32,
  },
  campPickerTitle: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  campPickerList: {
    paddingHorizontal: 16,
  },
  campPickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  campPickerItemPressed: {
    backgroundColor: Colors.background,
  },
  campPickerItemSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  campPickerItemText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
});
