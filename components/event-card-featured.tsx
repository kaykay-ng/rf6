import { Text } from '@/components/ui/text';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { CampEvent } from './event-card';

type Props = {
  event: CampEvent;
  campName: string;
  currentCapacity?: number;
  isLive?: boolean;
  onPress?: () => void;
};

export function EventCardFeatured({
  event,
  campName,
  currentCapacity = 0,
  isLive = false,
  onPress,
}: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = width * 0.3;

  const timeStr = event.time ? event.time.slice(0, 5) : '—';
  const locationLabel = event.location_type === 'our_camp'
    ? 'Camp'
    : event.location_type === 'other'
    ? event.location_name || 'Other location'
    : event.location_type === 'nearby'
    ? 'Nearby'
    : 'TBD';
  const totalCapacity = event.max_capacity || 8;
  const capacityPercent = (currentCapacity / totalCapacity) * 100;

  // Format date relative to today
  const today = new Date().toISOString().split('T')[0];
  const timeLabel = event.date === today ? 'Today' : event.date;

  // Mock weather data for Roskilde Festival (late June)
  const getWeatherForDate = (date: string) => {
    // Create a simple hash from the date to generate "random" but consistent weather
    const dateNum = parseInt(date.split('-')[2]);
    const weatherCycle = dateNum % 5;

    const weatherOptions = [
      { emoji: '☀️', condition: 'Sunny', temp: 21, advice: 'Sunscreen & hat' },
      { emoji: '⛅', condition: 'Partly cloudy', temp: 18, advice: 'Light jacket' },
      { emoji: '☁️', condition: 'Cloudy', temp: 16, advice: 'Sweater' },
      { emoji: '🌧️', condition: 'Rainy', temp: 15, advice: 'Rain jacket' },
      { emoji: '🌤️', condition: 'Mostly sunny', temp: 20, advice: 'Sunscreen' },
    ];
    return weatherOptions[weatherCycle];
  };

  const weather = getWeatherForDate(event.date);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {/* Decorative accent shape (simulated with gradient border) */}
      <View style={styles.accentCorner} />

      {/* Live indicator */}
      {isLive && (
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
      )}

      {/* Header: Camp badge */}
      <View style={styles.header}>
        <View style={styles.campBadge}>
          <View style={styles.campIcon} />
          <Text style={styles.campName}>{campName}</Text>
        </View>
      </View>

      {/* Event title */}
      <Text style={styles.title}>{event.name}</Text>

      {/* Description */}
      {event.description && (
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
      )}

      {/* Event details row */}
      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>
            {timeLabel} · {timeStr}
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>{locationLabel}</Text>
        </View>
      </View>

      {/* Weather section */}
      <View style={styles.weatherSection}>
        <Text style={styles.weatherEmoji}>{weather.emoji}</Text>
        <View style={styles.weatherInfo}>
          <Text style={styles.weatherCondition}>{weather.condition}</Text>
          <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
        </View>
        <Text style={styles.weatherAdvice}>{weather.advice}</Text>
      </View>

      {/* Capacity bar */}
      {event.max_capacity && (
        <View style={styles.capacitySection}>
          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                { width: `${Math.min(capacityPercent, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.capacityText}>
            {currentCapacity}/{totalCapacity} in
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.1)',
  },
  cardPressed: {
    opacity: 0.9,
  },

  // Decorative accent
  accentCorner: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    backgroundColor: '#FF6B35',
    borderRadius: 80,
    opacity: 0.15,
  },

  // Live indicator
  liveIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1,
  },

  // Header
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  campBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  campIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#FF6B35',
    borderRadius: 6,
  },
  campName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e8e8e8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
    letterSpacing: -0.5,
  },

  // Description
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#d0d0d0',
    marginBottom: 16,
  },

  // Details
  detailsRow: {
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 13,
    color: '#d0d0d0',
    fontWeight: '500',
  },

  // Weather
  weatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  weatherEmoji: {
    fontSize: 20,
  },
  weatherInfo: {
    flex: 1,
  },
  weatherCondition: {
    fontSize: 12,
    color: '#d0d0d0',
    fontWeight: '500',
  },
  weatherTemp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  weatherAdvice: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '600',
  },

  // Capacity
  capacitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capacityBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d0d0d0',
    minWidth: 45,
    textAlign: 'right',
  },
});
