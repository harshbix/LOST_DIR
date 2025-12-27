import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createItem } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
    'Electronics',
    'Keys',
    'Wallet/ID',
    'Clothing',
    'Pets',
    'Books',
    'Bags',
    'Other'
];

export default function AddItemScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('lost'); // 'lost' or 'found'
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setLocation('');
        setStatus('lost');
        setImage(null);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !category || !location) {
            Alert.alert('Error', 'Please fill in all fields (Title, Description, Category, Location)');
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
                imageUrl: image, // In a real app, you'd upload this to a server/S3 first
            });
            Alert.alert('Success', 'Item posted successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        resetForm();
                        router.replace('/(tabs)');
                    }
                }
            ]);
        } catch (error: any) {
            console.error('Post Error:', error);
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

            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
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

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera-outline" size={40} color="#8E8E93" />
                            <ThemedText style={styles.imagePlaceholderText}>Add Photo</ThemedText>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Title</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. iPhone 13, BMW Keys"
                        placeholderTextColor="#A0A0A0"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Category</ThemedText>
                    <View style={styles.categoryContainer}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryChip,
                                    category === cat && styles.activeCategoryChip
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <ThemedText style={[
                                    styles.categoryText,
                                    category === cat && styles.activeCategoryText
                                ]}>
                                    {cat}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Location</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Central Park, Library"
                        placeholderTextColor="#A0A0A0"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Description</ThemedText>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Provide more details to help identification (color, unique marks, etc...)"
                        placeholderTextColor="#A0A0A0"
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
        paddingBottom: 40,
        gap: 20,
    },
    statusToggle: {
        flexDirection: 'row',
        backgroundColor: '#F2F2F7',
        borderRadius: 14,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
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
    imagePicker: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        color: '#8E8E93',
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: '100%',
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
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    activeCategoryChip: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        fontSize: 13,
        color: '#3A3A3C',
    },
    activeCategoryText: {
        color: '#FFF',
        fontWeight: '600',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});
