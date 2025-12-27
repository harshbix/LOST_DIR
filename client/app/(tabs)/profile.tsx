import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { getMyItems } from '@/services/itemService';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            fetchMyItems();
        }
    }, [user]);

    const fetchMyItems = async () => {
        try {
            const data = await getMyItems();
            setMyItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/welcome');
                }
            },
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.itemCard}
            onPress={() => router.push(`/item/${item._id}`)}
        >
            <View>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.itemStatus}>{item.status.toUpperCase()} • {item.state.toUpperCase()}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText>Please login to view your profile</ThemedText>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
                    <ThemedText style={styles.loginButtonText}>Login</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <ThemedText style={styles.avatarText}>{user.name.charAt(0)}</ThemedText>
                    </View>
                    <View>
                        <ThemedText type="title">{user.name}</ThemedText>
                        <ThemedText style={styles.email}>{user.email}</ThemedText>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>My Posts</ThemedText>
                <FlatList
                    data={myItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <ThemedText style={styles.emptyText}>You haven't posted any items yet</ThemedText>
                        </View>
                    }
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        opacity: 0.5,
        fontSize: 14,
    },
    logoutButton: {
        padding: 8,
    },
    section: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    list: {
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 16,
        borderRadius: 12,
    },
    itemTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    itemStatus: {
        fontSize: 12,
        opacity: 0.5,
        marginTop: 4,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    loginButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        opacity: 0.5,
        textAlign: 'center',
    },
});
