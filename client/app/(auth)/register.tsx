import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { registerUser } from '@/services/authService';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const tintColor = useThemeColor({}, 'tint');
    const cardColor = useThemeColor({}, 'card');
    const textColor = useThemeColor({}, 'text');
    const secondaryText = useThemeColor({}, 'secondaryText');

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const data = await registerUser(name, email, password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            login(data, data.token);
            router.replace('/(tabs)');
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error('Registration Error:', error);
            Alert.alert('Registration Failed', error.response?.data?.message || error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={textColor} />
                    </TouchableOpacity>

                    <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Join Us</ThemedText>
                        <ThemedText style={[styles.subtitle, { color: secondaryText }]}>Create an account to start your journey</ThemedText>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400)} style={styles.form}>
                        <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
                            <Ionicons name="person-outline" size={20} color={secondaryText} />
                            <TextInput
                                style={[styles.input, { color: textColor }]}
                                placeholder="Full Name"
                                placeholderTextColor={secondaryText}
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
                            <Ionicons name="mail-outline" size={20} color={secondaryText} />
                            <TextInput
                                style={[styles.input, { color: textColor }]}
                                placeholder="Email Address"
                                placeholderTextColor={secondaryText}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={secondaryText} />
                            <TextInput
                                style={[styles.input, { color: textColor }]}
                                placeholder="Secure Password"
                                placeholderTextColor={secondaryText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.button, { backgroundColor: tintColor }, loading && styles.disabledButton]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <ThemedText style={styles.buttonText}>Create Account</ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <ThemedText style={[styles.linkText, { color: secondaryText }]}>
                                Already a member? <ThemedText style={{ color: tintColor, fontWeight: '700' }}>Login</ThemedText>
                            </ThemedText>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
    },
    subtitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    form: {
        gap: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        borderRadius: 18,
        paddingHorizontal: 20,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    disabledButton: {
        opacity: 0.6,
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
