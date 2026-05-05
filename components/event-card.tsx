import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Pressable, StyleSheet, View } from 'react-native';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CampEvent = {
  id: string;
  name: string;
  date: string;          // ISO e.g. '2026-06-28'
  time: string;           // e.g. '18:00'
  location_type: 'our_camp' | 'nearby' | 'tbd' | 'other';
  location_name?: string; // free text location e.g. 'Apollo stage hill'
  host_camp_id: string;    // camp address, e.g. 'C5-3'
  description?: string;
  max_capacity?: number;
  registered_count?: number;
};

function formatDate(isoDate: string, time: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} · ${time}`;
}

export function isLiveEvent(event: CampEvent): boolean {
  const now = Date.now();
  const start = new Date(`${event.date}T${event.time}:00`).getTime();
  const diffMin = (start - now) / 60_000;
  return diffMin >= -30 && diffMin <= 60;
}

// ── EventCard ─────────────────────────────────────────────────────────────────

type Props = {
  event: CampEvent;
  color: string;
  isLive?: boolean;
  hostCampName?: string;
  showDescription?: boolean;
  onPress?: () => void;
};

export function EventCard({ event, color, isLive, hostCampName, showDescription = true, onPress }: Props) {
  const zone = event.host_camp_id.split('-')[0];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.cardBar, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{event.name}</Text>
          {isLive && (
            <View style={[styles.liveBadge, { backgroundColor: color }]}>
              <Text style={styles.liveText}>NOW</Text>
            </View>
          )}
        </View>
        {!!hostCampName && (
          <Text style={styles.cardCamp}>{hostCampName}  ·  Zone {zone}</Text>
        )}
        <Text style={styles.cardMeta}>{formatDate(event.date, event.time)}</Text>
        {showDescription !== false && !!event.description && (
          <Text style={styles.cardDesc} numberOfLines={1}>{event.description}</Text>
        )}
        <View style={styles.cardFooter}>
          {event.max_capacity != null && (
            <Text style={styles.cardCapacity}>{event.max_capacity} spots</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: { opacity: 0.75 },
  cardBar: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
    color: Colors.text,
    flex: 1,
  },
  cardCamp: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    letterSpacing: 0.4,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  liveBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.white,
  },
  cardMeta: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginTop: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardCapacity: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});
