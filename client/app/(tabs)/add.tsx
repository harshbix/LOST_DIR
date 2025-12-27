import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createItem } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';

export default function AddItemScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('lost'); // 'lost' or 'found'
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!title || !description || !category || !location) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await createItem({
                title,
                description,
                category,
                location,
                status,
            });
            Alert.alert('Success', 'Item posted successfully');
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to post item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Post Item</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.statusToggle}>
                    <TouchableOpacity
                        style={[styles.toggleButton, status === 'lost' && styles.activeLost]}
                        onPress={() => setStatus('lost')}
                    >
                        <ThemedText style={[styles.toggleText, status === 'lost' && styles.activeTabText]}>I Lost Something</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, status === 'found' && styles.activeFound]}
                        onPress={() => setStatus('found')}
                    >
                        <ThemedText style={[styles.toggleText, status === 'found' && styles.activeTabText]}>I Found Something</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Title</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. iPhone 13, BMW Keys"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Category</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Electronics, Keys, Pets"
                        value={category}
                        onChangeText={setCategory}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Location</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Central Park, Library"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Description</ThemedText>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Provide more details to help identification..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <ThemedText style={styles.submitButtonText}>Submit Post</ThemedText>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    form: {
        paddingHorizontal: 20,
        paddingBottom: 100,
        gap: 20,
    },
    statusToggle: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 4,
        marginBottom: 10,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeLost: {
        backgroundColor: '#FF3B30',
    },
    activeFound: {
        backgroundColor: '#34C759',
    },
    toggleText: {
        fontWeight: '600',
        color: '#8E8E93',
    },
    activeTabText: {
        color: '#FFF',
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    input: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#000',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
