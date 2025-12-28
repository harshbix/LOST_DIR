import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Alert, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme, colorScheme, setTheme } = useTheme();
    const themeColors = Colors[colorScheme];

    const [langModalVisible, setLangModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const languages = [
        { label: 'English', value: 'en' },
        { label: 'Kiswahili', value: 'sw' }
    ];

    const themes = [
        { label: t('common.system'), value: 'system' },
        { label: t('common.light'), value: 'light' },
        { label: t('common.dark'), value: 'dark' }
    ];

    const changeLanguage = async (lng: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        i18n.changeLanguage(lng);
        await AsyncStorage.setItem('user-language', lng);
        setLangModalVisible(false);
    };

    const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setTheme(newTheme);
        setThemeModalVisible(false);
    };

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(t('common.logout'), 'Are you sure you want to sign out?', [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('common.logout'),
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/welcome');
                },
            },
        ]);
    };

    const SettingRow = ({
        icon,
        label,
        value,
        onPress,
        type = 'chevron',
        isLast = false,
        color = themeColors.text
    }: {
        icon: keyof typeof Ionicons.glyphMap;
        label: string;
        value?: string;
        onPress?: () => void;
        type?: 'chevron' | 'switch' | 'none';
        isLast?: boolean;
        color?: string;
    }) => (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.row, isLast && styles.lastRow, { borderBottomColor: themeColors.border }]}
            onPress={onPress}
            disabled={type === 'switch'}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7' }]}>
                    <Ionicons name={icon} size={20} color={color === themeColors.text ? themeColors.tint : color} />
                </View>
                <ThemedText style={[styles.rowLabel, { color }]}>{label}</ThemedText>
            </View>
            <View style={styles.rowRight}>
                {value && <ThemedText style={[styles.rowValue, { color: themeColors.secondaryText }]}>{value}</ThemedText>}
                {type === 'chevron' && <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />}
                {type === 'switch' && (
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setNotificationsEnabled(!notificationsEnabled);
                        }}
                        trackColor={{ false: '#767577', true: themeColors.tint }}
                        thumbColor="#fff"
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: themeColors.secondaryText }]}>{title.toUpperCase()}</ThemedText>
            <View style={[styles.sectionContent, { backgroundColor: themeColors.card }]}>
                {children}
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.back();
                        }}
                    >
                        <Ionicons name="chevron-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('common.settings')}</ThemedText>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Section title={t('common.settings')}>
                            <SettingRow
                                icon="language-outline"
                                label={t('common.language')}
                                value={i18n.language === 'en' ? 'English' : 'Kiswahili'}
                                onPress={() => setLangModalVisible(true)}
                            />
                            <SettingRow
                                icon="moon-outline"
                                label={t('common.theme')}
                                value={theme.charAt(0).toUpperCase() + theme.slice(1)}
                                onPress={() => setThemeModalVisible(true)}
                            />
                            <SettingRow icon="notifications-outline" label="Notifications" type="switch" isLast />
                        </Section>

                        <Section title={t('settings.accountPrivacy')}>
                            <SettingRow icon="person-outline" label={t('common.account')} value={user?.name} onPress={() => router.push('/account-info')} />
                            <SettingRow icon="lock-closed-outline" label={t('common.privacy')} onPress={() => router.push('/privacy-settings')} />
                            <SettingRow
                                icon="log-out-outline"
                                label={t('common.logout')}
                                color="#FF453A"
                                onPress={handleLogout}
                                type="none"
                                isLast
                            />
                        </Section>

                        <Section title={t('settings.support')}>
                            <SettingRow icon="help-circle-outline" label={t('common.help')} onPress={() => router.push('/faq')} />
                            <SettingRow icon="information-circle-outline" label={t('common.about')} onPress={() => router.push('/about')} isLast />
                        </Section>

                        <View style={styles.footer}>
                            <ThemedText style={[styles.versionText, { color: themeColors.secondaryText }]}>LOST_DIR {t('settings.version')}</ThemedText>
                            <ThemedText style={[styles.footerText, { color: '#C7C7CC' }]}>{t('settings.footer')}</ThemedText>
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Language Modal */}
                <Modal visible={langModalVisible} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setLangModalVisible(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                            <ThemedText style={styles.modalTitle}>{t('common.language')}</ThemedText>
                            {languages.map((l) => (
                                <TouchableOpacity
                                    key={l.value}
                                    style={styles.modalOption}
                                    onPress={() => changeLanguage(l.value)}
                                >
                                    <ThemedText style={[styles.optionLabel, i18n.language === l.value && { color: themeColors.tint }]}>{l.label}</ThemedText>
                                    {i18n.language === l.value && <Ionicons name="checkmark" size={20} color={themeColors.tint} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Theme Modal */}
                <Modal visible={themeModalVisible} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setThemeModalVisible(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
                            <ThemedText style={styles.modalTitle}>{t('common.theme')}</ThemedText>
                            {themes.map((t_item) => (
                                <TouchableOpacity
                                    key={t_item.value}
                                    style={styles.modalOption}
                                    onPress={() => changeTheme(t_item.value as any)}
                                >
                                    <ThemedText style={[styles.optionLabel, theme === t_item.value && { color: themeColors.tint }]}>{t_item.label}</ThemedText>
                                    {theme === t_item.value && <Ionicons name="checkmark" size={20} color={themeColors.tint} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
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
        paddingBottom: 40,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 12,
    },
    sectionContent: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    lastRow: {
        borderBottomWidth: 0,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowValue: {
        fontSize: 15,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        gap: 4,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerText: {
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        borderRadius: 24,
        padding: 24,
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    optionLabel: {
        fontSize: 17,
        fontWeight: '600',
    },
});
