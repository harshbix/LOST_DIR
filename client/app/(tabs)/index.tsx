import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getItems } from '@/services/itemService';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, Layout, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Skeleton } from '@/components/Skeleton';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'lost' | 'found'>('lost');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const categories = ['all', 'electronics', 'documents', 'keys', 'clothing', 'wallets', 'pets', 'others'];
  const sortOptions = [
    { label: t('search.mostRecent'), value: 'recent', icon: 'time-outline' },
    { label: t('search.oldestFirst'), value: 'oldest', icon: 'calendar-outline' },
    { label: t('search.az'), value: 'az', icon: 'text-outline' },
    { label: t('search.za'), value: 'za', icon: 'text-outline' },
  ];

  const debouncedSearch = useDebounce(search, 400);
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'secondaryText');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Auth Redirect
  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.replace('/welcome');
    }
  }, [isAuthLoading, token]);

  const fetchItems = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const params: any = {
        status: activeTab,
        search: debouncedSearch,
        sort: sortBy
      };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
      }
      const data = await getItems(params);
      setItems(data);
    } catch (error) {
      console.error('Fetch items error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, debouncedSearch, sortBy, selectedCategory]);

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
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search items..."
          placeholderTextColor={secondaryText}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat);
            }}
            style={[
              styles.categoryTab,
              selectedCategory === cat ? { backgroundColor: tintColor } : { backgroundColor: cardColor }
            ]}
          >
            <ThemedText style={[styles.categoryTabText, selectedCategory === cat ? styles.activeTabText : { color: secondaryText }]}>
              {t(`search.categories.${cat}`)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ height: 16 }} />


      <View style={styles.filterRow}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.miniTab, activeTab === 'lost' ? { backgroundColor: tintColor } : { backgroundColor: cardColor }]}
            onPress={() => handleTabChange('lost')}
          >
            <ThemedText style={[styles.miniTabText, activeTab === 'lost' ? styles.activeTabText : { color: secondaryText }]}>{t('tabs.lost')}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.miniTab, activeTab === 'found' ? { backgroundColor: tintColor } : { backgroundColor: cardColor }]}
            onPress={() => handleTabChange('found')}
          >
            <ThemedText style={[styles.miniTabText, activeTab === 'found' ? styles.activeTabText : { color: secondaryText }]}>{t('tabs.found')}</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: cardColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterModalVisible(true);
          }}
        >
          <Ionicons name="options-outline" size={20} color={tintColor} />
          <ThemedText style={styles.sortButtonText}>
            {sortOptions.find(o => o.value === sortBy)?.label}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  ), [user, search, activeTab, tintColor, cardColor, secondaryText, textColor]);

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
                {[1, 2, 3].map((i) => (
                  <View key={i} style={[styles.skeletonCard, { backgroundColor: cardColor, borderColor }]}>
                    <View style={styles.skeletonContent}>
                      <View style={{ flex: 1 }}>
                        <Skeleton width="40%" height={12} style={{ marginBottom: 12 }} />
                        <Skeleton width="80%" height={24} style={{ marginBottom: 12 }} />
                        <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
                        <Skeleton width="60%" height={16} />
                      </View>
                      <Skeleton width={96} height={96} borderRadius={16} />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color={secondaryText} style={{ opacity: 0.5 }} />
                <ThemedText style={[styles.emptyText, { color: secondaryText }]}>No listings found yet</ThemedText>
              </Animated.View>
            )
          }
          initialNumToRender={6}
          windowSize={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews={true}
        />

        <Modal
          visible={filterModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          >
            <Animated.View
              entering={FadeInDown}
              style={[styles.modalContent, { backgroundColor: cardColor }]}
            >
              <ThemedText type="subtitle" style={styles.modalTitle}>{t('search.sortBy')}</ThemedText>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.sortOption}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSortBy(option.value);
                    setFilterModalVisible(false);
                  }}
                >
                  <View style={styles.sortOptionLeft}>
                    <Ionicons name={option.icon as any} size={20} color={sortBy === option.value ? tintColor : secondaryText} />
                    <ThemedText style={[styles.sortLabel, sortBy === option.value && { color: tintColor, fontWeight: '700' }]}>
                      {option.label}
                    </ThemedText>
                  </View>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={tintColor} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </TouchableOpacity>
        </Modal>

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
  list: {
    paddingBottom: 120,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 0,
    paddingVertical: 4,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#FFF',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#00000010',
    padding: 4,
    borderRadius: 12,
  },
  miniTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  miniTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '700',
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
    bottom: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  skeletonCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
  },
  skeletonContent: {
    flexDirection: 'row',
    gap: 16,
  },
});
