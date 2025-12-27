import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getItems } from '@/services/itemService';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');

  const debouncedSearch = useDebounce(search, 400);
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'secondaryText');
  const backgroundColor = useThemeColor({}, 'background');

  // Auth Redirect
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.replace('/welcome');
    }
  }, [isAuthLoading, token]);

  const fetchItems = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const data = await getItems({ status: activeTab, search: debouncedSearch });
      setItems(data);
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems(true);
  }, [fetchItems]);

  const handleTabChange = useCallback((tab: 'lost' | 'found') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }, []);

  const ItemCard = useCallback(({ item, index }: { item: any, index: number }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.card, { backgroundColor: cardColor, borderColor }]}
        onPress={() => router.push(`/item/${item._id}`)}
      >
        <View style={styles.cardContent}>
          <View style={styles.textContainer}>
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.category, { color: tintColor }]}>{item.category}</ThemedText>
              <Ionicons
                name={item.status === 'lost' ? 'alert-circle' : 'search-circle'}
                size={18}
                color={item.status === 'lost' ? '#FF453A' : '#32D74B'}
              />
            </View>
            <ThemedText type="subtitle" style={styles.itemTitle} numberOfLines={1}>{item.title}</ThemedText>
            <ThemedText numberOfLines={2} style={[styles.description, { color: secondaryText }]}>{item.description}</ThemedText>
            <View style={styles.cardFooter}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={secondaryText} />
                <ThemedText style={[styles.location, { color: secondaryText }]} numberOfLines={1}>{item.location}</ThemedText>
              </View>
            </View>
          </View>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [cardColor, borderColor, tintColor, secondaryText, router]);

  const listHeader = useMemo(() => (
    <View style={styles.listHeader}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Discovery</ThemedText>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <View style={[styles.avatar, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.avatarText}>
              {user ? user.name.charAt(0).toUpperCase() : '?'}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBar, { backgroundColor: cardColor }]}>
        <Ionicons name="search" size={20} color={secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: useThemeColor({}, 'text') }]}
          placeholder="Search items..."
          placeholderTextColor={secondaryText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tab, activeTab === 'lost' ? { backgroundColor: tintColor } : { backgroundColor: cardColor }]}
          onPress={() => handleTabChange('lost')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'lost' ? styles.activeTabText : { color: secondaryText }]}>Lost</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.tab, activeTab === 'found' ? { backgroundColor: tintColor } : { backgroundColor: cardColor }]}
          onPress={() => handleTabChange('found')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'found' ? styles.activeTabText : { color: secondaryText }]}>Found</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  ), [user, search, activeTab, tintColor, cardColor, secondaryText]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlatList
          data={items}
          renderItem={ItemCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={listHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={tintColor} />
              </View>
            ) : (
              <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color={secondaryText} style={{ opacity: 0.5 }} />
                <ThemedText style={[styles.emptyText, { color: secondaryText }]}>No listings found yet</ThemedText>
              </Animated.View>
            )
          }
        />

        <Animated.View entering={FadeIn.delay(500)}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.fab, { backgroundColor: tintColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(tabs)/add');
            }}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeader: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 52,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  tabText: {
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFF',
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#F2F2F730',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  centerContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 80,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
