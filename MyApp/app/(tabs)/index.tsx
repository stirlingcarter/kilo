import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, TextInput, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Concert {
  id: string;
  title: string;
  date: string;
  venue: string;
  location: string;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  // Debounce search text with 300ms delay
  const debouncedSearchText = useDebounce(searchText, 300);

  const searchEvents = useCallback(async (query: string) => {
    if (!query.trim()) {
      setConcerts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://3.146.46.120/events/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response to match our Concert interface
      // API returns: { hits: [...], estimatedTotalHits: number, ... }
      const transformedConcerts: Concert[] = data.hits.map((event: any, index: number) => ({
        id: event.id || `event-${index}`,
        title: event.artists?.[0] || event.name || 'Unknown Artist',
        date: event.date ? new Date(event.date).toLocaleDateString() : 'TBD',
        venue: event.venue || 'Unknown Venue',
        location: event.city || 'Unknown Location',
      }));

      setConcerts(transformedConcerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search events');
      setConcerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to trigger API call when debounced search text changes
  useEffect(() => {
    searchEvents(debouncedSearchText);
  }, [debouncedSearchText, searchEvents]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const renderConcertItem = ({ item }: { item: Concert }) => (
    <TouchableOpacity style={[styles.concertItem, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border }]}>
      <View style={styles.concertHeader}>
        <ThemedText type="defaultSemiBold" style={styles.concertTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.concertDate, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
          {item.date}
        </ThemedText>
      </View>
      <ThemedText style={[styles.concertVenue, { color: Colors[colorScheme ?? 'light'].tint }]}>
        {item.venue}
      </ThemedText>
      <ThemedText style={[styles.concertLocation, { color: Colors[colorScheme ?? 'light'].tertiaryText }]}>
        {item.location}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
            Searching events...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
            Error: {error}
          </ThemedText>
        </View>
      );
    }

    if (searchText.trim() && concerts.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
            No events found for "{searchText}"
          </ThemedText>
        </View>
      );
    }

    if (!searchText.trim()) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
            Start typing to search for events...
          </ThemedText>
        </View>
      );
    }

    return null;
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchBar,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              borderColor: Colors[colorScheme ?? 'light'].border,
              color: Colors[colorScheme ?? 'light'].text,
            },
          ]}
          placeholder="Search concerts, artists, venues..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].secondaryText}
          value={searchText}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <FlatList
        data={concerts}
        renderItem={renderConcertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.concertList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    paddingVertical: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  concertList: {
    gap: 12,
  },
  concertItem: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  concertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  concertTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  concertDate: {
    fontSize: 14,
  },
  concertVenue: {
    fontSize: 14,
    marginBottom: 4,
  },
  concertLocation: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
});
