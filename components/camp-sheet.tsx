import { type Camp } from '@/components/common-ground-map';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { type CampEvent, isLiveEvent } from './event-card';

// Re-export CampEvent for consumers of camp-sheet
export type { CampEvent } from './event-card';

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

          {/* Events */}
          {!!events && events.length > 0 && (
            <>
              <View style={styles.eventSectionDivider}>
                <View style={styles.sectionLine} />
                <Text style={styles.sectionLabel}>EVENTS</Text>
                <View style={styles.sectionLine} />
              </View>
              {events
                .filter(e => e.host_camp_id === camp.address)
                .sort((a, b) => {
                  const liveA = isLiveEvent(a) ? -1 : 1;
                  const liveB = isLiveEvent(b) ? -1 : 1;
                  return liveA !== liveB ? liveA - liveB : `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
                })
                .map((event) => (
                  <View key={event.id} style={styles.eventRow}>
                    <View style={styles.eventDot} />
                    <View style={styles.eventInfo}>
                      <View style={styles.eventTitleRow}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        {isLiveEvent(event) && (
                          <View style={styles.eventBadge}>
                            <Text style={styles.eventBadgeText}>NOW</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.eventMeta}>
                        {event.date && event.time ? `${event.date} · ${event.time}` : event.location_type}
                      </Text>
                      {!!event.description && (
                        <Text style={styles.eventDesc}>{event.description}</Text>
                      )}
                      {event.max_capacity != null && (
                        <Text style={styles.eventCapacity}>{event.max_capacity} spots</Text>
                      )}
                    </View>
                  </View>
                ))}
            </>
          )}

        </ScrollView>

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

  // ── Events ──
  eventSectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginTop: 5,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
    color: Colors.text,
    flex: 1,
  },
  eventBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eventBadgeText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.white,
  },
  eventMeta: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  eventCapacity: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
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
});
