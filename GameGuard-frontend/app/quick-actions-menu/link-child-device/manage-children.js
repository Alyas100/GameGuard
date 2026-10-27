import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getChildrenByParent } from '../../../lib/api/quick_actions/link-child-device/get_children';

export default function ManageChildrenScreen() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    // Refresh when returning from edit/register pages
    useFocusEffect(
        useCallback(() => {
            fetchChildren();
        }, [])
    );

    const fetchChildren = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                Alert.alert('Error', 'Please log in again.');
                return;
            }

            const data = await getChildrenByParent(userId);

            if (data.success) {
                setChildren(data.children || []);
            } else {
                throw new Error(data.message || 'Failed to fetch children');
            }
        } catch (error) {
            console.error('Fetch children error:', error);
            Alert.alert('Error', 'Failed to load children. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChildren();
    };

    const handleAddChild = () => {
        router.push('/quick-actions-menu/link-child-device/register-child');
    };


    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading children...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Manage Children</Text>
                    <Text style={styles.subtitle}>
                        View and update your children profiles
                    </Text>
                </View>

                {children.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={80} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No Children Added Yet</Text>
                        <Text style={styles.emptyDescription}>
                            Add your first child profile to start monitoring activities
                        </Text>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
                            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.addButtonText}>Add First Child</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <View style={styles.childrenList}>
                            {children.map((child) => (
                                <View key={child.id} style={styles.childCard}>
                                    <View style={styles.childHeader}>
                                        <View style={styles.avatarCircle}>
                                            <Ionicons name="person" size={28} color="#2563EB" />
                                        </View>
                                        <View style={styles.childInfo}>
                                            <Text style={styles.childName}>{child.childName}</Text>
                                            <Text style={styles.childAge}>Age {child.age}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.cardActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                router.push({
                                                    pathname: '/profile/edit-child/[id]',
                                                    params: { id: child.id }
                                                });
                                            }}
                                        >
                                            <Ionicons name="create-outline" size={18} color="#2563EB" />
                                            <Text style={styles.actionButtonText}>
                                                Edit
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.addAnotherButton} onPress={handleAddChild}>
                            <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
                            <Text style={styles.addAnotherText}>Add Another Child</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flexGrow: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 40,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    childrenList: {
        gap: 16,
        marginBottom: 20,
    },
    childCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    childInfo: {
        flex: 1,
    },
    childName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    childAge: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    deviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginBottom: 12,
    },
    deviceText: {
        fontSize: 14,
        color: '#6B7280',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563EB',
    },
    addAnotherButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2563EB',
        borderStyle: 'dashed',
        gap: 8,
    },
    addAnotherText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2563EB',
    },
});
