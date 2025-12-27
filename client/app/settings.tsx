import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    // Dummy states for UI toggles
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

    const handleToggle = (setter: (v: boolean) => void, value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setter(!value);
    };

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
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
            style={[styles.row, isLast && styles.lastRow]}
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
                {value && <ThemedText style={styles.rowValue}>{value}</ThemedText>}
                {type === 'chevron' && <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />}
                {type === 'switch' && (
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={() => handleToggle(setNotificationsEnabled, notificationsEnabled)}
                        trackColor={{ false: '#767577', true: themeColors.tint }}
                        thumbColor="#fff"
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{title.toUpperCase()}</ThemedText>
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
                    <ThemedText type="subtitle" style={styles.headerTitle}>Settings</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Section title="General">
                            <SettingRow icon="language-outline" label="Language" value="English" />
                            <SettingRow icon="moon-outline" label="Theme" value={colorScheme === 'dark' ? 'Dark' : 'Light'} />
                            <SettingRow icon="notifications-outline" label="Notifications" type="switch" isLast />
                        </Section>

                        <Section title="Account & Privacy">
                            <SettingRow icon="person-outline" label="Account Info" value={user?.name} />
                            <SettingRow icon="lock-closed-outline" label="Privacy Controls" />
                            <SettingRow
                                icon="log-out-outline"
                                label="Sign Out"
                                color="#FF453A"
                                onPress={handleLogout}
                                type="none"
                                isLast
                            />
                        </Section>

                        <Section title="Support">
                            <SettingRow icon="help-circle-outline" label="Help / FAQ" />
                            <SettingRow icon="mail-outline" label="Contact Support" />
                            <SettingRow icon="information-circle-outline" label="About LOST_DIR" isLast />
                        </Section>

                        <View style={styles.footer}>
                            <ThemedText style={styles.versionText}>LOST_DIR v1.0.0</ThemedText>
                            <ThemedText style={styles.footerText}>Made with ❤️ for the community</ThemedText>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
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
        color: '#8E8E93',
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
        borderBottomColor: 'rgba(142, 142, 147, 0.2)',
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
        color: '#8E8E93',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        gap: 4,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
    },
    footerText: {
        fontSize: 12,
        color: '#C7C7CC',
    },
});
