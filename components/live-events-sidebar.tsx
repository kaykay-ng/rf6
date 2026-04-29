import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { isLiveEvent, type CampEvent } from './event-card';

// ── Color palette for events ─────────────────────────────────────────────────

export const EVENT_COLORS = [
  '#FF6B6B', '#FFB347', '#87CEFA', '#B39DDB',
  '#80DEEA', '#FFD54F', '#F48FB1', '#C5E1A5',
  '#EF9A9A', '#FFCC80', '#90CAF9', '#CE93D8',
];

export function eventColorForIndex(index: number): string {
  return EVENT_COLORS[index % EVENT_COLORS.length];
}

// ── Props ────────────────────────────────────────────────────────────────────

type Props = {
  events: CampEvent[];
  getEventColor: (event: CampEvent) => string;
  getHostCampName: (event: CampEvent) => string | undefined;
  onEventPress?: (event: CampEvent) => void;
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function LiveEventsSidebar({ events, getEventColor, getHostCampName, onEventPress }: Props) {
  const insets = useSafeAreaInsets();

  const live = events.filter(isLiveEvent);
  const upcoming = events.filter((e) => !isLiveEvent(e));

  const today = new Date();
  const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WHAT'S ON{'\n'}TODAY</Text>
        <View style={styles.headerDate}>
          <Text style={styles.dayName}>{dayName}</Text>
          <Text style={styles.dateNum}>{dateStr}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Happening Now */}
        {live.length > 0 && (
          <TimelineSection label="Happening Now" events={live} getEventColor={getEventColor} getHostCampName={getHostCampName} onEventPress={onEventPress} />
        )}

        {/* Coming Up */}
        {upcoming.length > 0 && (
          <TimelineSection label="Coming Up" events={upcoming} getEventColor={getEventColor} getHostCampName={getHostCampName} onEventPress={onEventPress} />
        )}

        {events.length === 0 && (
          <Text style={styles.emptyText}>No events scheduled for today.</Text>
        )}
      </ScrollView>
    </View>
  );
}

// ── Timeline section ─────────────────────────────────────────────────────────

function TimelineSection({ label, events, getEventColor, getHostCampName, onEventPress }: {
  label: string;
  events: CampEvent[];
  getEventColor: (event: CampEvent) => string;
  getHostCampName: (event: CampEvent) => string | undefined;
  onEventPress?: (event: CampEvent) => void;
}) {
  const color = EVENT_COLORS[label === 'Happening Now' ? 0 : 1];

  return (
    <View style={styles.section}>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionText}>{label}</Text>
      </View>

      <View style={styles.timelineGrid}>
        {events.map((event, idx) => (
          <TimelineRow
            key={event.id}
            event={event}
            color={getEventColor(event)}
            hostCampName={getHostCampName(event)}
            isLive={label === 'Happening Now'}
            isLast={idx === events.length - 1}
            onPress={() => onEventPress?.(event)}
          />
        ))}
      </View>
    </View>
  );
}

// ── Timeline row ──────────────────────────────────────────────────────────────

function TimelineRow({ event, color, hostCampName, isLive, isLast, onPress }: {
  event: CampEvent;
  color: string;
  hostCampName?: string;
  isLive: boolean;
  isLast: boolean;
  onPress?: () => void;
}) {
  // Format time: "18:00" → "6 PM"
  const [hh, mm] = event.time.split(':');
  const h = parseInt(hh, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const timeStr = `${h12}:${mm} ${ampm}`;

  const zone = event.host_camp_id.split('-')[0];

  return (
    <Pressable style={({ pressed }) => [styles.row, { backgroundColor: color + '14' }, pressed && { opacity: 0.8 }]} onPress={onPress}>
      {/* Time column */}
      <View style={styles.timeCol}>
        <Text style={styles.timeText}>{timeStr}</Text>
        {isLive && (
          <View style={[styles.nowBadge, { backgroundColor: color }]}>
            <Text style={styles.nowBadgeText}>NOW</Text>
          </View>
        )}
      </View>

      {/* Vertical divider */}
      <View style={[styles.rowDivider, { backgroundColor: color }]} />

      {/* Event info column */}
      <View style={styles.infoCol}>
        <Text style={styles.eventName}>{event.name}</Text>
        {!!hostCampName && (
          <Text style={styles.campName}>{hostCampName} · Zone {zone}</Text>
        )}
      </View>

      {/* Spots column */}
      {event.max_capacity != null && (
        <View style={styles.spotsCol}>
          <Text style={styles.spotsNum}>{event.max_capacity}</Text>
          <Text style={styles.spotsLabel}>spots</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 42,
    lineHeight: 44,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerDate: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  dayName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 42,
    color: Colors.text,
    letterSpacing: -0.5
  },
  dateNum: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  divider: {
    height: 1.5,
    backgroundColor: Colors.border,
    marginHorizontal: 28,
    marginBottom: 20,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 40 },

  // ── Section ──
  section: { marginBottom: 32 },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 18,
    letterSpacing: 1.0,
    color: Colors.textSecondary,
  },

  // ── Timeline grid ──
  timelineGrid: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft:16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 0,
  },

  // ── Time column ──
  timeCol: {
    width: 90,
    paddingRight: 16,
    alignItems: 'flex-start',
  },
  timeText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 22,
    letterSpacing: 0.5,
    color: Colors.text,
    lineHeight: 26,
  },
  dateText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  nowBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 8,
  },
  nowBadgeText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.white,
  },

  // ── Divider ──
  rowDivider: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
    marginRight: 16,
    minHeight: 60,
  },

  // ── Info column ──
  infoCol: { flex: 1, justifyContent: 'center' },
  eventName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 20,
    letterSpacing: 0.5,
    color: Colors.text,
    lineHeight: 26,
  },
  campName: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    marginTop: 4,
  },

  // ── Spots column ──
  spotsCol: {
    alignItems: 'flex-end',
    paddingLeft: 16,
    minWidth: 50,
  },
  spotsNum: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 22,
    color: Colors.text,
    lineHeight: 26,
  },
  spotsLabel: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },

  emptyText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingVertical: 32,
  },
});