import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';

export default function PrivacySettingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];

    const [profileVisible, setProfileVisible] = useState(true);
    const [locationVisible, setLocationVisible] = useState(true);
    const [dataUsage, setDataUsage] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            const settings = await AsyncStorage.getItem('privacy-settings');
            if (settings) {
                const parsed = JSON.parse(settings);
                setProfileVisible(parsed.profileVisible);
                setLocationVisible(parsed.locationVisible);
                setDataUsage(parsed.dataUsage);
            }
        };
        loadSettings();
    }, []);

    const saveSettings = async (newSettings: any) => {
        await AsyncStorage.setItem('privacy-settings', JSON.stringify(newSettings));
    };

    const handleToggle = (setter: (v: boolean) => void, current: boolean, key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newValue = !current;
        setter(newValue);

        // Save to storage
        const allSettings = {
            profileVisible,
            locationVisible,
            dataUsage,
            [key]: newValue
        };
        saveSettings(allSettings);
    };

    const PrivacyRow = ({ title, description, value, onValueChange, icon }: any) => (
        <View style={[styles.row, { borderBottomColor: themeColors.border }]}>
            <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: themeColors.tint + '15' }]}>
                    <Ionicons name={icon} size={20} color={themeColors.tint} />
                </View>
                <View style={styles.rowText}>
                    <ThemedText style={styles.rowTitle}>{title}</ThemedText>
                    <ThemedText style={[styles.rowDesc, { color: themeColors.secondaryText }]}>{description}</ThemedText>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#767577', true: themeColors.tint }}
                thumbColor="#fff"
            />
        </View>
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
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('privacy.title')}</ThemedText>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
                        <PrivacyRow
                            icon="eye-outline"
                            title={t('privacy.profileVisibility')}
                            description={t('privacy.profileVisibilityDesc')}
                            value={profileVisible}
                            onValueChange={() => handleToggle(setProfileVisible, profileVisible, 'profileVisible')}
                        />
                        <PrivacyRow
                            icon="location-outline"
                            title={t('privacy.locationVisibility')}
                            description={t('privacy.locationVisibilityDesc')}
                            value={locationVisible}
                            onValueChange={() => handleToggle(setLocationVisible, locationVisible, 'locationVisible')}
                        />
                        <PrivacyRow
                            icon="analytics-outline"
                            title={t('privacy.dataUsage')}
                            description={t('privacy.dataUsageDesc')}
                            value={dataUsage}
                            onValueChange={() => handleToggle(setDataUsage, dataUsage, 'dataUsage')}
                        />
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
        padding: 20,
    },
    section: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowText: {
        flex: 1,
        gap: 4,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    rowDesc: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
});
