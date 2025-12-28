import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrustGuidance } from '@/components/TrustGuidance';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMyLossReports } from '@/services/trustService';
import { Skeleton } from '@/components/Skeleton';


export default function LossReportsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const tintColor = useThemeColor({}, 'tint');
    const color = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const secondaryText = useThemeColor({}, 'secondaryText');

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showGuidance, setShowGuidance] = useState(false);

    const fetchReports = async () => {
        try {
            const data = await getMyLossReports();
            setReports(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return '#32D74B';
            case 'likely_valid': return '#FF9F0A';
            case 'needs_review': return '#FF453A';
            default: return secondaryText;
        }
    };

    const StatusBadge = ({ status }: { status: string }) => (
        <View style={[styles.badge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <ThemedText style={[styles.badgeText, { color: getStatusColor(status) }]}>
                {t(`trust.verificationStatus.${status}`)}
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <TrustGuidance visible={showGuidance} onClose={() => setShowGuidance(false)} type="report" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={color} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('trust.lossReportTitle')}</ThemedText>
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={() => setShowGuidance(true)} style={[styles.addButton, { marginRight: 8 }]}>
                            <Ionicons name="information-circle-outline" size={24} color={tintColor} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/loss-report/new' as any)} style={styles.addButton}>
                            <Ionicons name="add" size={24} color={tintColor} />
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={reports}
                    keyExtractor={(item: any) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        loading ? (
                            <View>
                                {[1, 2].map(i => (
                                    <View key={i} style={[styles.card, { backgroundColor: cardColor, height: 120, justifyContent: 'center' }]}>
                                        <Skeleton width="60%" height={20} style={{ marginBottom: 10 }} />
                                        <Skeleton width="40%" height={14} />
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.empty}>
                                <Ionicons name="document-text-outline" size={64} color={secondaryText} />
                                <ThemedText style={{ color: secondaryText, textAlign: 'center', marginTop: 16 }}>
                                    No reports found. Upload one to start.
                                </ThemedText>
                            </View>
                        )
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: cardColor }]}>
                            <View style={styles.cardHeader}>
                                <ThemedText style={styles.station}>{item.policeStation}</ThemedText>
                                <StatusBadge status={item.verificationStatus} />
                            </View>
                            <ThemedText style={styles.rbNumber}>RB: {item.reportNumber || 'N/A'}</ThemedText>
                            <ThemedText numberOfLines={2} style={[styles.description, { color: secondaryText }]}>
                                {item.description}
                            </ThemedText>
                            <View style={styles.cardFooter}>
                                <Ionicons name="calendar-outline" size={14} color={secondaryText} />
                                <ThemedText style={[styles.date, { color: secondaryText }]}>
                                    {new Date(item.incidentDate).toLocaleDateString()}
                                </ThemedText>
                            </View>
                        </View>
                    )}
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
    backButton: { padding: 8 },
    addButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    list: { padding: 20 },
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    station: {
        fontWeight: '700',
        fontSize: 16,
        flex: 1,
        marginRight: 8,
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
    rbNumber: {
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    date: { fontSize: 12 },
    empty: {
        alignItems: 'center',
        marginTop: 60,
    }
});
