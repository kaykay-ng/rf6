import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventDraft } from './_layout';
import { eventStyles } from './styles';

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
    <View style={[eventStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView style={eventStyles.scroll} contentContainerStyle={eventStyles.scrollContent}>
        <Text style={eventStyles.title}>Select Your Camp</Text>
        <Text style={eventStyles.subtitle}>Choose your camp to create an event</Text>

        {loading ? (
          <View style={eventStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : camps.length === 0 ? (
          <Text style={eventStyles.emptyText}>No camps registered yet</Text>
        ) : (
          <View style={eventStyles.campList}>
            {camps.map((camp) => (
              <Pressable
                key={camp.id}
                style={[
                  eventStyles.campButton,
                  data.campId === camp.id && eventStyles.campButtonSelected,
                ]}
                onPress={() => handleSelectCamp(camp)}
              >
                <View style={eventStyles.campButtonContent}>
                  <Text
                    style={[
                      eventStyles.campButtonName,
                      data.campId === camp.id && eventStyles.campButtonNameSelected,
                    ]}
                  >
                    {camp.name}
                  </Text>
                  <Text
                    style={[
                      eventStyles.campButtonAddress,
                      data.campId === camp.id && eventStyles.campButtonAddressSelected,
                    ]}
                  >
                    {camp.address}
                  </Text>
                </View>
                {data.campId === camp.id && (
                  <Text style={eventStyles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
