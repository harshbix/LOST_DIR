import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
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

export default function AboutScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];
    const year = new Date().getFullYear();

    const openLink = (url: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL(url);
    };

    const SocialLink = ({ icon, label, url, color }: any) => (
        <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            onPress={() => openLink(url)}
        >
            <Ionicons name={icon} size={20} color={color || themeColors.tint} />
            <ThemedText style={styles.socialLabel}>{label}</ThemedText>
            <Ionicons name="chevron-forward" size={16} color={themeColors.secondaryText} />
        </TouchableOpacity>
    );

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
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('common.about')}</ThemedText>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <View style={styles.logoSection}>
                            <View style={[styles.logoContainer, { backgroundColor: themeColors.tint }]}>
                                <Ionicons name="search" size={40} color="#FFF" />
                            </View>
                            <ThemedText type="title" style={styles.appName}>LOST_DIR</ThemedText>
                            <ThemedText style={[styles.version, { color: themeColors.secondaryText }]}>Version 1.0.0</ThemedText>
                        </View>

                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('about.title')}</ThemedText>
                            <ThemedText style={[styles.description, { color: themeColors.text }]}>
                                {t('about.description')}
                            </ThemedText>
                        </View>

                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('about.policies')}</ThemedText>
                            <View style={[styles.policyCard, { backgroundColor: themeColors.card }]}>
                                <ThemedText style={[styles.policyText, { color: themeColors.secondaryText }]}>
                                    {t('about.policyText')}
                                </ThemedText>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <ThemedText style={styles.sectionTitle}>{t('common.contact')}</ThemedText>
                            <View style={styles.socialGrid}>
                                <SocialLink icon="logo-linkedin" label="LinkedIn" url="https://www.linkedin.com/in/junior-jeconia-90710b265/" color="#0077B5" />
                                <SocialLink icon="logo-twitter" label="X (Twitter)" url="https://x.com/b1xson" color="#000000" />
                                <SocialLink icon="logo-instagram" label="Instagram" url="https://www.instagram.com/bixx.tech" color="#E1306C" />
                                <SocialLink icon="logo-github" label="GitHub" url="https://github.com/harshbix" color="#333" />
                                <SocialLink icon="logo-youtube" label="YouTube" url="https://www.youtube.com/@JuniorJeconia" color="#FF0000" />
                                <SocialLink icon="logo-whatsapp" label="WhatsApp" url="https://wa.me/255755063711" color="#25D366" />
                                <SocialLink icon="mail-outline" label="Email" url="mailto:juniorjeconia@icloud.com" />
                                <SocialLink icon="globe-outline" label="Website" url="https://juniorjeconia.vercel.app/" />
                            </View>
                        </View>

                        <View style={styles.locationSection}>
                            <View style={styles.locationItem}>
                                <Ionicons name="location-outline" size={18} color={themeColors.tint} />
                                <ThemedText style={styles.locationText}>Mbeya & Dar es Salaam, Tanzania</ThemedText>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <ThemedText style={[styles.footerText, { color: themeColors.secondaryText }]}>
                                {t('about.footer', { year })}
                            </ThemedText>
                            <ThemedText style={[styles.premiumText, { color: themeColors.tint }]}>Premium Community Experience</ThemedText>
                        </View>
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
        paddingBottom: 60,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
    },
    version: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    policyCard: {
        padding: 20,
        borderRadius: 20,
    },
    policyText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '500',
    },
    socialGrid: {
        gap: 10,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    socialLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
    },
    locationSection: {
        marginTop: 10,
        marginBottom: 40,
        alignItems: 'center',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(142, 142, 147, 0.2)',
    },
    footerText: {
        fontSize: 14,
        fontWeight: '700',
    },
    premiumText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginTop: 8,
    },
});
