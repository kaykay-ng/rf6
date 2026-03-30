import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useWindowDimensions, Platform, View } from 'react-native';
import Svg, { Path, Polyline, Rect as SvgRect, Text as SvgText, G } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import {
  type CampZone,
  parseAddress,
  ZONE_W, ZONE_H, CAMP_BS, CAMP_CS, CAMP_COLS, CAMP_ROWS, CAMPS_PER_ZONE,
} from '@/data/grid';

const VIEW_WIDTH   = 680;
const VIEW_HEIGHT  = 560;
const MIN_SCALE    = 0.8;
const MAX_SCALE    = 4;
const PINCH_DAMPEN = 0.25;

// Visual colours — match HTML prototype
const COLORS = {
  NW: { bg: '#2d6838', bgStroke: '#1e5028', slot: '#4aaa52', slotStroke: '#2e8038' },
  SE: { bg: '#3a8040', bgStroke: '#286030', slot: '#5cb862', slotStroke: '#3a9040' },
  occupied:  { slot: Colors.accent, slotStroke: Colors.accentDark },
  hoverBg:   'rgba(0,0,0,0.18)',
} as const;

const PATHS = {
  boundary:  'M581,48 L573,119 L535,427 L414,386 L337,302 L209,263 L204,96 L223,98 L225,31 L424,27 Z',
  campZone:  'M380,324 L416,242 L473,200 L562,198 L572,125 L571,114 L507,74 L472,30 L421,24 L250,27 L223,210 L234,221 Z',
  zoneOutline: 'M380,324 L416,242 L473,200 L562,198 L572,125 L571,114 L507,74 L472,30 L421,24 L250,27 L223,210 L234,221 Z',
  road1:  '101,25 424,20 589,42 531,540',
  road2:  '20,251 126,269 177,262 332,308 411,392 543,438',
  trail:  'M579,119 C414,117 392,123 318,195 C291,210 264,225 231,230',
};

export type Camp = {
  id: string;
  name: string;
  address: string; // e.g. 'C5-3' — zone C5, slot 3
  vibes: string[];
  bio: string;
};

type Props = {
  camps: Camp[];
  zones: CampZone[];
  activeCampAddresses?: Set<string>;
  onSelectCamp: (camp: Camp) => void;
  onDismiss: () => void;
  onZoneChange?: (zoneId: string | null) => void;
};

function clamp(v: number, lo: number, hi: number) { 'worklet'; return Math.min(Math.max(v, lo), hi); }
function clampTx(tx: number, sc: number, w: number, ox: number) { 'worklet'; return clamp(tx, -(ox + w*(sc-1)/2), ox + w*(sc-1)/2); }
function clampTy(ty: number, sc: number, h: number, oy: number) { 'worklet'; return clamp(ty, -(oy + h*(sc-1)/2), oy + h*(sc-1)/2); }

export function CommonGroundMap({ camps, zones, activeCampAddresses, onSelectCamp, onDismiss, onZoneChange }: Props) {
  const { width } = useWindowDimensions();

  // On mobile, measure the actual container height and scale the map to fill it.
  // On web, keep width-based scaling (desktop experience is already good).
  const [containerHeight, setContainerHeight] = useState(() => VIEW_HEIGHT * (width / VIEW_WIDTH));

  const baseScale = useMemo(() => {
    const ws = width / VIEW_WIDTH;
    if (Platform.OS === 'web') return ws;
    return Math.max(ws, containerHeight / VIEW_HEIGHT);
  }, [width, containerHeight]);

  const svgW = VIEW_WIDTH  * baseScale;
  const svgH = VIEW_HEIGHT * baseScale;

  // How much the scaled SVG overflows the container on each axis (at scale=1).
  // Allows panning to see the overflowing edges even before the user zooms in.
  const overflowX    = useSharedValue(0);
  const overflowY    = useSharedValue(0);
  // Shared so pinch/pan worklets always read the live value after onLayout.
  const shContainerH = useSharedValue(VIEW_HEIGHT * (width / VIEW_WIDTH));

  useEffect(() => {
    overflowX.value    = Math.max(0, (svgW - width) / 2);
    overflowY.value    = Math.max(0, (svgH - containerHeight) / 2);
    shContainerH.value = containerHeight;
  }, [svgW, svgH, width, containerHeight]);

  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [overCamp, setOverCamp] = useState(false);

  const scale      = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedX     = useSharedValue(0);
  const savedY     = useSharedValue(0);
  const pinchFX    = useSharedValue(0);
  const pinchFY    = useSharedValue(0);
  const pinchTx    = useSharedValue(0);
  const pinchTy    = useSharedValue(0);
  const lastMove   = useRef(0);

  // ── Lookup maps ───────────────────────────────────────────────────────────
  const campsByAddress = new Map<string, Camp>();
  const campsByZone    = new Map<string, Camp[]>();
  for (const camp of camps) {
    campsByAddress.set(camp.address, camp);
    const parsed = parseAddress(camp.address);
    if (parsed) {
      const list = campsByZone.get(parsed.zoneId) ?? [];
      campsByZone.set(parsed.zoneId, [...list, camp]);
    }
  }

  // ── Zone hit test ─────────────────────────────────────────────────────────
  const findZoneAt = useCallback(
    (svgX: number, svgY: number): CampZone | null => {
      for (const z of zones) {
        if (svgX >= z.x && svgX < z.x + ZONE_W && svgY >= z.y && svgY < z.y + ZONE_H)
          return z;
      }
      return null;
    },
    [zones],
  );

  // ── Slot hit test — returns e.g. 'C5-3' or null ───────────────────────────
  const findSlotAt = useCallback(
    (svgX: number, svgY: number): string | null => {
      const zone = findZoneAt(svgX, svgY);
      if (!zone) return null;
      const col = Math.floor((svgX - zone.x) / CAMP_CS);
      const row = Math.floor((svgY - zone.y) / CAMP_CS);
      if (col < 0 || col >= CAMP_COLS || row < 0 || row >= CAMP_ROWS) return null;
      const slotNum = row * CAMP_COLS + col + 1;
      return `${zone.id}-${slotNum}`;
    },
    [findZoneAt],
  );

  // Center-origin: screen_x = tx + cx*(1-sc) + sc*x  →  x = (screen_x - tx + cx*(sc-1)) / sc
  const cx = width / 2;
  const cy = containerHeight / 2;
  const screenToSvg = (screenX: number, screenY: number, tx: number, ty: number, sc: number) => ({
    svgX: (screenX - tx + cx * (sc - 1)) / (baseScale * sc),
    svgY: (screenY - ty + cy * (sc - 1)) / (baseScale * sc),
  });

  // ── Tap handler (native + web) ────────────────────────────────────────────
  // Not memoized — must capture the current baseScale/cy from screenToSvg on
  // every render so coordinate mapping stays correct after onLayout updates them.
  function handleTap(screenX: number, screenY: number, tx: number, ty: number, sc: number) {
    const { svgX, svgY } = screenToSvg(screenX, screenY, tx, ty, sc);
    const zone = findZoneAt(svgX, svgY);
    if (!zone) { onZoneChange?.(null); onDismiss(); return; }
    onZoneChange?.(zone.id);
    const slotAddr = findSlotAt(svgX, svgY);
    const camp = slotAddr ? campsByAddress.get(slotAddr) : undefined;
    if (camp) onSelectCamp(camp);
    else onDismiss();
  }

  // ── Web handlers ──────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: any) => {
    e.preventDefault();
    const delta    = e.deltaY < 0 ? 1.1 : 0.91;
    const newScale = clamp(scale.value * delta, MIN_SCALE, MAX_SCALE);
    const rect     = e.currentTarget.getBoundingClientRect();
    const fx = e.clientX - rect.left - cx, fy = e.clientY - rect.top - cy;
    const ratio = newScale / scale.value;
    translateX.value = clampTx(fx + (translateX.value - fx) * ratio, newScale, width, 0);
    translateY.value = clampTy(fy + (translateY.value - fy) * ratio, newScale, svgH, 0);
    scale.value = newScale; savedScale.value = newScale;
    savedX.value = translateX.value; savedY.value = translateY.value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback((e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleTap(e.clientX - rect.left, e.clientY - rect.top, translateX.value, translateY.value, scale.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleTap]);

  const handleMouseMove = useCallback((e: any) => {
    const now = Date.now();
    if (now - lastMove.current < 40) return;
    lastMove.current = now;
    const rect = e.currentTarget.getBoundingClientRect();
    const { svgX, svgY } = screenToSvg(
      e.clientX - rect.left, e.clientY - rect.top,
      translateX.value, translateY.value, scale.value,
    );
    const zone = findZoneAt(svgX, svgY);
    const id = zone?.id ?? null;
    setHoveredZoneId(id);
    onZoneChange?.(id);
    const slotAddr = findSlotAt(svgX, svgY);
    setOverCamp(slotAddr ? campsByAddress.has(slotAddr) : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findZoneAt, findSlotAt, onZoneChange]);

  // ── Gestures ──────────────────────────────────────────────────────────────
  const pan = Gesture.Pan()
    .minPointers(1).maxPointers(1)
    .onStart(() => { savedX.value = translateX.value; savedY.value = translateY.value; })
    .onUpdate((e) => {
      translateX.value = clampTx(savedX.value + e.translationX, scale.value, width, overflowX.value);
      translateY.value = clampTy(savedY.value + e.translationY, scale.value, shContainerH.value, overflowY.value);
    })
    .onEnd((e) => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
      // Treat as tap if finger barely moved
      if (Math.abs(e.translationX) < 8 && Math.abs(e.translationY) < 8) {
        runOnJS(handleTap)(e.x, e.y, translateX.value, translateY.value, scale.value);
      }
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      savedScale.value = scale.value;
      pinchFX.value = e.focalX; pinchFY.value = e.focalY;
      pinchTx.value = translateX.value; pinchTy.value = translateY.value;
    })
    .onUpdate((e) => {
      const ns = clamp(savedScale.value * (1 + (e.scale - 1) * PINCH_DAMPEN), MIN_SCALE, MAX_SCALE);
      scale.value = ns;
      const r = ns / savedScale.value;
      const pfx = pinchFX.value - width / 2, pfy = pinchFY.value - shContainerH.value / 2;
      translateX.value = clampTx(pfx + (pinchTx.value - pfx) * r, ns, width, overflowX.value);
      translateY.value = clampTy(pfy + (pinchTy.value - pfy) * r, ns, shContainerH.value, overflowY.value);
    })
    .onEnd(() => { savedScale.value = scale.value; savedX.value = translateX.value; savedY.value = translateY.value; });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[
          Platform.OS === 'web'
            ? { width, height: svgH }
            : { width, flex: 1 },
          Platform.OS === 'web' ? ({ touchAction: 'none', overflow: 'hidden', cursor: overCamp ? 'pointer' : 'default' } as any) : null,
        ]}
        onLayout={Platform.OS !== 'web' ? (e) => {
          const h = e.nativeEvent.layout.height;
          shContainerH.value = h;
          setContainerHeight(h);
        } : undefined}
        {...(Platform.OS === 'web' ? { onWheel: handleWheel, onClick: handleClick, onMouseMove: handleMouseMove } : {})}
      >
      <Animated.View
        style={[{ width: svgW, height: svgH }, animStyle]}
      >
        <Svg width={svgW} height={svgH} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>

          {/* Base layer */}
          <SvgRect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={Colors.background} />
          <Path d={PATHS.boundary} fill="#d8d8da" />
          <Path d={PATHS.campZone} fill="#4a9458" />

          {/* ── Zone groups ──────────────────────────────────────────────── */}
          {zones.map((zone) => {
            const c      = COLORS[zone.zoneType];
            const hovered = hoveredZoneId === zone.id;
            const hasCamps = campsByZone.has(zone.id);

            return (
              <G key={zone.id} opacity={hovered ? 0.72 : 1}>
                {/* Zone background */}
                <SvgRect
                  x={zone.x} y={zone.y}
                  width={ZONE_W} height={ZONE_H}
                  rx={2}
                  fill={hasCamps ? Colors.accent : c.bg}
                  stroke={hasCamps ? Colors.accentDark : c.bgStroke}
                  strokeWidth={0.5}
                />

                {/* 10 camp slots in a 5×2 grid */}
                {Array.from({ length: CAMP_ROWS }, (_, row) =>
                  Array.from({ length: CAMP_COLS }, (_, col) => {
                    const slotNum  = row * CAMP_COLS + col + 1;
                    const slotAddr = `${zone.id}-${slotNum}`;
                    const occupied = campsByAddress.has(slotAddr);
                    const active   = occupied && (activeCampAddresses?.has(slotAddr) ?? false);
                    const slotFill = active ? '#E8252A' : occupied ? Colors.white : c.slot;
                    const slotStroke = active ? '#C01020' : occupied ? Colors.white : c.slotStroke;
                    return (
                      <SvgRect
                        key={slotAddr}
                        x={zone.x + col * CAMP_CS + 0.5}
                        y={zone.y + row * CAMP_CS + 0.5}
                        width={CAMP_BS - 1} height={CAMP_BS - 1}
                        rx={1}
                        fill={slotFill}
                        stroke={slotStroke}
                        strokeWidth={0.4}
                      />
                    );
                  })
                )}

                {/* Zone ID label */}
                <SvgText
                  x={zone.x + ZONE_W / 2}
                  y={zone.y + ZONE_H - 1}
                  fontSize={5} fontWeight="600"
                  fontFamily="Oswald_700Bold, Oswald, ui-sans-serif, system-ui, sans-serif"
                  fill={hasCamps ? 'rgba(255,255,255,0.9)' : '#c8f0c8'}
                  textAnchor="middle"
                >
                  {zone.id}
                </SvgText>
              </G>
            );
          })}

          {/* Zone boundary outline */}
          <Path d={PATHS.zoneOutline} fill="none" stroke="#2d6838" strokeWidth={0.8} />

          {/* Roads — drawn on top */}
          <Polyline points={PATHS.road1} fill="none" stroke="#fff"    strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={PATHS.road2} fill="none" stroke="#fff"    strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <Path     d={PATHS.trail}      fill="none" stroke="#fff"    strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={PATHS.road1} fill="none" stroke="#ccc"    strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={PATHS.road2} fill="none" stroke="#ccc"    strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path     d={PATHS.trail}      fill="none" stroke="#ccc"    strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Zone labels NW / SE */}
          <SvgText x={295} y={90}  fontSize={10} fontWeight="600" fontFamily="Oswald_700Bold, Oswald, ui-sans-serif, system-ui, sans-serif" fill="#1a4a25" textAnchor="middle">Northwest</SvgText>
          <SvgText x={480} y={310} fontSize={10} fontWeight="600" fontFamily="Oswald_700Bold, Oswald, ui-sans-serif, system-ui, sans-serif" fill="#1a4a25" textAnchor="middle">Southeast</SvgText>

        </Svg>
      </Animated.View>
      </View>
    </GestureDetector>
  );
}
