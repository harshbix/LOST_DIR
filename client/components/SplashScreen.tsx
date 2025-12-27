import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    withSequence,
    runOnJS
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SplashScreenProps {
    onAnimationComplete: () => void;
}

export function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const blur = useSharedValue(20);

    useEffect(() => {
        // Sequence: Fade in + Scale up -> Stay -> Fade out
        opacity.value = withSequence(
            withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
            withTiming(1, { duration: 1500 }), // Wait
            withTiming(0, { duration: 600 }, (finished) => {
                if (finished) {
                    runOnJS(onAnimationComplete)();
                }
            })
        );

        scale.value = withSequence(
            withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) }),
            withTiming(1, { duration: 1500 }),
            withTiming(1.1, { duration: 600 })
        );

        blur.value = withTiming(0, { duration: 1000 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <View style={[styles.iconBox, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7' }]}>
                    <Ionicons
                        name="search-outline"
                        size={60}
                        color={themeColors.tint}
                        style={styles.mainIcon}
                    />
                    <View style={[styles.dot, { backgroundColor: '#FF453A' }]} />
                </View>
                <Text style={[styles.title, { color: themeColors.text }]}>LOST_DIR</Text>
                <Text style={[styles.subtitle, { color: themeColors.icon }]}>SEARCH • RECOVER • CONNECT</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    logoContainer: {
        alignItems: 'center',
        gap: 20,
    },
    iconBox: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
        position: 'relative',
    },
    mainIcon: {
        marginBottom: -4,
    },
    dot: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 4,
        opacity: 0.6,
    },
});
