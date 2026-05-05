import { Colors } from '@/constants/theme';
import {
  CAMP_BS,
  CAMP_COLS,
  CAMP_CS,
  CAMP_ROWS,
  type CampZone,
  parseAddress,
  ZONE_H,
  ZONE_W
} from '@/data/grid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { G, Path, Polyline, Rect as SvgRect, Text as SvgText } from 'react-native-svg';
import { CampOverlay } from './camp-overlay';

const VIEW_WIDTH   = 680;
const VIEW_HEIGHT  = 560;
const MIN_SCALE    = 0.8;
const MAX_SCALE    = 4;
const INITIAL_SCALE  = 1.6;
// Pixels to shift the map content right/down at startup so the green camping
// zone (center of the map) is visible at 150% zoom instead of the top-left corner.
const INITIAL_OFFSET_X = -100;
const INITIAL_OFFSET_Y = 250;
// Browser DevTools touch simulation reports much larger e.scale deltas than
// real native touch — use a lower dampen value on web to compensate.
const PINCH_DAMPEN = Platform.OS === 'web' ? 0.32 : 0.25;

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
  imageUri?: string;
};

type Props = {
  camps: Camp[];
  zones: CampZone[];
  liveEventSlots?: Set<string>;
  eventColors?: Record<string, string>; // address → dot color
  containerWidth?: number; // pass when inside a narrower container; falls back to useWindowDimensions
  onSelectCamp: (camp: Camp) => void;
  onDismiss: () => void;
  onZoneChange?: (zoneId: string | null) => void;
  onHoverZone?: (zoneId: string | null) => void;
};

function clamp(v: number, lo: number, hi: number) { 'worklet'; return Math.min(Math.max(v, lo), hi); }
function clampTx(tx: number, sc: number, w: number, ox: number) { 'worklet'; return clamp(tx, -(ox + w*(sc-1)/2), ox + w*(sc-1)/2); }
function clampTy(ty: number, sc: number, h: number, oy: number) { 'worklet'; return clamp(ty, -(oy + h*(sc-1)/2), oy + h*(sc-1)/2); }

export function CommonGroundMap({ camps, zones, liveEventSlots, eventColors, containerWidth, onSelectCamp, onDismiss, onZoneChange, onHoverZone }: Props) {
  const windowWidth = useWindowDimensions().width;
  const width = containerWidth ?? windowWidth;

  // containerHeight drives baseScale. Start with a width-based estimate;
  // onLayout corrects it once the container is measured.
  const [containerHeight, setContainerHeight] = useState(() =>
    VIEW_HEIGHT * (width / VIEW_WIDTH)
  );

  const overflowX    = useSharedValue(0);
  const overflowY    = useSharedValue(0);
  const shContainerH = useSharedValue(containerHeight);

  const baseScale = useMemo(() => {
    const ws = width / VIEW_WIDTH;
    const hs = containerHeight / VIEW_HEIGHT;
    return Math.max(ws, hs);
  }, [width, containerHeight]);

  const svgW = VIEW_WIDTH  * baseScale;
  const svgH = VIEW_HEIGHT * baseScale;

  useEffect(() => {
    overflowX.value    = Math.max(0, (svgW - width) / 2);
    overflowY.value    = Math.max(0, (svgH - containerHeight) / 2);
    shContainerH.value = containerHeight;
  }, [svgW, svgH, width, containerHeight]);

  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const [overCamp, setOverCamp] = useState(false);

  const scale      = useSharedValue(INITIAL_SCALE);
  const translateX = useSharedValue(INITIAL_OFFSET_X);
  const translateY = useSharedValue(INITIAL_OFFSET_Y);
  const savedScale = useSharedValue(INITIAL_SCALE);
  const savedX     = useSharedValue(0);
  const savedY     = useSharedValue(0);
  const pinchFX    = useSharedValue(0);
  const pinchFY    = useSharedValue(0);
  const pinchTx    = useSharedValue(0);
  const pinchTy    = useSharedValue(0);
  const lastMove   = useRef(0);

  const campsByAddress = useMemo(() => {
    const map = new Map<string, Camp>();
    for (const camp of camps) map.set(camp.address, camp);
    return map;
  }, [camps]);

  const campsByZone = useMemo(() => {
    const map = new Map<string, Camp[]>();
    for (const camp of camps) {
      const parsed = parseAddress(camp.address);
      if (!parsed) continue;
      const list = map.get(parsed.zoneId) ?? [];
      map.set(parsed.zoneId, [...list, camp]);
    }
    return map;
  }, [camps]);

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

  // ── Camp hit test — returns camp address or null ────────────────────────
  const findCampAt = useCallback(
    (svgX: number, svgY: number): string | null => {
      const zone = findZoneAt(svgX, svgY);
      if (!zone) return null;

      const zoneCamps = campsByZone.get(zone.id);
      if (!zoneCamps || zoneCamps.length === 0) return null;

      const n = zoneCamps.length;
      const cols = Math.min(n, 5);
      const rows = Math.ceil(n / cols);
      const cellW = ZONE_W - 4;
      const cellH = ZONE_H - 6;
      const colW = cellW / cols;
      const rowH = cellH / rows;

      for (let campIdx = 0; campIdx < zoneCamps.length; campIdx++) {
        const col = campIdx % cols;
        const row = Math.floor(campIdx / cols);
        const dotSize = Math.max(4, (CAMP_BS - 1) + (10 - n) * 0.4);
        const hitRadius = dotSize / 2 + 2.5;
        const campX = zone.x + 2 + col * colW + colW / 2;
        const campY = zone.y + 2 + row * rowH + rowH / 2;
        const dist = Math.sqrt((svgX - campX) ** 2 + (svgY - campY) ** 2);
        if (dist <= hitRadius) {
          return zoneCamps[campIdx].address;
        }
      }
      return null;
    },
    [findZoneAt, campsByZone],
  );

  // Anchor point of the Animated.View in container coords.
  // With marginLeft: -(svgW-width)/2 the view is centered, so anchor = (width/2, svgH/2).
  // Correct inverse: svgX = VIEW_WIDTH/2 + (screenX - tx - cx) / (baseScale * sc)
  // (The old cx*(sc-1) form only holds when svgW === width — not true on mobile.)
  const cx = width / 2;
  const cy = svgH / 2;
  const screenToSvg = (screenX: number, screenY: number, tx: number, ty: number, sc: number) => ({
    svgX: VIEW_WIDTH  / 2 + (screenX - tx - cx) / (baseScale * sc),
    svgY: VIEW_HEIGHT / 2 + (screenY - ty - cy) / (baseScale * sc),
  });

  // ── Tap handler (native + web) ────────────────────────────────────────────
  // Not memoized — must capture the current baseScale/cy from screenToSvg on
  // every render so coordinate mapping stays correct after onLayout updates them.
  function handleTap(screenX: number, screenY: number, tx: number, ty: number, sc: number) {
    const { svgX, svgY } = screenToSvg(screenX, screenY, tx, ty, sc);
    const zone = findZoneAt(svgX, svgY);
    if (!zone) { onZoneChange?.(null); onDismiss(); return; }
    onZoneChange?.(zone.id);
    const campAddr = findCampAt(svgX, svgY);
    const camp = campAddr ? campsByAddress.get(campAddr) : undefined;
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
    onHoverZone?.(id);
    const campAddr = findCampAt(svgX, svgY);
    setOverCamp(campAddr ? campsByAddress.has(campAddr) : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findZoneAt, findCampAt, onZoneChange]);

  const handleMouseLeave = useCallback(() => {
    setOverCamp(false);
    setHoveredZoneId(null);
    onZoneChange?.(null);
    onHoverZone?.(null);
  }, [onZoneChange, onHoverZone]);

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
          { width, flex: 1 },
          Platform.OS === 'web' ? ({ touchAction: 'none', overflow: 'hidden', cursor: overCamp ? 'pointer' : 'default' } as any) : null,
        ]}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          shContainerH.value = h;
          setContainerHeight(h);
        }}
        {...(Platform.OS === 'web' ? { onWheel: handleWheel, onClick: handleClick, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave } : {})}
      >
      <Animated.View
        style={[{ width: svgW, height: svgH, marginLeft: -(svgW - width) / 2 }, animStyle]}
      >
        <Svg width={svgW} height={svgH} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>

          {/* Base layer */}
          <SvgRect width={VIEW_WIDTH} height={VIEW_HEIGHT} fill={Colors.background} />
          <Path d={PATHS.boundary} fill="#d8d8da" />
          <Path d={PATHS.campZone} fill="#4a9458" />

          {/* Roads — drawn before zones so camp boxes render on top */}
          <Polyline points={PATHS.road1} fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={PATHS.road2} fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <Path     d={PATHS.trail}      fill="none" stroke="#fff" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={PATHS.road1} fill="none" stroke="#ccc" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Polyline points={PATHS.road2} fill="none" stroke="#ccc" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path     d={PATHS.trail}      fill="none" stroke="#ccc" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

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

                {/* Dynamic camp slots — only occupied slots, spread within cell */}
                {campsByZone.get(zone.id)?.map((camp, campIdx) => {
                  const zoneCamps = campsByZone.get(zone.id)!;
                  const n = zoneCamps.length;
                  const cols = Math.min(n, 5);
                  const rows = Math.ceil(n / cols);
                  const col = campIdx % cols;
                  const row = Math.floor(campIdx / cols);
                  const cellW = ZONE_W - 4;
                  const cellH = ZONE_H - 6;
                  const colW = cellW / cols;
                  const rowH = cellH / rows;
                  const dotSize = Math.max(4, (CAMP_BS - 1) + (10 - n) * 0.4);
                  const x = zone.x + 2 + col * colW + colW / 2 - dotSize / 2;
                  const y = zone.y + 2 + row * rowH + rowH / 2 - dotSize / 2;
                  const isLiveSlot = liveEventSlots?.has(camp.address) ?? false;
                  const slotFill = eventColors?.[camp.address] ?? '#E8252A';
                  const slotStroke = eventColors?.[camp.address] ? 'transparent' : '#C01020';
                  return (
                    <SvgRect
                      key={camp.address}
                      x={x} y={y}
                      width={dotSize} height={dotSize}
                      rx={isLiveSlot ? dotSize / 2 : 1}
                      fill={slotFill}
                      stroke={slotStroke}
                      strokeWidth={0.4}
                    />
                  );
                })}

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


        </Svg>

        {/* Overlay layer — camp flags, moves with pan/zoom */}
        {camps.filter(c => c.imageUri).map((camp) => {
          const zone = zones.find(z => z.id === camp.address.split('-')[0]);
          if (!zone) return null;
          const zoneCamps = campsByZone.get(zone.id) ?? [];
          const campIdx = zoneCamps.findIndex(c => c.address === camp.address);
          if (campIdx === -1) return null;
          const n = zoneCamps.length;
          const cols = Math.min(n, 5);
          const rows = Math.ceil(n / cols);
          const col = campIdx % cols;
          const row = Math.floor(campIdx / cols);
          const cellW = ZONE_W - 4;
          const cellH = ZONE_H - 6;
          const colW = cellW / cols;
          const rowH = cellH / rows;
          const dotX = zone.x + 2 + col * colW + colW / 2;
          const dotY = zone.y + 2 + row * rowH + rowH / 2;
          const absX = dotX * baseScale;
          const absY = dotY * baseScale;
          const overlaySize = Math.max(16, 18 * baseScale);
          return (
            <CampOverlay
              key={camp.address}
              imageUri={camp.imageUri}
              x={absX - overlaySize / 2}
              y={absY - overlaySize / 2}
              scale={baseScale}
            />
          );
        })}

      </Animated.View>
      </View>
    </GestureDetector>
  );
}
