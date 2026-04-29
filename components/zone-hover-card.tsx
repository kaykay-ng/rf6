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
              <Text style={styles.campName}>{camp.name} #{slot}</Text>
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
    minWidth: 300,
    maxWidth: 380,
  },
  zoneLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 20,
    letterSpacing: 1,
    color: Colors.text,
    marginBottom: 12,
  },
  campList: { gap: 12 },
  campRow: { flexDirection: 'column', gap: 8 },
  flagThumb: { width: '100%', height: 100, borderRadius: 6, overflow: 'hidden', backgroundColor: Colors.surface },
  flagImg: { width: '100%', height: 100 },
  flagPlaceholder: { width: '100%', height: 100, backgroundColor: '#e0e0e0', borderRadius: 6 },
  campName: { fontFamily: 'Oswald_700Bold', fontSize: 15, color: Colors.text, letterSpacing: 0.3 },
  emptyText: { fontFamily: 'Oswald_400Regular', fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
});