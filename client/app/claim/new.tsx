import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createClaim, getMyLossReports } from '@/services/trustService';
import { getItemById } from '@/services/itemService';
import { Skeleton } from '@/components/Skeleton';

export default function ClaimItemScreen() {
    const { itemId } = useLocalSearchParams();
    const { t } = useTranslation();
    const router = useRouter();
    const tintColor = useThemeColor({}, 'tint');
    const color = useThemeColor({}, 'text');
    const cardColor = useThemeColor({}, 'card');
    const secondaryText = useThemeColor({}, 'secondaryText');

    const [item, setItem] = useState<any>(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemData, reportsData] = await Promise.all([
                    getItemById(itemId as string),
                    getMyLossReports()
                ]);
                setItem(itemData);
                setReports(reportsData);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        if (itemId) fetchData();
    }, [itemId]);

    const handleClaim = async () => {
        if (!selectedReportId) {
            Alert.alert('Selection Required', 'Please select a loss report to verify your claim.');
            return;
        }

        setSubmitting(true);
        try {
            const result = await createClaim(itemId as string, selectedReportId);

            let message = 'Your claim has been submitted.';
            if (result.matchScore > 80) message += ' We detected a strong match!';
            else message += ' The owner will review your details.';

            Alert.alert(t('common.success'), message, [
                { text: 'OK', onPress: () => router.replace('/claims' as any) }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit claim');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <SafeAreaView style={styles.center}>
                    <Skeleton width={200} height={20} />
                </SafeAreaView>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color={color} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('trust.claimItem')}</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Item Preview */}
                    <View style={[styles.itemPreview, { backgroundColor: cardColor }]}>
                        {item.imageUrl && (
                            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                        )}
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                            <ThemedText style={{ color: secondaryText, fontSize: 12 }}>{item.category}</ThemedText>
                        </View>
                    </View>

                    <ThemedText style={styles.sectionTitle}>{t('trust.selectReport')}</ThemedText>

                    {reports.length === 0 ? (
                        <View style={styles.emptyState}>
                            <ThemedText style={{ textAlign: 'center', marginBottom: 10, color: secondaryText }}>
                                You have no uploaded loss reports.
                            </ThemedText>
                            <TouchableOpacity onPress={() => router.push('/loss-report/new' as any)}>
                                <ThemedText style={{ color: tintColor, fontWeight: '700' }}>
                                    + Upload New Report
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={reports}
                            keyExtractor={(r: any) => r._id}
                            style={{ flex: 1 }}
                            renderItem={({ item: report }: { item: any }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.reportCard,
                                        { backgroundColor: cardColor, borderColor: selectedReportId === report._id ? tintColor : 'transparent' }
                                    ]}
                                    onPress={() => setSelectedReportId(report._id)}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <ThemedText style={{ fontWeight: '600' }}>{report.policeStation}</ThemedText>
                                        {selectedReportId === report._id && (
                                            <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                                        )}
                                    </View>
                                    <ThemedText style={{ fontSize: 12, color: secondaryText, marginTop: 4 }}>
                                        RB: {report.reportNumber}
                                    </ThemedText>
                                    <ThemedText numberOfLines={1} style={{ fontSize: 13, marginTop: 4 }}>
                                        {report.description}
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: tintColor, opacity: (selectedReportId && !submitting) ? 1 : 0.5 }
                        ]}
                        disabled={!selectedReportId || submitting}
                        onPress={handleClaim}
                    >
                        <ThemedText style={styles.submitText}>
                            {submitting ? 'Submitting...' : 'Submit Claim'}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18 },
    content: { flex: 1, padding: 20 },
    itemPreview: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    itemImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#e1e1e1',
    },
    sectionTitle: {
        marginBottom: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 12,
    },
    reportCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
    },
    submitButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});
