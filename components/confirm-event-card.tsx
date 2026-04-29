import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

interface ConfirmEventCardProps {
  campName: string;
  eventName: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  maxCapacity?: number;
}

export function ConfirmEventCard({
  campName,
  eventName,
  description,
  date,
  time,
  location,
  maxCapacity,
}: ConfirmEventCardProps) {
  // Parse date for display
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Mock capacity calculation (75% full for visual demo)
  const capacity = maxCapacity || 40;
  const progressPercent = 75;
  const spotsUsed = Math.round((progressPercent / 100) * capacity);
  const spotsLeft = capacity - spotsUsed;

  return (
    <View style={styles.card}>
      {/* Camp name header */}
      <View style={styles.header}>
        <Text style={styles.campName}>{campName}</Text>
      </View>

      {/* Orange title section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{eventName}</Text>
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
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>□</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{dateStr}</Text>
            </View>
          </View>

          {/* Time detail */}
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>◐</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{time}</Text>
            </View>
          </View>

          {/* Location detail */}
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>◆</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>
        </View>

        {/* Capacity section */}
        <View style={styles.capacitySection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.capacityText}>
            {spotsUsed}/{capacity} spots filled • {spotsLeft} left
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  campName: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  titleSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  title: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 32,
    color: Colors.text,
    letterSpacing: 0.5,
    lineHeight: 38,
  },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16,
  },

  description: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 13,
    color: '#AAAAAA',
    lineHeight: 19,
  },

  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontFamily: 'Barlow_700Bold',
    fontSize: 10,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },

  capacitySection: {
    marginTop: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  capacityText: {
    fontFamily: 'Oswald_400Regular',
    fontSize: 11,
    color: Colors.text,
    letterSpacing: 0.3,
  },
});
