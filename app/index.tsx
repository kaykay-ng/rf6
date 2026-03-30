import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform, Pressable, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { CommonGroundMap, type Camp } from '@/components/common-ground-map';
import { CampSheet, type CampEvent } from '@/components/camp-sheet';
import { MOCK_EVENTS, hasActiveEvent } from '@/data/mock-events';
import { ZONES } from '@/data/grid';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/context/session';

const SHEET_HIDDEN  = 540;
const SHEET_HEIGHT  = 520;
const DRAWER_WIDTH  = 280;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { session, logout } = useSession();
  const [camps, setCamps]               = useState<Camp[]>([]);
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [campEvents, setCampEvents]     = useState<CampEvent[] | null>(null);
  const [activeZone, setActiveZone]     = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  useEffect(() => {
    supabase
      .from('camps')
      .select('id, name, address, vibe_tags, bio')
      .then(({ data }) => {
        if (!data) return;
        setCamps(data.map(r => ({
          id:      r.id,
          name:    r.name,
          address: r.address,
          vibes:   r.vibe_tags,
          bio:     r.bio,
        })));
      });
  }, []);

  // ── Bottom sheet ──────────────────────────────────────────────────────────
  const sheetOffset = useSharedValue(SHEET_HIDDEN);
  const sheetStyle  = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(sheetOffset.value, { damping: 48, stiffness: 320 }) }],
  }));

  // TODO: replace with real Supabase query once events table exists
  const activeCampAddresses = useMemo(() => {
    if (!hasActiveEvent(MOCK_EVENTS)) return new Set<string>();
    return new Set(camps.map(c => c.address));
  }, [camps]);

  function handleSelectCamp(camp: Camp) {
    setSelectedCamp(camp);
    setActiveZone(null);
    setCampEvents(MOCK_EVENTS); // TODO: fetch from Supabase
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
          title: 'MAP',
          headerLeft: () => (
            <Pressable onPress={openDrawer} style={styles.hamburger} hitSlop={10}>
              <View style={styles.bar} />
              <View style={styles.bar} />
              <View style={styles.bar} />
            </Pressable>
          ),
        }}
      />

      {/* ── Map ── */}
      <CommonGroundMap
        camps={camps}
        zones={ZONES}
        activeCampAddresses={activeCampAddresses}
        onSelectCamp={handleSelectCamp}
        onDismiss={dismissSheet}
        onZoneChange={handleZoneChange}
      />

      {/* ── Zone address badge ── */}
      {activeZone && !selectedCamp && (
        <View style={styles.badge}>
          <Text variant="heading" style={styles.badgeZone}>{activeZone}</Text>
          <Text variant="caption" style={styles.badgeSub}>
            Common Ground · {Platform.OS === 'web' ? 'click' : 'tap'} to explore
          </Text>
        </View>
      )}

      {/* ── Legend ── */}
      <View style={[styles.legend, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.legendRow}>
          <LegendItem color="#2d6838" label="Northwest" />
          <LegendItem color="#3a8040" label="Southeast" />
          <LegendItem color={Colors.accent} label="Registered camp" />
        </View>
        <Text variant="caption" style={styles.legendCount}>
          100 zones · C1–C100 · 10 slots each · 1,000 total sites
        </Text>
      </View>

      {/* ── Camp profile bottom sheet ── */}
      <Animated.View style={[styles.sheetWrapper, sheetStyle]}>
        {selectedCamp && (
          <CampSheet
            camp={selectedCamp}
            events={campEvents}
            paddingBottom={insets.bottom + 16}
            onDismiss={dismissSheet}
          />
        )}
      </Animated.View>

      {/* ── Drawer backdrop ── */}
      {drawerOpen && (
        <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>
      )}

      {/* ── Drawer panel ── */}
      <Animated.View style={[styles.drawer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }, drawerStyle]}>
        <Text style={styles.drawerBrand}>CLASH{'\n'}OF CAMPS</Text>
        <View style={styles.drawerDivider} />

        {session ? (
          <>
            <Text style={styles.drawerCampName}>{session.campName}</Text>
            <Text style={styles.drawerCampAddress}>{session.address}</Text>
            <View style={styles.drawerDivider} />
            <DrawerItem label="Add an event"  onPress={() => navigate('/events/new')} />
            <View style={styles.drawerDivider} />
            <DrawerItem label="Log out"        onPress={() => { closeDrawer(); setTimeout(logout, 280); }} />
            <DrawerItem label="Delete camp"    onPress={() => { closeDrawer(); setTimeout(confirmDeleteCamp, 280); }} destructive />
          </>
        ) : (
          <>
            <DrawerItem label="Register your camp" onPress={() => navigate('/welcome')} />
            <DrawerItem label="Log in"              onPress={() => navigate('/login')}   />
          </>
        )}
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text variant="caption" style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

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
  badgeZone: { fontSize: 18, color: Colors.text, marginBottom: 1 },
  badgeSub:  { color: Colors.textSecondary, letterSpacing: 0.3 },

  // ── Legend ──
  legend:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, paddingHorizontal: 16 },
  legendRow:  { flexDirection: 'row', gap: 16, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch:     { width: 10, height: 10, borderRadius: 2 },
  legendLabel:{ color: Colors.textSecondary },
  legendCount:{ color: Colors.textSecondary, letterSpacing: 0.2 },

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
  drawerCampAddress: { fontFamily: 'Oswald_400Regular', fontSize: 13, color: Colors.textSecondary, letterSpacing: 0.5, marginBottom: 20 },
  drawerItem:        { paddingVertical: 14 },
  drawerItemPressed: { opacity: 0.5 },
  drawerItemText:        { fontFamily: 'Oswald_400Regular', fontSize: 18, color: Colors.text, letterSpacing: 0.5 },
  drawerItemDestructive: { color: '#B01020' },
});
