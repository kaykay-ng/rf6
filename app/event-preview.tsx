import { ConfirmEventCard } from '@/components/confirm-event-card';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventStyles } from './events/styles';

export default function EventPreviewScreen() {
  const insets = useSafeAreaInsets();

  // Mock data for testing
  const mockEvent = {
    campName: 'Camp Queer Chaos',
    eventName: 'Late Night Dance Party',
    description: 'Come join us for an unforgettable night of dancing and good vibes with friends old and new.',
    date: '2026-06-28',
    time: '22:30',
    location: 'Our Camp',
    maxCapacity: 40,
  };

  return (
    <View style={[eventStyles.containerWithPadding, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={eventStyles.body}>
        <Text variant="title">Event Preview (Dev)</Text>
        <Text style={eventStyles.subtitle}>Testing the confirm event card design</Text>

        <ConfirmEventCard
          campName={mockEvent.campName}
          campAddress="C5-3"
          eventName={mockEvent.eventName}
          description={mockEvent.description}
          date={mockEvent.date}
          time={mockEvent.time}
          location={mockEvent.location}
          maxCapacity={mockEvent.maxCapacity}
        />

        <View style={{ marginTop: 20, padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
            DEV NOTE: Edit mock data in app/event-preview.tsx to test different content.
          </Text>
        </View>
      </View>
    </View>
  );
}
