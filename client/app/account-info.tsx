import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/theme';
import { updateProfile } from '@/services/authService';

export default function AccountInfoScreen() {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const themeColors = Colors[colorScheme];

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('account.validation.nameRequired'));
            return;
        }

        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const updatedUser = await updateProfile({ name, email });
            updateUser(updatedUser);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(t('common.success'), t('account.updateSuccess'), [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(t('common.error'), error.response?.data?.message || t('account.updateError'));
        } finally {
            setLoading(false);
        }
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
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('account.title')}</ThemedText>
                    <View style={{ width: 44 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Animated.View entering={FadeInDown.duration(400)} style={styles.form}>
                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.label, { color: themeColors.secondaryText }]}>{t('account.name')}</ThemedText>
                                <View style={[styles.inputContainer, { backgroundColor: themeColors.card }]}>
                                    <Ionicons name="person-outline" size={20} color={themeColors.tint} />
                                    <TextInput
                                        style={[styles.input, { color: themeColors.text }]}
                                        value={name}
                                        onChangeText={setName}
                                        placeholderTextColor={themeColors.secondaryText}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <ThemedText style={[styles.label, { color: themeColors.secondaryText }]}>{t('account.email')}</ThemedText>
                                <View style={[styles.inputContainer, { backgroundColor: themeColors.card }]}>
                                    <Ionicons name="mail-outline" size={20} color={themeColors.tint} />
                                    <TextInput
                                        style={[styles.input, { color: themeColors.text }]}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor={themeColors.secondaryText}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.saveButton, { backgroundColor: themeColors.tint }]}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <ThemedText style={styles.saveButtonText}>{t('common.save')}</ThemedText>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
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
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
