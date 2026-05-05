import { type Camp } from '@/components/common-ground-map';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { type CampEvent, isLiveEvent } from './event-card';
import { ConfirmEventCard } from './confirm-event-card';

// Re-export CampEvent for consumers of camp-sheet
export type { CampEvent } from './event-card';

// ── CampSheet ─────────────────────────────────────────────────────────────────

type Props = {
  camp: Camp;
  events: CampEvent[] | null;   // null = loading
  allCamps?: Camp[];
  paddingBottom: number;
  onDismiss: () => void;
  onRegistrationSuccess?: () => void;
};

export function CampSheet({ camp, events, allCamps = [], paddingBottom, onDismiss, onRegistrationSuccess }: Props) {
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
          {/* Flag hero */}
          {!!camp.imageUri && (
            <Image
              source={{ uri: camp.imageUri }}
              style={styles.flagHero}
              contentFit="cover"
            />
          )}

          {/* Camp name below hero */}
          {!!camp.imageUri && (
            <Text style={styles.campNameBelow}>{camp.name}</Text>
          )}

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
            <View style={styles.eventsList}>
              {events
                .filter(e => e.host_camp_id === camp.address)
                .sort((a, b) => {
                  const liveA = isLiveEvent(a) ? -1 : 1;
                  const liveB = isLiveEvent(b) ? -1 : 1;
                  return liveA !== liveB ? liveA - liveB : `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
                })
                .map((event) => (
                  <ConfirmEventCard
                    key={event.id}
                    campName={camp.name}
                    campAddress={camp.address}
                    eventName={event.name}
                    eventId={event.id}
                    description={event.description}
                    date={event.date}
                    time={event.time}
                    location={event.location_type === 'our_camp' ? 'Our Camp' : (event.location_name || 'TBD')}
                    maxCapacity={event.max_capacity}
                    registeredCount={event.registered_count}
                    camps={allCamps}
                    onRegistrationSuccess={onRegistrationSuccess}
                  />
                ))}
            </View>
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

  // ── Flag hero ──
  flagHero: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  campNameBelow: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 14,
  },

  // ── Events ──
  eventsList: {
    gap: 10,
    marginTop: 8,
  },
  eventCard: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventBanner: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 20,
    minHeight: 90,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  eventNowPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  eventNowText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 10,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  eventCardName: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 20,
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventCardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  eventCardMeta: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eventCardDesc: {
    fontSize: 12,
    lineHeight: 18,
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
});
