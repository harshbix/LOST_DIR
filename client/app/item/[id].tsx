import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getItemById, updateItemStatus } from '@/services/itemService';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    const fetchItem = async () => {
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
    };

    useEffect(() => {
        fetchItem();
    }, [id]);

    const handleUpdateStatus = async (newState: string) => {
        try {
            await updateItemStatus(id as string, newState);
            fetchItem();
            Alert.alert('Success', `Item marked as ${newState}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </ThemedView>
        );
    }

    if (!item) return null;

    const isOwner = user && user._id === item.owner?._id;
    const isRecovered = item.state === 'recovered' || item.state === 'returned';

    return (
        <ThemedView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.headerImage} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons
                            name={item.status === 'lost' ? 'help-circle' : 'search-circle'}
                            size={100}
                            color="#D1D1D6"
                        />
                    </View>
                )}

                <View style={styles.content}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: item.status === 'lost' ? '#FF3B30' : '#34C759' }]}>
                            <ThemedText style={styles.badgeText}>{item.status.toUpperCase()}</ThemedText>
                        </View>
                        <View style={[styles.stateBadge, isRecovered && styles.completeBadge]}>
                            <ThemedText style={[styles.stateText, isRecovered && styles.completeText]}>
                                {item.state.toUpperCase()}
                            </ThemedText>
                        </View>
                    </View>

                    <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Ionicons name="pricetag-outline" size={16} color="#007AFF" />
                            <ThemedText style={styles.infoValue}>{item.category}</ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={16} color="#007AFF" />
                            <ThemedText style={styles.infoValue}>{item.location}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                        <ThemedText style={styles.description}>{item.description}</ThemedText>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Posted By</ThemedText>
                        <View style={styles.ownerCard}>
                            <View style={styles.ownerAvatar}>
                                <ThemedText style={styles.avatarText}>{item.owner?.name?.charAt(0).toUpperCase()}</ThemedText>
                            </View>
                            <View>
                                <ThemedText style={styles.ownerName}>{item.owner?.name}</ThemedText>
                                <ThemedText style={styles.ownerContact}>{item.owner?.email}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {isOwner ? (
                    <View style={styles.ownerActions}>
                        {!isRecovered ? (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => handleUpdateStatus(item.status === 'lost' ? 'recovered' : 'returned')}
                            >
                                <ThemedText style={styles.buttonText}>
                                    {item.status === 'lost' ? 'Mark as Recovered' : 'Mark as Returned'}
                                </ThemedText>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={() => handleUpdateStatus('active')}
                            >
                                <ThemedText style={styles.secondaryButtonText}>Re-activate Post</ThemedText>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={() => Alert.alert('Delete', 'This feature is coming soon!')}
                        >
                            <Ionicons name="trash-outline" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, isRecovered && styles.disabledButton]}
                        disabled={isRecovered}
                        onPress={() => Alert.alert('Contact', `Contact ${item.owner?.name} at ${item.owner?.email}`)}
                    >
                        <ThemedText style={styles.buttonText}>
                            {isRecovered ? 'Item Case Closed' : 'Contact Owner'}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>
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
    },
    headerImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#F2F2F7',
    },
    imagePlaceholder: {
        height: 250,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        gap: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stateBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        backgroundColor: '#E5E5EA',
    },
    completeBadge: {
        backgroundColor: '#34C75920',
        borderWidth: 1,
        borderColor: '#34C759',
    },
    stateText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3A3A3C',
    },
    completeText: {
        color: '#34C759',
    },
    title: {
        fontSize: 28,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3A3A3C',
    },
    section: {
        marginTop: 10,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8E8E93',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#3A3A3C',
    },
    ownerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F2F2F7',
        padding: 16,
        borderRadius: 16,
    },
    ownerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 20,
    },
    ownerName: {
        fontWeight: '600',
        fontSize: 16,
        color: '#000',
    },
    ownerContact: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        backgroundColor: '#FFF',
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        backgroundColor: '#007AFF',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#F2F2F7',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
        width: 56,
        flex: 0,
    },
    disabledButton: {
        backgroundColor: '#C7C7CC',
    },
});
