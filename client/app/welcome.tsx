import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const tintColor = useThemeColor({}, 'tint');
    const cardColor = useThemeColor({}, 'card');
    const secondaryText = useThemeColor({}, 'secondaryText');

    const handlePress = (route: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(route);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <Animated.View
                    entering={FadeInUp.delay(200).duration(800)}
                    style={[styles.iconContainer, { backgroundColor: cardColor }]}
                >
                    <Ionicons name="search" size={60} color={tintColor} />
                    <View style={[styles.dot, { backgroundColor: '#FF453A' }]} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400).duration(800)} style={styles.textGroup}>
                    <ThemedText type="title" style={styles.title}>LOST_DIR</ThemedText>
                    <ThemedText style={[styles.subtitle, { color: secondaryText }]}>
                        The modern way to find what matters most and reconnect with your community.
                    </ThemedText>
                </Animated.View>
            </View>

            <Animated.View
                entering={FadeInDown.delay(600).duration(800)}
                style={styles.footer}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.primaryButton, { backgroundColor: tintColor }]}
                    onPress={() => handlePress('/(auth)/register')}
                >
                    <ThemedText style={styles.buttonText}>Join the Community</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.secondaryButton}
                    onPress={() => handlePress('/(auth)/login')}
                >
                    <ThemedText style={[styles.linkText, { color: tintColor }]}>
                        Already have an account? <ThemedText style={[styles.linkTextBold, { color: tintColor }]}>Login</ThemedText>
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => router.replace('/(tabs)')}
                >
                    <ThemedText style={[styles.skipText, { color: secondaryText }]}>Browse without signing in</ThemedText>
                </TouchableOpacity>
            </Animated.View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 130,
        height: 130,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        position: 'relative',
    },
    dot: {
        position: 'absolute',
        bottom: 35,
        right: 35,
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    textGroup: {
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 1,
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 17,
        lineHeight: 26,
        paddingHorizontal: 20,
        fontWeight: '500',
    },
    footer: {
        gap: 16,
        marginBottom: 20,
    },
    primaryButton: {
        width: '100%',
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '500',
    },
    linkTextBold: {
        fontWeight: '800',
    },
    skipButton: {
        alignItems: 'center',
        marginTop: 10,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
});
