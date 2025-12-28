import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { createLossReport } from '@/services/trustService';

export default function NewLossReportScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const tintColor = useThemeColor({}, 'tint');
    const color = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardColor = useThemeColor({}, 'card');

    const [incidentDate, setIncidentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [policeStation, setPoliceStation] = useState('');
    const [reportNumber, setReportNumber] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDraft();
    }, []);

    const loadDraft = async () => {
        try {
            const draft = await AsyncStorage.getItem('loss_report_draft');
            if (draft) {
                const data = JSON.parse(draft);
                if (data.incidentDate) setIncidentDate(new Date(data.incidentDate));
                if (data.policeStation) setPoliceStation(data.policeStation);
                if (data.reportNumber) setReportNumber(data.reportNumber);
                if (data.description) setDescription(data.description);
                if (data.image) setImage(data.image);
            }
        } catch (e) {
            console.error('Failed to load draft');
        }
    };

    const saveDraft = async () => {
        try {
            const data = {
                incidentDate: incidentDate.toISOString(),
                policeStation,
                reportNumber,
                description,
                image
            };
            await AsyncStorage.setItem('loss_report_draft', JSON.stringify(data));
            Alert.alert(t('common.success'), 'Draft saved successfully');
        } catch (e) {
            Alert.alert(t('common.error'), 'Failed to save draft');
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!image || !policeStation || !description) {
            Alert.alert(t('common.error'), 'Please fill in required fields and upload the report image.');
            return;
        }

        setLoading(true);
        try {
            // For demo: we just mock the payload. 
            // In real app, build FormData here.

            // Simulating form data for now as our 'mock' service might just need JSON or handles it.
            // But let's act like we are sending JSON for the prototype logic to work with the mock backend.
            const reportData: any = {
                reportType: 'Lost',
                IncidentDate: incidentDate.toISOString(),
                policeStation,
                reportNumber,
                description,
                imageUrl: image // In production this would be a file upload result
            };

            await createLossReport(reportData);
            await AsyncStorage.removeItem('loss_report_draft');
            Alert.alert(t('common.success'), 'Loss Report Uploaded', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || 'Failed to upload report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={color} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>{t('trust.uploadReport')}</ThemedText>
                    <TouchableOpacity onPress={saveDraft} style={styles.backButton}>
                        <ThemedText style={{ color: tintColor, fontWeight: '600' }}>Save</ThemedText>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.infoCard, { backgroundColor: cardColor + '40' }]}>
                        <Ionicons name="shield-checkmark" size={24} color={tintColor} />
                        <ThemedText style={styles.infoText}>{t('trust.uploadInstruction')}</ThemedText>
                    </View>

                    <TouchableOpacity onPress={pickImage} style={[styles.imageUpload, { borderColor: tintColor }]}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.uploadedImage} />
                        ) : (
                            <View style={styles.uploadPlaceholder}>
                                <Ionicons name="camera-outline" size={48} color={tintColor} />
                                <ThemedText style={{ color: tintColor }}>{t('trust.uploadReport')}</ThemedText>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>{t('trust.incidentDate')}</ThemedText>
                        <TouchableOpacity
                            style={[styles.input, { backgroundColor: cardColor, borderColor: '#ccc' }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <ThemedText>{incidentDate.toDateString()}</ThemedText>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={incidentDate}
                                mode="date"
                                display="default"
                                onChange={(event: any, date: Date | undefined) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (date) setIncidentDate(date);
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>{t('trust.policeStation')} *</ThemedText>
                        <TextInput
                            style={[styles.input, { color, backgroundColor: cardColor }]}
                            placeholder="e.g. Kituo cha Kati, Dar es Salaam"
                            placeholderTextColor="#888"
                            value={policeStation}
                            onChangeText={setPoliceStation}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>{t('trust.reportNumber')}</ThemedText>
                        <TextInput
                            style={[styles.input, { color, backgroundColor: cardColor }]}
                            placeholder="e.g. RB/123/2024"
                            placeholderTextColor="#888"
                            value={reportNumber}
                            onChangeText={setReportNumber}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Description / Notes *</ThemedText>
                        <TextInput
                            style={[styles.input, styles.textArea, { color, backgroundColor: cardColor }]}
                            placeholder="Details of the loss..."
                            placeholderTextColor="#888"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: tintColor }]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.submitText}>{t('common.save')}</ThemedText>}
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    content: { padding: 20 },
    infoCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
        alignItems: 'center',
    },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
    imageUpload: {
        height: 200,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: 24,
        overflow: 'hidden',
    },
    uploadedImage: { width: '100%', height: '100%' },
    uploadPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    formGroup: { marginBottom: 16 },
    label: { marginBottom: 8, fontWeight: '600' },
    input: {
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ccc',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    submitText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});
