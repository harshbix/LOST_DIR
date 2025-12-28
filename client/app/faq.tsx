import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
    {
        q: "How do I report a lost item?",
        a: "Navigate to the 'Discovery' tab and tap the '+' button. Fill in the item details, category, and location where you lost it."
    },
    {
        q: "Is LOST_DIR free to use?",
        a: "Yes, LOST_DIR is a community-driven project and is completely free for everyone to use."
    },
    {
        q: "How do I contact someone who found my item?",
        a: "Tap on the item listing to view details, then tap 'Contact Owner' to see their contact info."
    },
    {
        q: "What should I do if I find a lost item?",
        a: "Capture a clear photo of the item, select 'I Found' in the post screen, and provide as much detail as possible to help the owner identify it."
    },
    {
        q: "Can I delete my post?",
        a: "Yes, go to your profile, tap the item, and select 'Delete Post' at the bottom of the details page."
    }
];

export default function FAQScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(expanded === index ? null : index);
    };

    const handleExternalSupport = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL('https://lostandfound.help');
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('common.help')}</ThemedText>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <ThemedText style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>

                        {FAQS.map((faq, index) => (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.7}
                                style={[styles.faqItem, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
                                onPress={() => toggleExpand(index)}
                            >
                                <View style={styles.faqHeader}>
                                    <ThemedText style={styles.question}>{faq.q}</ThemedText>
                                    <Ionicons
                                        name={expanded === index ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color={themeColors.secondaryText}
                                    />
                                </View>
                                {expanded === index && (
                                    <ThemedText style={[styles.answer, { color: themeColors.secondaryText }]}>
                                        {faq.a}
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.supportCard, { backgroundColor: themeColors.tint }]}
                            onPress={handleExternalSupport}
                        >
                            <View style={styles.supportIcon}>
                                <Ionicons name="help-buoy" size={24} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ThemedText style={styles.supportTitle}>Still need help?</ThemedText>
                                <ThemedText style={styles.supportText}>Visit our online support center for more guides.</ThemedText>
                            </View>
                            <Ionicons name="open-outline" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
    },
    faqItem: {
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        paddingRight: 12,
    },
    answer: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginTop: 32,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
    },
    supportIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    supportText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
});
