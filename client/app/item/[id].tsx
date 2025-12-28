import React, { useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getItemById, updateItemStatus, deleteItem } from '@/services/itemService';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function ItemDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';

    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const secondaryText = useThemeColor({}, 'secondaryText');
    const tintColor = useThemeColor({}, 'tint');
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    const fetchItem = useCallback(async () => {
        try {
            const data = await getItemById(id as string);
            setItem(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch item details');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem]);

    const handleUpdateStatus = async (newState: string) => {
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await updateItemStatus(id as string, newState);
            fetchItem();
            Alert.alert('Status Updated', `Item is now marked as ${newState}`);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this listing permanently?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteItem(id as string);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            router.replace('/(tabs)');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete post');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator size="large" color={tintColor} />
            </ThemedView>
        );
    }

    if (!item) return null;

    const isOwner = user && user._id === (item.owner?._id || item.owner);
    const isRecovered = item.state === 'recovered' || item.state === 'returned';

    return (
        <ThemedView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View entering={FadeIn}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.headerImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: cardColor }]}>
                            <Ionicons
                                name={item.status === 'lost' ? 'help-circle' : 'search-circle'}
                                size={120}
                                color={borderColor}
                            />
                            <ThemedText style={[styles.noImageText, { color: secondaryText }]}>No image provided</ThemedText>
                        </View>
                    )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)} style={[styles.content, { backgroundColor }]}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: item.status === 'lost' ? '#FF453A' : '#32D74B' }]}>
                            <ThemedText style={styles.badgeText}>{item.status.toUpperCase()}</ThemedText>
                        </View>
                        <View style={[styles.stateBadge, { backgroundColor: cardColor }, isRecovered && styles.completeBadge]}>
                            <ThemedText style={[styles.stateText, isRecovered && styles.completeText]}>
                                {item.state.toUpperCase()}
                            </ThemedText>
                        </View>
                    </View>

                    <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: tintColor + '15' }]}>
                                <Ionicons name="pricetag" size={18} color={tintColor} />
                            </View>
                            <View>
                                <ThemedText style={[styles.infoLabel, { color: secondaryText }]}>Category</ThemedText>
                                <ThemedText style={styles.infoValue}>{item.category}</ThemedText>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: tintColor + '15' }]}>
                                <Ionicons name="location" size={18} color={tintColor} />
                            </View>
                            <View>
                                <ThemedText style={[styles.infoLabel, { color: secondaryText }]}>Location</ThemedText>
                                <ThemedText style={styles.infoValue}>{item.location}</ThemedText>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: tintColor + '15' }]}>
                                <Ionicons name="calendar" size={18} color={tintColor} />
                            </View>
                            <View>
                                <ThemedText style={[styles.infoLabel, { color: secondaryText }]}>Posted On</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Details</ThemedText>
                        <ThemedText style={[styles.description, { color: textColor }]}>{item.description}</ThemedText>
                    </View>

                    <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Owner Information</ThemedText>
                        <View style={[styles.ownerCard, { backgroundColor: cardColor }]}>
                            <View style={[styles.ownerAvatar, { backgroundColor: tintColor }]}>
                                <ThemedText style={styles.avatarText}>{item.owner?.name?.charAt(0).toUpperCase() || '?'}</ThemedText>
                            </View>
                            <View style={styles.ownerInfo}>
                                <ThemedText style={styles.ownerName}>{item.owner?.name || 'User'}</ThemedText>
                                <ThemedText style={[styles.ownerContact, { color: secondaryText }]}>{item.owner?.email || 'No contact provided'}</ThemedText>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={styles.footerWrapper}>
                {Platform.OS === 'ios' && (
                    <BlurView intensity={80} tint={colorScheme} style={StyleSheet.absoluteFill} />
                )}
                <SafeAreaView edges={['bottom']} style={[styles.footer, Platform.OS !== 'ios' && { backgroundColor: cardColor }]}>
                    <Animated.View entering={FadeInDown.delay(400)} style={styles.footerContent}>
                        {isOwner ? (
                            <View style={styles.ownerActions}>
                                {!isRecovered ? (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.primaryButton, { backgroundColor: tintColor }]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            handleUpdateStatus(item.status === 'lost' ? 'recovered' : 'returned');
                                        }}
                                    >
                                        <Ionicons name="checkmark-done" size={20} color="#FFF" />
                                        <ThemedText style={styles.buttonText}>
                                            {item.status === 'lost' ? 'Mark Recovered' : 'Mark Returned'}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.primaryButton, { backgroundColor: borderColor }]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            handleUpdateStatus('active');
                                        }}
                                    >
                                        <Ionicons name="refresh" size={20} color={tintColor} />
                                        <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>Re-activate Post</ThemedText>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.dangerButton}
                                    onPress={handleDelete}
                                >
                                    <Ionicons name="trash" size={24} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ gap: 12 }}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={[styles.primaryButton, { backgroundColor: tintColor }, isRecovered && styles.disabledButton]}
                                    disabled={isRecovered}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        Alert.alert('Contact Owner', `You can reach ${item.owner?.name} at ${item.owner?.email}`);
                                    }}
                                >
                                    <Ionicons name="mail" size={20} color="#FFF" />
                                    <ThemedText style={styles.buttonText}>
                                        {isRecovered ? 'Item Case Closed' : 'Contact Finder'}
                                    </ThemedText>
                                </TouchableOpacity>

                                {!isRecovered && item.status === 'found' && (
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={[styles.secondaryButton, { borderColor: tintColor }]}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            router.push(`/claim/new?itemId=${id}` as any);
                                        }}
                                    >
                                        <Ionicons name="hand-left" size={20} color={tintColor} />
                                        <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                                            Claim This Item
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </Animated.View>
                </SafeAreaView>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 140,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerImage: {
        width: width,
        height: width * 0.9,
    },
    imagePlaceholder: {
        width: width,
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        marginTop: 8,
        fontWeight: '600',
    },
    content: {
        padding: 24,
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    stateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    completeBadge: {
        backgroundColor: '#32D74B15',
        borderWidth: 1,
        borderColor: '#32D74B',
    },
    stateText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    completeText: {
        color: '#32D74B',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 24,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 24,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: '45%',
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    sectionDivider: {
        height: 1,
        marginVertical: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        fontWeight: '500',
    },
    ownerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 22,
    },
    ownerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    avatarText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 24,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontWeight: '800',
        fontSize: 18,
    },
    ownerContact: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
    },
    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(142, 142, 147, 0.2)',
    },
    footerContent: {
        padding: 24,
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '800',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
    },
    dangerButton: {
        backgroundColor: '#FF453A',
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF453A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: '#3A3A3C',
        shadowOpacity: 0,
    },
    secondaryButton: {
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        borderWidth: 2,
    },
});
