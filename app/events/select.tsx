import { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useEventDraft } from './_layout';

type Camp = {
  id: string;
  name: string;
  address: string;
};

export default function SelectCampScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch } = useEventDraft();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCamps();
  }, []);

  async function fetchCamps() {
    try {
      const { data: result, error } = await supabase
        .from('camps')
        .select('id, name, address')
        .order('address', { ascending: true });

      if (error) throw error;
      setCamps(result || []);
    } catch (err) {
      console.error('Failed to fetch camps:', err);
      Alert.alert('Error', 'Could not load camps. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectCamp(camp: Camp) {
    dispatch({ type: 'SET_FIELD', field: 'campId', value: camp.id });
    dispatch({ type: 'SET_FIELD', field: 'campAddress', value: camp.address });
    router.push('/events/pin');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Select Your Camp</Text>
        <Text style={styles.subtitle}>Choose your camp to create an event</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : camps.length === 0 ? (
          <Text style={styles.emptyText}>No camps registered yet</Text>
        ) : (
          <View style={styles.campList}>
            {camps.map((camp) => (
              <Pressable
                key={camp.id}
                style={[
                  styles.campButton,
                  data.campId === camp.id && styles.campButtonSelected,
                ]}
                onPress={() => handleSelectCamp(camp)}
              >
                <View style={styles.campButtonContent}>
                  <Text
                    style={[
                      styles.campButtonName,
                      data.campId === camp.id && styles.campButtonNameSelected,
                    ]}
                  >
                    {camp.name}
                  </Text>
                  <Text
                    style={[
                      styles.campButtonAddress,
                      data.campId === camp.id && styles.campButtonAddressSelected,
                    ]}
                  >
                    {camp.address}
                  </Text>
                </View>
                {data.campId === camp.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>You'll verify your camp PIN on the next step</Text>
      </View>
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

  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 24,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },

  campList: {
    gap: 10,
  },
  campButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  campButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  campButtonContent: {
    flex: 1,
  },
  campButtonName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campButtonNameSelected: {
    color: Colors.white,
  },
  campButtonAddress: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  campButtonAddressSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 20,
    color: Colors.white,
  },

  infoBox: {
    marginHorizontal: 28,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    borderRadius: 6,
  },
  infoText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: '#2E7D32',
    letterSpacing: 0.3,
  },
});
