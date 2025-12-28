import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, {
    FadeInUp,
    FadeOutUp,
    Layout,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createItem } from '@/services/itemService';
import { searchLocations, LocationSuggestion, formatDistance } from '@/services/locationService';
import { useDebounce } from '@/hooks/useDebounce';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

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

// Sub-component for Location Suggestion Row
const SuggestionItem = React.memo(({
    item,
    onSelect,
    cardColor,
    secondaryText,
    tintColor,
    borderColor
}: {
    item: LocationSuggestion,
    onSelect: (item: LocationSuggestion) => void,
    cardColor: string,
    secondaryText: string,
    tintColor: string,
    borderColor: string
}) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.suggestionItem,
                { borderBottomColor: borderColor },
                pressed && { backgroundColor: borderColor }
            ]}
            onPress={() => onSelect(item)}
        >
            <View style={[styles.suggestionIconContainer, { backgroundColor: tintColor + '15' }]}>
                <Ionicons name="location" size={18} color={tintColor} />
            </View>
            <View style={styles.suggestionTextContainer}>
                <ThemedText style={styles.suggestionName} numberOfLines={1}>{item.name}</ThemedText>
                <ThemedText style={[styles.suggestionAddress, { color: secondaryText }]} numberOfLines={1}>{item.address}</ThemedText>
            </View>
            {item.distance !== undefined && (
                <ThemedText style={[styles.distanceText, { color: tintColor, backgroundColor: tintColor + '15' }]}>
                    {formatDistance(item.distance)}
                </ThemedText>
            )}
        </Pressable>
    );
});

export default function AddItemScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [locationName, setLocationName] = useState('');
    const [status, setStatus] = useState<'lost' | 'found'>('lost');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [userCoords, setUserCoords] = useState<{ lat: number, lon: number } | null>(null);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    const debouncedLocationQuery = useDebounce(locationName, 500);
    const router = useRouter();

    const tintColor = useThemeColor({}, 'tint');
    const cardColor = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const secondaryText = useThemeColor({}, 'secondaryText');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');

    const submitBtnScale = useSharedValue(1);
    const animatedSubmitStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(submitBtnScale.value) }]
    }));

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setUserCoords({
                    lat: location.coords.latitude,
                    lon: location.coords.longitude
                });
            } catch (e) {
                console.warn('Location Permission/Fetch error', e);
            }
        })();
    }, []);

    useEffect(() => {
        if (debouncedLocationQuery.length > 2) {
            performSearch(debouncedLocationQuery);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [debouncedLocationQuery]);

    const performSearch = useCallback(async (query: string) => {
        setIsSearchingLocation(true);
        setShowSuggestions(true);
        const results = await searchLocations(query, userCoords?.lat, userCoords?.lon);
        const uniqueResults = results.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
        setSuggestions(uniqueResults);
        setIsSearchingLocation(false);
    }, [userCoords]);

    const handleLocationSelect = useCallback((suggestion: LocationSuggestion) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setLocationName(suggestion.address);
        setShowSuggestions(false);
        setSuggestions([]);
    }, []);

    const resetForm = useCallback(() => {
        setTitle('');
        setDescription('');
        setCategory('');
        setLocationName('');
        setStatus('lost');
        setImage(null);
        setSuggestions([]);
        setShowSuggestions(false);
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setImage(result.assets[0].uri);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !category || !locationName) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Missing Info', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        submitBtnScale.value = 0.95;

        try {
            await createItem({
                title,
                description,
                category,
                location: locationName,
                status,
                imageUrl: image,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            submitBtnScale.value = 1;

            Alert.alert('Success', 'Item posted successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        resetForm();
                        router.replace('/(tabs)');
                    }
                }
            ]);
        } catch (error: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            submitBtnScale.value = 1;
            Alert.alert('Error', error.response?.data?.message || 'Failed to post item');
        } finally {
            setLoading(false);
        }
    };

    const renderSuggestion = ({ item }: { item: LocationSuggestion }) => (
        <SuggestionItem
            item={item}
            onSelect={handleLocationSelect}
            cardColor={cardColor}
            secondaryText={secondaryText}
            tintColor={tintColor}
            borderColor={borderColor}
        />
    );

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.headerTitle}>Post Item</ThemedText>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.form}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="on-drag"
                    >
                        {/* Status Selector */}
                        <View style={[styles.statusToggle, { backgroundColor: cardColor }]}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[styles.toggleButton, status === 'lost' && styles.activeLost]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setStatus('lost');
                                }}
                            >
                                <ThemedText style={[styles.toggleText, { color: secondaryText }, status === 'lost' && styles.activeTabText]}>I Lost</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[styles.toggleButton, status === 'found' && styles.activeFound]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setStatus('found');
                                }}
                            >
                                <ThemedText style={[styles.toggleText, { color: secondaryText }, status === 'found' && styles.activeTabText]}>I Found</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Image Picker */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.imagePicker,
                                { backgroundColor: cardColor, borderColor },
                                pressed && { opacity: 0.8 }
                            ]}
                            onPress={pickImage}
                        >
                            {image ? (
                                <Image source={{ uri: image }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Ionicons name="camera" size={40} color={secondaryText} />
                                    <ThemedText style={[styles.imagePlaceholderText, { color: secondaryText }]}>Add Photo</ThemedText>
                                </View>
                            )}
                        </Pressable>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.label}>Title</ThemedText>
                                <TextInput
                                    style={[styles.input, { backgroundColor: cardColor, color: textColor }]}
                                    placeholder="e.g. Blue Backpack"
                                    placeholderTextColor={secondaryText}
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={50}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.label}>Category</ThemedText>
                                <View style={styles.categoryContainer}>
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.categoryChip,
                                                { backgroundColor: cardColor, borderColor },
                                                category === cat && { backgroundColor: tintColor, borderColor: tintColor }
                                            ]}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setCategory(cat);
                                            }}
                                        >
                                            <ThemedText style={[
                                                styles.categoryText,
                                                { color: secondaryText },
                                                category === cat && styles.activeCategoryText
                                            ]}>
                                                {cat}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={[styles.inputContainer, { zIndex: 999 }]}>
                                <ThemedText style={styles.label}>Location</ThemedText>
                                <View style={styles.locationInputWrapper}>
                                    <View style={[styles.inputWithIcon, { backgroundColor: cardColor }]}>
                                        <Ionicons name="search" size={18} color={secondaryText} style={styles.searchIcon} />
                                        <TextInput
                                            style={[styles.input, styles.inputSpaced, { color: textColor }]}
                                            placeholder="Search neighborhood or venue..."
                                            placeholderTextColor={secondaryText}
                                            value={locationName}
                                            onChangeText={setLocationName}
                                            onFocus={() => locationName.length > 2 && setShowSuggestions(true)}
                                        />
                                    </View>
                                    {isSearchingLocation && (
                                        <ActivityIndicator size="small" color={tintColor} style={styles.locationLoader} />
                                    )}
                                </View>

                                {showSuggestions && suggestions.length > 0 && (
                                    <Animated.View
                                        entering={FadeInUp.springify()}
                                        exiting={FadeOutUp}
                                        style={[styles.suggestionsWrapper, { backgroundColor, borderColor }]}
                                    >
                                        <FlatList
                                            data={suggestions}
                                            keyExtractor={(item) => item.id}
                                            renderItem={renderSuggestion}
                                            scrollEnabled={false}
                                            keyboardShouldPersistTaps="always"
                                            style={styles.suggestionsList}
                                        />
                                    </Animated.View>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.label}>Description</ThemedText>
                                <TextInput
                                    style={[styles.input, styles.textArea, { backgroundColor: cardColor, color: textColor }]}
                                    placeholder="Describe specific details..."
                                    placeholderTextColor={secondaryText}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>
                        </View>

                        <Animated.View style={animatedSubmitStyle}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.submitButton, { backgroundColor: tintColor }, loading && styles.disabledButton]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <ThemedText style={styles.submitButtonText}>Share Listing</ThemedText>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    form: {
        paddingHorizontal: 20,
        paddingBottom: 140,
        gap: 24,
    },
    statusToggle: {
        flexDirection: 'row',
        borderRadius: 18,
        padding: 4,
        height: 58,
    },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
    },
    activeLost: {
        backgroundColor: '#FF453A',
        shadowColor: '#FF453A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    activeFound: {
        backgroundColor: '#32D74B',
        shadowColor: '#32D74B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    toggleText: {
        fontWeight: '700',
        fontSize: 16,
    },
    activeTabText: {
        color: '#FFF',
    },
    imagePicker: {
        height: 240,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        fontSize: 15,
        fontWeight: '600',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    inputGroup: {
        gap: 20,
    },
    inputContainer: {
        gap: 10,
    },
    label: {
        fontSize: 15,
        fontWeight: '800',
        marginLeft: 4,
    },
    input: {
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
    },
    searchIcon: {
        paddingLeft: 16,
    },
    inputSpaced: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    locationInputWrapper: {
        position: 'relative',
        zIndex: 1000,
    },
    locationLoader: {
        position: 'absolute',
        right: 16,
        top: 18,
    },
    suggestionsWrapper: {
        borderRadius: 18,
        marginTop: 8,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
        overflow: 'hidden',
    },
    suggestionsList: {
        maxHeight: 300,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    suggestionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionTextContainer: {
        flex: 1,
    },
    suggestionName: {
        fontSize: 15,
        fontWeight: '700',
    },
    suggestionAddress: {
        fontSize: 13,
        marginTop: 2,
    },
    distanceText: {
        fontSize: 12,
        fontWeight: '800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeCategoryText: {
        color: '#FFF',
        fontWeight: '800',
    },
    textArea: {
        height: 140,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    submitButton: {
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
    disabledButton: {
        opacity: 0.5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
