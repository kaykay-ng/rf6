import { useState } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { CommonGroundMap, type Camp } from '@/components/common-ground-map';
import { ZONES } from '@/data/grid';
import { Colors } from '@/constants/theme';
import { Text } from '@/components/ui/text';

// Mock camps — address = 'C[zone]-[slot 1–10]'
const MOCK_CAMPS: Camp[] = [
  { id: '1', name: 'Camp Chaos',       address: 'C5-3',  vibes: ['Late night', 'High energy', 'Chaotic good'],          bio: 'We sleep when the festival ends. Until then, all are welcome.' },
  { id: '2', name: 'Morning Dew',      address: 'C18-1', vibes: ['Early risers', 'Morning yoga', 'Calm vibes'],          bio: 'Sunrise sessions and strong coffee. Newcomers welcome.' },
  { id: '3', name: 'Drum Circle',      address: 'C36-7', vibes: ['Acoustic jams', 'High energy', 'Dancing'],             bio: 'Bring an instrument. Or just your hands.' },
  { id: '4', name: 'The Kitchen',      address: 'C58-2', vibes: ['Cooking & food', 'Chill & slow', 'Newcomers welcome'], bio: 'We cook for ourselves and whoever shows up.' },
  { id: '5', name: 'Glitter Camp',     address: 'C80-5', vibes: ['Creative & crafts', 'Queer-friendly', 'Dancing'],      bio: 'Art, sparkle, and late-night fire.' },
  { id: '6', name: 'The Philosophers', address: 'C93-9', vibes: ['Chill & slow', 'Calm vibes', 'Early risers'],          bio: 'Big questions, cold coffee, slow mornings.' },
];

const SHEET_HIDDEN  = 300;
const DRAWER_WIDTH  = 280;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [activeZone, setActiveZone]     = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  // ── Bottom sheet ──────────────────────────────────────────────────────────
  const sheetOffset = useSharedValue(SHEET_HIDDEN);
  const sheetStyle  = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(sheetOffset.value, { damping: 48, stiffness: 320 }) }],
  }));

  function handleSelectCamp(camp: Camp) {
    setSelectedCamp(camp); setActiveZone(null); sheetOffset.value = 0;
  }
  function dismissSheet() {
    sheetOffset.value = SHEET_HIDDEN; setSelectedCamp(null);
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
        camps={MOCK_CAMPS}
        zones={ZONES}
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
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}>
        <View style={styles.sheetHandle} />
        {selectedCamp && (
          <>
            <Text variant="heading" style={styles.campName}>{selectedCamp.name}</Text>
            <Text variant="caption" style={styles.campAddress}>{selectedCamp.address}</Text>
            <View style={styles.vibes}>
              {selectedCamp.vibes.map((v) => (
                <View key={v} style={styles.vibe}>
                  <Text variant="caption" style={styles.vibeLabel}>{v}</Text>
                </View>
              ))}
            </View>
            <Text variant="body" style={styles.bio}>{selectedCamp.bio}</Text>
          </>
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

        <DrawerItem label="Register your camp" onPress={() => navigate('/welcome')} />
        <DrawerItem label="Log in"              onPress={() => navigate('/login')}   />
      </Animated.View>
    </View>
  );
}

function DrawerItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
      onPress={onPress}
    >
      <Text style={styles.drawerItemText}>{label}</Text>
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
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 12, paddingHorizontal: 24,
    shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 }, elevation: 16, minHeight: 260,
  },
  sheetHandle:  { width: 32, height: 3, backgroundColor: Colors.accent, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  campName:     { fontSize: 22, marginBottom: 2 },
  campAddress:  { color: Colors.textSecondary, marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  vibes:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  vibe:         { backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  vibeLabel:    { fontSize: 12, color: Colors.text },
  bio:          { color: Colors.textSecondary, lineHeight: 22 },

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
  drawerItem:        { paddingVertical: 14 },
  drawerItemPressed: { opacity: 0.5 },
  drawerItemText:    { fontFamily: 'Oswald_400Regular', fontSize: 18, color: Colors.text, letterSpacing: 0.5 },
});
