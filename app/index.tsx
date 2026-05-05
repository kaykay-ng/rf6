import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable, Alert, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { CommonGroundMap, type Camp } from '@/components/common-ground-map';
import { CampSheet, type CampEvent } from '@/components/camp-sheet';
import { MOCK_EVENTS } from '@/data/mock-events';
import { ZONES } from '@/data/grid';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/session';
import { LiveEventsSidebar, eventColorForIndex } from '@/components/live-events-sidebar';
import { ZoneHoverCard } from '@/components/zone-hover-card';
import { isLiveEvent } from '@/components/event-card';

const SHEET_HIDDEN   = 540;
const SHEET_HEIGHT   = 520;
const DRAWER_WIDTH   = 280;
const WIDE_BREAKPOINT = 1024;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { session, logout } = useSession();

  // On mobile devices, redirect to welcome (kiosk mode: registration only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/welcome');
    }
  }, []);
  const [camps, setCamps]               = useState<Camp[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [campEvents, setCampEvents]     = useState<CampEvent[] | null>(null);
  const [allEvents, setAllEvents]       = useState<CampEvent[]>([]);
  const [activeZone, setActiveZone]     = useState<string | null>(null);
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  const isWide = width >= WIDE_BREAKPOINT;
  const [mapContainerWidth, setMapContainerWidth] = useState(0);

  // ── Today's events (for sidebar) ─────────────────────────────────────────
  const todaysEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allEvents
      .filter((e) => e.date === today)
      .sort((a, b) => {
        const liveA = isLiveEvent(a) ? -1 : 1;
        const liveB = isLiveEvent(b) ? -1 : 1;
        if (liveA !== liveB) return liveA - liveB;
        return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
      });
  }, [allEvents]);

  // Map camp address → event dot color (via host_camp_id)
  // Only compute once camps are loaded, to avoid flashing coloured dots before data arrives
  const eventColors = useMemo(() => {
    if (camps.length === 0) return {};
    const map: Record<string, string> = {};
    allEvents.forEach((event, i) => {
      const camp = camps.find((c) => c.address === event.host_camp_id);
      if (camp) {
        map[camp.address] = eventColorForIndex(i);
      }
    });
    return map;
  }, [camps, allEvents]);

  const getEventColor = (event: CampEvent) => {
    const idx = allEvents.findIndex((e) => e.id === event.id);
    return eventColorForIndex(idx);
  };

  const getHostCampName = (event: CampEvent) => {
    return camps.find((c) => c.address === event.host_camp_id)?.name;
  };

  const fetchCamps = useCallback(async () => {
    const { data, error } = await supabase
      .from('camps')
      .select('id, name, address, vibe_tags, bio, flag_image_url');

    if (error) {
      console.error('Failed to load camps:', error);
      return;
    }
    if (!data) return;
    setCamps(data.map(r => ({
      id:        r.id,
      name:      r.name,
      address:   r.address,
      vibes:     r.vibe_tags,
      bio:       r.bio,
      imageUri:  r.flag_image_url || undefined,
    })));
  }, []);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, name, date, time, location_type, location_name, host_camp_id, description, max_capacity, registered_count');

    if (error) {
      console.error('Failed to load events:', error);
      return;
    }
    if (!data) return;
    setAllEvents(data.map(r => ({
      id: r.id,
      name: r.name,
      date: r.date,
      time: r.time,
      location_type: r.location_type,
      location_name: r.location_name,
      host_camp_id: r.host_camp_id,
      description: r.description,
      max_capacity: r.max_capacity,
      registered_count: r.registered_count || 0,
    })));
  }, []);

  useEffect(() => {
    fetchCamps();
    fetchEvents();
  }, [fetchCamps, fetchEvents]);

  useFocusEffect(
    useCallback(() => {
      fetchCamps();
      fetchEvents();
    }, [fetchCamps, fetchEvents])
  );

  // ── Bottom sheet ──────────────────────────────────────────────────────────
  const sheetOffset = useSharedValue(SHEET_HIDDEN);
  const sheetStyle  = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(sheetOffset.value, { damping: 48, stiffness: 320 }) }],
  }));

  const liveEventSlots = useMemo(() => {
    const now = Date.now();
    const live = allEvents.filter((e) => {
      const start = new Date(`${e.date}T${e.time}:00`).getTime();
      const diffMin = (start - now) / 60_000;
      return diffMin >= -30 && diffMin <= 60;
    });
    return new Set(live.map((e) => e.host_camp_id));
  }, [allEvents]);

  function handleSelectCamp(camp: Camp) {
    setSelectedCamp(camp);
    setActiveZone(null);
    const campEventList = allEvents.filter((e) => e.host_camp_id === camp.address);
    setCampEvents(campEventList);
    sheetOffset.value = 0;
  }
  function dismissSheet() {
    sheetOffset.value = SHEET_HIDDEN;
    // Delay clearing content until slide-down animation finishes
    setTimeout(() => { setSelectedCamp(null); setCampEvents(null); }, 300);
  }

  function confirmDeleteCamp() {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete camp\n\nThis will permanently remove your camp from the map. This cannot be undone.')) {
        handleDeleteCamp();
      }
      return;
    }
    Alert.alert(
      'Delete camp',
      'This will permanently remove your camp from the map. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteCamp },
      ],
    );
  }

  async function handleDeleteCamp() {
    if (!session) return;
    const { error } = await supabase.from('camps').delete().eq('id', session.campId);
    if (error) {
      Alert.alert('Error', 'Could not delete your camp. Please try again.');
      return;
    }
    setCamps(prev => prev.filter(c => c.id !== session.campId));
    dismissSheet();
    setTimeout(logout, 320); // wait for sheet to slide down before clearing session
  }
  function handleZoneChange(zoneId: string | null) {
    if (!selectedCamp) setActiveZone(zoneId);
  }

  // ── Drawer ────────────────────────────────────────────────────────────────
  const drawerX       = useSharedValue(-DRAWER_WIDTH);
  const backdropAlpha = useSharedValue(0);

  const drawerStyle   = useAnimatedStyle(() => ({ transform: [{ translateX: drawerX.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropAlpha.value }));

  function openDrawer() {
    fetchCamps();
    setDrawerOpen(true);
    drawerX.value       = withSpring(0,   { damping: 48, stiffness: 320 });
    backdropAlpha.value = withTiming(0.45, { duration: 220 });
  }
  function closeDrawer() {
    drawerX.value       = withSpring(-DRAWER_WIDTH, { damping: 48, stiffness: 320 });
    backdropAlpha.value = withTiming(0, { duration: 180 });
    // delay state update until animation finishes
    setTimeout(() => setDrawerOpen(false), 260);
  }

  function navigate(path: string) {
    closeDrawer();
    setTimeout(() => router.push(path as any), 120);
  }

  return (
    <View style={styles.container}>
      {/* Inject hamburger into the Stack header */}
      <Stack.Screen
        options={{
          title: 'BOND',
          headerLeft: () => (
            <Pressable onPress={openDrawer} style={styles.hamburger} hitSlop={10}>
              <View style={styles.bar} />
              <View style={styles.bar} />
              <View style={styles.bar} />
            </Pressable>
          ),
        }}
      />

      {/* ── Wide-screen layout: sidebar + map ── */}
      {isWide ? (
        <View style={styles.wideLayout}>
          {/* 40% event sidebar */}
          <View style={styles.sidebarWrapper}>
            <LiveEventsSidebar
              events={todaysEvents}
              allEvents={allEvents}
              getEventColor={getEventColor}
              getHostCampName={getHostCampName}
              onEventPress={(event) => {
                const camp = camps.find((c) => c.address === event.host_camp_id);
                if (camp) handleSelectCamp(camp);
              }}
            />
          </View>

          {/* 60% map area */}
          <View style={styles.mapArea} onLayout={(e) => setMapContainerWidth(e.nativeEvent.layout.width)}>
            <CommonGroundMap
              camps={camps}
              zones={ZONES}
              liveEventSlots={liveEventSlots}
              eventColors={eventColors}
              containerWidth={mapContainerWidth || undefined}
              onSelectCamp={handleSelectCamp}
              onDismiss={dismissSheet}
              onZoneChange={handleZoneChange}
              onHoverZone={(id) => setHoveredZoneId(id)}
            />
            {hoveredZoneId && !selectedCamp && (() => {
              const zoneCamps = camps.filter(c => c.address.startsWith(hoveredZoneId + '-'));
              return zoneCamps.length > 0 ? (
                <ZoneHoverCard zoneId={hoveredZoneId} camps={zoneCamps} />
              ) : null;
            })()}
            <Animated.View style={[styles.sheetWrapper, sheetStyle]}>
              {selectedCamp && (
                <CampSheet
                  camp={selectedCamp}
                  events={campEvents}
                  allCamps={camps}
                  paddingBottom={insets.bottom + 16}
                  onDismiss={dismissSheet}
                />
              )}
            </Animated.View>
          </View>
        </View>
      ) : (
        /* ── Narrow-screen layout: full map ── */
        <>
          <CommonGroundMap
            camps={camps}
            zones={ZONES}
            liveEventSlots={liveEventSlots}
            onSelectCamp={handleSelectCamp}
            onDismiss={dismissSheet}
            onZoneChange={handleZoneChange}
              onHoverZone={(id) => setHoveredZoneId(id)}
          />
          {hoveredZoneId && !selectedCamp && (() => {
              const zoneCamps = camps.filter(c => c.address.startsWith(hoveredZoneId + '-'));
              return zoneCamps.length > 0 ? (
                <ZoneHoverCard zoneId={hoveredZoneId} camps={zoneCamps} />
              ) : null;
            })()}
          <Animated.View style={[styles.sheetWrapper, sheetStyle]}>
            {selectedCamp && (
              <CampSheet
                camp={selectedCamp}
                events={campEvents}
                allCamps={camps}
                paddingBottom={insets.bottom + 16}
                onDismiss={dismissSheet}
              />
            )}
          </Animated.View>
        </>
      )}

      {/* ── Drawer backdrop ── */}
      {drawerOpen && (
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* ── Drawer panel ── */}
      <Animated.View style={[styles.drawer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }, drawerStyle]}>
        <Text style={styles.drawerBrand}>BOND</Text>
        <View style={styles.drawerDivider} />

        {session ? (
          <>
            <Text style={styles.drawerCampName}>{session.campName}</Text>
            <Text style={styles.drawerCampAddress}>{session.address}</Text>
            {(() => {
              const userCamp = camps.find(c => c.id === session.campId);
              if (!userCamp || !userCamp.imageUri) {
                return <View style={styles.drawerFlagPlaceholder} />;
              }
              return Platform.OS === 'web' ? (
                <img
                  src={userCamp.imageUri}
                  style={{ width: '100%', height: 140, borderRadius: 8, marginBottom: 16, objectFit: 'contain' } as any}
                  alt="Camp flag"
                />
              ) : (
                <Image
                  source={{ uri: userCamp.imageUri }}
                  style={styles.drawerFlagImage}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              );
            })()}
            <View style={styles.drawerDivider} />
            <DrawerItem label="Log out"        onPress={() => { closeDrawer(); setTimeout(logout, 280); }} />
            <DrawerItem label="Delete camp"    onPress={() => { closeDrawer(); setTimeout(confirmDeleteCamp, 280); }} destructive />
          </>
        ) : (
          <>
            {Platform.OS !== 'web' && (
              <DrawerItem label="Register your camp" onPress={() => navigate('/welcome')} />
            )}
            <DrawerItem label="Log in" onPress={() => navigate('/login')} />
          </>
        )}

        <View style={styles.drawerDivider} />
        <DrawerItem label="Add an event"  onPress={() => navigate('/events/select')} />
        <View style={styles.drawerDivider} />
        <DrawerItem label="Scan flag" onPress={() => navigate('/scan-flag')} />
      </Animated.View>
    </View>
  );
}

function DrawerItem({ label, onPress, destructive }: { label: string; onPress: () => void; destructive?: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
      onPress={onPress}
    >
      <Text style={[styles.drawerItemText, destructive && styles.drawerItemDestructive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Wide layout ──
  wideLayout:     { flex: 1, flexDirection: 'row' },
  sidebarWrapper: { width: '40%' },
  mapArea:        { flex: 1, position: 'relative' },

  // ── Header hamburger ──
  hamburger: { paddingHorizontal: 4, gap: 5, justifyContent: 'center' },
  bar:       { width: 22, height: 2, borderRadius: 1, backgroundColor: Colors.text },

  // ── Zone badge ──
  badge: {
    position: 'absolute', bottom: 72, right: 16,
    backgroundColor: Colors.white, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }, elevation: 6,
    alignItems: 'flex-end',
  },
  badgeWide: {
    // Same badge but constrained to map area — right edge already 16px from container
    right: 16,
  },
  badgeZone: { fontSize: 18, color: Colors.text, marginBottom: 1 },
  badgeSub:  { color: Colors.textSecondary, letterSpacing: 0.3 },

  // ── Bottom sheet ──
  sheetWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
  },

  // ── Drawer ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24,
    shadowOffset: { width: 6, height: 0 }, elevation: 24,
    zIndex: 11,
  },
  drawerBrand: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 36,
    lineHeight: 34,
    color: Colors.text,
    marginBottom: 24,
  },
  drawerDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  drawerCampName:    { fontFamily: 'Oswald_700Bold', fontSize: 20, color: Colors.text, marginBottom: 2 },
  drawerCampAddress: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 12 },
  drawerFlagImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 16 },
  drawerFlagPlaceholder: { width: '100%', height: 140, borderRadius: 8, backgroundColor: '#e0e0e0', marginBottom: 16 },
  drawerItem:        { paddingVertical: 14 },
  drawerItemPressed: { opacity: 0.5 },
  drawerItemText:        { fontFamily: 'Oswald_400Regular', fontSize: 18, color: Colors.text, letterSpacing: 0.5 },
  drawerItemDestructive: { color: '#B01020' },
});
