import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isLiveEvent, type CampEvent } from './event-card';
import { Icon } from './icon';

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
  allEvents: CampEvent[];
  getEventColor: (event: CampEvent) => string;
  getHostCampName: (event: CampEvent) => string | undefined;
  onEventPress?: (event: CampEvent) => void;
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function LiveEventsSidebar({ events, allEvents, getEventColor, getHostCampName, onEventPress }: Props) {
  const insets = useSafeAreaInsets();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // If no events today, show upcoming events
  const hasEventsToday = events.length > 0;
  const displayEvents = hasEventsToday ? events : allEvents.filter((e) => e.date > todayStr);
  const displayTitle = hasEventsToday ? "WHAT'S ON\nTODAY" : 'UPCOMING\nEVENTS';

  const live = displayEvents.filter(isLiveEvent);
  const upcoming = displayEvents.filter((e) => !isLiveEvent(e));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{displayTitle}</Text>
        {hasEventsToday && (
          <View style={styles.headerDate}>
            <Text style={styles.dayName}>{dayName}</Text>
            <Text style={styles.dateNum}>{dateStr}</Text>
          </View>
        )}
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

        {displayEvents.length === 0 && (
          <Text style={styles.emptyText}>
            {hasEventsToday ? 'No events scheduled for today.' : 'No upcoming events scheduled.'}
          </Text>
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
  // Date formatting
  const dateObj = new Date(event.date);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Time display in 24-hour format: "18:00"
  const timeStr = event.time;

  // Spots left (default to max capacity until registration data is available)
  const capacity = event.max_capacity || 40;
  const registered = event.registered_count || 0;
  const spotsLeft = capacity - registered;

  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      {/* Ribbon - spots left */}
      {event.max_capacity != null && (
        <View style={[styles.ribbon, { backgroundColor: color }]}>
          <Text style={styles.ribbonText}>{spotsLeft}/{capacity}</Text>
          <Text style={styles.ribbonDescription}>spots left</Text>
        </View>
      )}

      {/* Event info */}
      <View style={styles.content}>
        <Text style={styles.eventName}>{event.name}</Text>
        {!!hostCampName && (
          <Text style={styles.campNameSmall}>{hostCampName} · {event.host_camp_id}</Text>
        )}

        {/* Details columns - Date, Time, Location, Weather */}
        <View style={styles.detailsGrid}>
          {/* Date detail */}
          <View style={styles.detailItem}>
            <Icon name="date" size={18} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{dateStr}</Text>
            </View>
          </View>

          {/* Time detail */}
          <View style={styles.detailItem}>
            <Icon name="time" size={18} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{timeStr}</Text>
            </View>
          </View>

          {/* Location detail */}
          <View style={styles.detailItem}>
            <Icon name="location" size={18} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {event.location_type === 'our_camp' ? 'Our Camp' : (event.location_name || 'TBD')}
              </Text>
            </View>
          </View>

          {/* Weather detail */}
          <View style={styles.detailItem}>
            <Icon name="weather" size={18} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Weather</Text>
              <Text style={styles.detailValue}>Sunny</Text>
            </View>
          </View>
        </View>

        {/* NOW badge */}
        {isLive && (
          <View style={[styles.nowBadge, { backgroundColor: color }]}>
            <Text style={styles.nowBadgeText}>NOW</Text>
          </View>
        )}
      </View>
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
    letterSpacing: 0.5,
    color: Colors.textSecondary,
  },

  // ── Timeline grid ──
  timelineGrid: { gap: 12 },
  row: {
    position: 'relative',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowPressed: {
    opacity: 0.85,
  },

  // ── Ribbon ──
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  ribbonText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 24,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  ribbonDescription: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ── Content ──
  content: {
    paddingRight: 50,
  },
  eventName: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 36,
    color: Colors.text,
    marginBottom: 6,
  },
  campNameSmall: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  // ── Details grid (Time, Location, Weather) ──
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  detailContent: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },

  nowBadge: {
    marginTop: 8,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  nowBadgeText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.white,
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