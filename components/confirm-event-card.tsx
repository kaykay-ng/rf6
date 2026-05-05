import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { Icon } from './icon';

interface ConfirmEventCardProps {
  campName: string;
  campAddress: string;
  eventName: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  maxCapacity?: number;
  registeredCount?: number;
}

export function ConfirmEventCard({
  campName,
  campAddress,
  eventName,
  description,
  date,
  time,
  location,
  maxCapacity,
  registeredCount,
}: ConfirmEventCardProps) {
  // Parse date for display
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Spots left calculation
  const capacity = maxCapacity || 40;
  const registered = registeredCount || 0;
  const spotsLeft = capacity - registered;

  return (
    <View style={styles.card}>
      {/* Spots left ribbon */}
      <View style={styles.ribbon}>
        <Text style={styles.ribbonText}>{spotsLeft}/{capacity}</Text>
        <Text style={styles.ribbonDescription}>spots left</Text>
      </View>

      {/* Orange title section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{eventName}</Text>
      </View>

      {/* Camp name header */}
      <View style={styles.header}>
        <Text style={styles.campName}>{campName} ⋅ {campAddress}</Text>
      </View>

      {/* Content section */}
      <View style={styles.content}>
        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          {/* Date detail */}
          <View style={styles.detailItem}>
            <Icon name="date" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{dateStr}</Text>
            </View>
          </View>

          {/* Time detail */}
          <View style={styles.detailItem}>
            <Icon name="time" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>
          </View>

          {/* Location detail */}
          <View style={styles.detailItem}>
            <Icon name="location" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>

          {/* Weather detail */}
          <View style={styles.detailItem}>
            <Icon name="weather" size={20} color={Colors.text} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Weather</Text>
              <Text style={styles.detailValue}>Sunny</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.white,
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  ribbon: {
    position: 'absolute',
    top: 0,
    right: 30,
    zIndex: 10,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  ribbonText: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  ribbonDescription: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  header: {
    paddingHorizontal: 16,
  },
  campName: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  
  titleSection: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 36,
    color: Colors.text,
    letterSpacing: 0,
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },

  description: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  detailsGrid: {
    flexDirection: 'row',
    paddingTop: 18,
    gap: 16,
    borderTopColor: Colors.accent,
    borderTopWidth: 1,
    borderStyle: 'dotted',
  },
  detailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  detailContent: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 16,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
    textAlign: 'center',
  },
  detailValue: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  capacityText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: 0.3,
  },
});
