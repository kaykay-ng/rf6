import { type Camp } from '@/components/common-ground-map';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CampEvent = {
  id: string;
  name: string;
  date: string;          // ISO e.g. '2026-06-28'
  time: string;          // e.g. '18:00'
  location_type: 'our_camp' | 'nearby' | 'tbd';
  description?: string;
  max_capacity?: number;
};

function formatDate(isoDate: string, time: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day} · ${time}`;
}

// ── CampSheet ─────────────────────────────────────────────────────────────────

type Props = {
  camp: Camp;
  events: CampEvent[] | null;   // null = loading
  paddingBottom: number;
  onDismiss: () => void;
};

export function CampSheet({ camp, events, paddingBottom, onDismiss }: Props) {
  return (
    <View style={styles.shadow}>
      <View style={styles.clip}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.address}>{camp.address}</Text>
              <Text style={styles.campName}>{camp.name}</Text>
            </View>
            <Pressable onPress={onDismiss} hitSlop={16} style={styles.closeBtn}>
              <Text style={styles.closeDash}>—</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.headerDivider} />

        {/* ── Scrollable body ── */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: paddingBottom + 8 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Vibe pills */}
          <View style={styles.vibes}>
            {camp.vibes.map((v) => (
              <View key={v} style={styles.vibe}>
                <Text style={styles.vibeText}>{v}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          {!!camp.bio && <Text style={styles.bio}>{camp.bio}</Text>}

          {/* Events section */}
          <View style={styles.sectionRow}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionLabel}>EVENTS</Text>
            <View style={styles.sectionLine} />
          </View>

          {events === null && (
            <ActivityIndicator size="small" color={Colors.accent} style={styles.loader} />
          )}
          {events !== null && events.length === 0 && (
            <Text style={styles.emptyText}>No upcoming events.</Text>
          )}
          {events?.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}

        </ScrollView>

      </View>
    </View>
  );
}

// ── EventCard ─────────────────────────────────────────────────────────────────

function EventCard({ event }: { event: CampEvent }) {
  const locationLabel = {
    our_camp: 'Our camp',
    nearby:   'Nearby',
    tbd:      'Location TBD',
  }[event.location_type] ?? event.location_type;

  return (
    <View style={styles.card}>
      <View style={styles.cardBar} />
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{event.name}</Text>
        <Text style={styles.cardMeta}>{formatDate(event.date, event.time)}</Text>
        {!!event.description && (
          <Text style={styles.cardDesc} numberOfLines={1}>{event.description}</Text>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.locBadge}>
            <Text style={styles.locText}>{locationLabel}</Text>
          </View>
          {event.max_capacity != null && (
            <Text style={styles.cardCapacity}>{event.max_capacity} spots</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shadow: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  clip: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },

  // ── Header ──
  header: {
    backgroundColor: Colors.surface,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handle: {
    width: 32, height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  address: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    letterSpacing: 2.5,
    color: Colors.textSecondary,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  campName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 30,
    lineHeight: 30,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  closeBtn: {
    paddingLeft: 20,
    paddingTop: 2,
  },
  closeDash: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 22,
    lineHeight: 22,
    color: Colors.accent,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // ── Scroll body ──
  scroll: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // ── Vibe pills ──
  vibes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 16,
  },
  vibe: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: Colors.accent,
  },
  vibeText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#FFFFFF',
    textTransform: 'uppercase'
  },

  // ── Bio ──
  bio: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 22,
  },

  // ── Section divider ──
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 11,
    letterSpacing: 2.5,
    color: Colors.textSecondary,
  },

  // ── Empty / loading ──
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingVertical: 18,
  },

  // ── Event card ──
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardBar: {
    width: 4,
    backgroundColor: Colors.accent,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  cardName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
    color: Colors.text,
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
  locBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  locText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  cardCapacity: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
});
