import React, { useState } from 'react';
import { StyleSheet, Modal, TouchableOpacity, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TrustGuidanceProps {
    visible: boolean;
    onClose: () => void;
    type: 'report' | 'claim';
}

export const TrustGuidance = ({ visible, onClose, type }: TrustGuidanceProps) => {
    const { t } = useTranslation();
    const tintColor = useThemeColor({}, 'tint');
    const cardColor = useThemeColor({}, 'card');
    const color = useThemeColor({}, 'text');

    const content = type === 'report' ? [
        {
            icon: 'shield-checkmark',
            title: 'Verify Ownership',
            desc: 'Uploading a Police Loss Report (RB) helps us verify that you are the genuine owner of the lost item.'
        },
        {
            icon: 'lock-closed',
            title: 'Secure & Private',
            desc: 'Your report details are kept secure. Only key details are compared against found items to find a match.'
        },
        {
            icon: 'document-attach',
            title: 'Reusability',
            desc: 'Once verified, you can use this report to claim multiple matching items without re-uploading.'
        }
    ] : [
        {
            icon: 'scan',
            title: 'Smart Matching',
            desc: 'We compare your Loss Report details with the Found Item to generate a "Match Confidence" score.'
        },
        {
            icon: 'chatbubbles',
            title: 'Owner-Finder Chat',
            desc: 'If a match is likely, you can chat with the finder to arrange a safe return.'
        },
        {
            icon: 'checkmark-done-circle',
            title: 'Safe Return',
            desc: 'Always meet in a public place (like a Police Station) to exchange the item. Mark it as "Returned" only after receiving it.'
        }
    ];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                    <ThemedView style={[styles.container, { backgroundColor: cardColor }]}>
                        <View style={styles.header}>
                            <ThemedText type="subtitle" style={styles.title}>
                                {type === 'report' ? 'Why Upload a Report?' : 'How Claiming Works'}
                            </ThemedText>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={color} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scroll}>
                            {content.map((item, index) => (
                                <View key={index} style={styles.item}>
                                    <View style={[styles.iconContainer, { backgroundColor: tintColor + '15' }]}>
                                        <Ionicons name={item.icon as any} size={28} color={tintColor} />
                                    </View>
                                    <View style={styles.textContainer}>
                                        <ThemedText type="defaultSemiBold" style={{ marginBottom: 4 }}>{item.title}</ThemedText>
                                        <ThemedText style={{ lineHeight: 20, opacity: 0.8 }}>{item.desc}</ThemedText>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: tintColor }]}
                            onPress={onClose}
                        >
                            <ThemedText style={styles.buttonText}>{t('common.gotIt') || 'Got it'}</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </TouchableOpacity>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 24,
    },
    container: {
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
    },
    closeBtn: {
        padding: 4,
    },
    scroll: {
        marginBottom: 24,
    },
    item: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    button: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});
