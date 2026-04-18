import { Image, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { type Camp } from './common-ground-map';

type Props = {
  zoneId: string;
  camps: Camp[];
};

export function ZoneHoverCard({ zoneId, camps }: Props) {
  const sorted = [...camps].sort((a, b) => {
    const slotA = parseInt(a.address.split('-')[1] ?? '0', 10);
    const slotB = parseInt(b.address.split('-')[1] ?? '0', 10);
    return slotA - slotB;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.zoneLabel}>{zoneId}</Text>
      <View style={styles.campList}>
        {sorted.map((camp) => {
          const slot = camp.address.split('-')[1] ?? '?';
          return (
            <View key={camp.id} style={styles.campRow}>
              <View style={styles.flagThumb}>
                {camp.imageUri ? (
                  <Image source={{ uri: camp.imageUri }} style={styles.flagImg} resizeMode="cover" />
                ) : (
                  <View style={styles.flagPlaceholder} />
                )}
              </View>
              <Text style={styles.campName} numberOfLines={1}>{camp.name}</Text>
              <Text style={styles.slotNum}>#{slot}</Text>
            </View>
          );
        })}
        {sorted.length === 0 && (
          <Text style={styles.emptyText}>No camps yet</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 72,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    minWidth: 180,
    maxWidth: 220,
  },
  zoneLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 20,
    letterSpacing: 1,
    color: Colors.text,
    marginBottom: 10,
  },
  campList: { gap: 8 },
  campRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flagThumb: { width: 20, height: 20, borderRadius: 3, overflow: 'hidden', backgroundColor: Colors.surface, flexShrink: 0 },
  flagImg: { width: 20, height: 20 },
  flagPlaceholder: { width: 20, height: 20, backgroundColor: Colors.accent, borderRadius: 3 },
  campName: { flex: 1, fontFamily: 'Oswald_400Regular', fontSize: 13, color: Colors.text, letterSpacing: 0.3 },
  slotNum: { fontFamily: 'Oswald_400Regular', fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.3 },
  emptyText: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
});