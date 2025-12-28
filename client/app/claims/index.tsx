import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMyClaims, updateClaimStatus } from '@/services/trustService';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/Skeleton';
import { TrustGuidance } from '@/components/TrustGuidance';

export default function ClaimsListScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const tintColor = useThemeColor({}, 'tint');
    const color = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const secondaryText = useThemeColor({}, 'secondaryText');

    const [activeTab, setActiveTab] = useState<'filed' | 'received'>('filed');
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showGuidance, setShowGuidance] = useState(false);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const data = await getMyClaims(activeTab);
            setClaims(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, [activeTab]);

    const handleAction = async (claimId: string, action: 'accepted' | 'rejected' | 'returned') => {
        try {
            await updateClaimStatus(claimId, action);
            fetchClaims(); // refresh list
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Action failed');
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let bg = secondaryText;
        if (status === 'accepted') bg = '#32D74B';
        if (status === 'rejected') bg = '#FF453A';
        if (status === 'pending') bg = '#FF9F0A';
        if (status === 'returned') bg = '#0A84FF';

        return (
            <View style={[styles.badge, { backgroundColor: bg + '20' }]}>
                <ThemedText style={[styles.badgeText, { color: bg as string }]}>
                    {t(`trust.claimStatus.${status}`)}
                </ThemedText>
            </View>
        );
    };

    const renderClaim = ({ item }: { item: any }) => {
        const isReceiver = activeTab === 'received';

        return (
            <View style={[styles.card, { backgroundColor: cardColor }]}>
                <View style={[styles.row, { marginBottom: 12 }]}>
                    <Image
                        source={{ uri: item.item.imageUrl || 'https://via.placeholder.com/50' }}
                        style={styles.itemThumb}
                    />
                    <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold">{item.item.title}</ThemedText>
                        <ThemedText style={{ fontSize: 12, color: secondaryText }}>
                            {isReceiver ? `Claimant: ${item.otherParty.name}` : `Finder: ${item.otherParty.name}`}
                        </ThemedText>
                    </View>
                    <StatusBadge status={item.status} />
                </View>

                {/* Match Score Indicator */}
                <View style={styles.scoreContainer}>
                    <ThemedText style={{ fontSize: 12, color: secondaryText }}>Match Score:</ThemedText>
                    <View style={styles.scoreBar}>
                        <View style={[styles.scoreFill, { width: `${item.matchScore}%`, backgroundColor: item.matchScore > 70 ? '#32D74B' : '#FF9F0A' }]} />
                    </View>
                    <ThemedText style={{ fontSize: 12, fontWeight: '700' }}>{Math.round(item.matchScore)}%</ThemedText>
                </View>

                {/* Actions for Receiver (Finder) */}
                {isReceiver && item.status === 'pending' && (
                    <View style={[styles.row, { marginTop: 12, gap: 12 }]}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { borderColor: '#FF453A', borderWidth: 1 }]}
                            onPress={() => handleAction(item._id, 'rejected')}
                        >
                            <ThemedText style={{ color: '#FF453A', fontWeight: '600' }}>Reject</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#32D74B' }]}
                            onPress={() => handleAction(item._id, 'accepted')}
                        >
                            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Accept Claim</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Actions for Receiver (Finder) when Accepted -> Mark Returned */}
                {isReceiver && item.status === 'accepted' && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#0A84FF', marginTop: 12 }]}
                        onPress={() => {
                            Alert.alert('Confirm Return', t('trust.confirmReturn'), [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Confirm', onPress: () => handleAction(item._id, 'returned') }
                            ]);
                        }}
                    >
                        <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Mark as Returned</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <TrustGuidance visible={showGuidance} onClose={() => setShowGuidance(false)} type="claim" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={color} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>Claims</ThemedText>
                    <TouchableOpacity onPress={() => setShowGuidance(true)} style={styles.backButton}>
                        <Ionicons name="information-circle-outline" size={24} color={tintColor} />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'filed' && { backgroundColor: tintColor }]}
                        onPress={() => setActiveTab('filed')}
                    >
                        <ThemedText style={{ color: activeTab === 'filed' ? '#fff' : color, fontWeight: '600' }}>
                            My Claims
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'received' && { backgroundColor: tintColor }]}
                        onPress={() => setActiveTab('received')}
                    >
                        <ThemedText style={{ color: activeTab === 'received' ? '#fff' : color, fontWeight: '600' }}>
                            Received Claims
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={claims}
                    keyExtractor={(item: any) => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchClaims} />}
                    ListEmptyComponent={
                        loading ? (
                            <View>
                                <Skeleton height={140} style={{ marginBottom: 16, borderRadius: 16 }} />
                                <Skeleton height={140} style={{ marginBottom: 16, borderRadius: 16 }} />
                            </View>
                        ) : (
                            <View style={styles.empty}>
                                <Ionicons name="documents-outline" size={64} color={secondaryText} />
                                <ThemedText style={{ marginTop: 16, color: secondaryText }}>No claims found</ThemedText>
                            </View>
                        )
                    }
                    renderItem={renderClaim}
                    initialNumToRender={10}
                    removeClippedSubviews={true}
                />
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18 },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    list: { padding: 16 },
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemThumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#e1e1e1',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    scoreBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#e1e1e1',
        borderRadius: 3,
        overflow: 'hidden',
    },
    scoreFill: { height: '100%' },
    actionBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});
