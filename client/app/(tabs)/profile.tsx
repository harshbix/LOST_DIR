import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { getMyItems } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
    const { user } = useAuth();
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const secondaryText = useThemeColor({}, 'secondaryText');
    const tintColor = useThemeColor({}, 'tint');

    const fetchMyItems = useCallback(async () => {
        try {
            const data = await getMyItems();
            setMyItems(data);
        } catch (error) {
            console.error('Fetch my items error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchMyItems();
        }
    }, [user, fetchMyItems]);

    const navigateToSettings = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/settings');
    };

    const renderItem = useCallback(({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInRight.delay(index * 50)}>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.itemCard, { backgroundColor: cardColor, borderColor }]}
                onPress={() => router.push(`/item/${item._id}`)}
            >
                <View style={styles.itemInfo}>
                    <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                    <View style={styles.statusRow}>
                        <View style={[styles.miniBadge, { backgroundColor: item.status === 'lost' ? '#FF3B30' : '#34C759' }]} />
                        <ThemedText style={[styles.itemStatus, { color: secondaryText }]}>
                            {item.status.toUpperCase()} • {item.state.toUpperCase()}
                        </ThemedText>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={secondaryText} />
            </TouchableOpacity>
        </Animated.View>
    ), [cardColor, borderColor, secondaryText, router]);

    if (!user) {
        return (
            <ThemedView style={styles.center}>
                <Ionicons name="person-circle-outline" size={80} color="#D1D1D6" />
                <ThemedText style={styles.loginHint}>Join our community to start finding!</ThemedText>
                <TouchableOpacity
                    style={[styles.loginButton, { backgroundColor: tintColor }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push('/(auth)/login');
                    }}
                >
                    <ThemedText style={styles.loginButtonText}>Login / Register</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <Pressable
                        style={styles.profileHeader}
                        onPress={navigateToSettings}
                    >
                        <View style={[styles.avatar, { backgroundColor: tintColor }]}>
                            <ThemedText style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</ThemedText>
                        </View>
                        <View>
                            <ThemedText type="title" style={styles.userName}>{user.name}</ThemedText>
                            <ThemedText style={[styles.email, { color: secondaryText }]}>{user.email}</ThemedText>
                        </View>
                    </Pressable>

                    <TouchableOpacity
                        style={[styles.settingsButton, { backgroundColor: cardColor }]}
                        onPress={navigateToSettings}
                    >
                        <Ionicons name="settings-outline" size={22} color={tintColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>My Activity</ThemedText>
                        <View style={[styles.countBadge, { backgroundColor: cardColor }]}>
                            <ThemedText style={[styles.countText, { color: secondaryText }]}>{myItems.length}</ThemedText>
                        </View>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={tintColor} style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={myItems}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <Animated.View entering={FadeIn} style={styles.emptyContainer}>
                                    <Ionicons name="document-text-outline" size={60} color="#D1D1D6" />
                                    <ThemedText style={[styles.emptyText, { color: secondaryText }]}>You haven't posted anything yet.</ThemedText>
                                    <TouchableOpacity
                                        style={styles.createNowButton}
                                        onPress={() => router.push('/(tabs)/add')}
                                    >
                                        <ThemedText style={[styles.createNowText, { color: tintColor }]}>Post your first item</ThemedText>
                                    </TouchableOpacity>
                                </Animated.View>
                            }
                        />
                    )}
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        padding: 40,
    },
    loginHint: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 32,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
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
        fontSize: 24,
        fontWeight: '800',
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
    },
    email: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    settingsButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        flex: 1,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    countBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
    },
    list: {
        paddingBottom: 40,
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '700',
        fontSize: 17,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    miniBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    itemStatus: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    loginButton: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 16,
    },
    emptyContainer: {
        padding: 60,
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
    },
    createNowButton: {
        marginTop: 8,
    },
    createNowText: {
        fontWeight: '700',
        fontSize: 16,
    }
});
