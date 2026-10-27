import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getMonitoredGamesByChild, toggleGameMonitoring } from '../../lib/api/profile/get_monitored_games';
import { getChildrenByParent } from '../../lib/api/quick_actions/link-child-device/get_children';
import { getScreenTimeLogsByChild } from '../../lib/api/screen-time/log_screen_time';

export default function MonitoredGamesPage() {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [monitoredGames, setMonitoredGames] = useState([]);
    const [screenTimeLogs, setScreenTimeLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChildPicker, setShowChildPicker] = useState(false);
    const [activeTab, setActiveTab] = useState('games');

    // Fetch children on mount
    useEffect(() => {
        fetchChildren();
    }, []);

    // Refresh children list when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchChildren();
        }, [])
    );

    // Fetch games when child is selected
    useEffect(() => {
        if (selectedChild) {
            fetchChildData();
        }
    }, [selectedChild]);

    const fetchChildData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchGamesForChild(), fetchScreenTimeLogsForChild()]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching child data:', error);
            Alert.alert('Error', 'Failed to load child data');
            setLoading(false);
        }
    };

    const fetchChildren = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User not logged in');
                setLoading(false);
                return;
            }

            console.log('👶 Fetching children for user:', userId);
            const childrenData = await getChildrenByParent(parseInt(userId));
            console.log('👶 Children data received:', childrenData);

            // Extract children array from response
            const childrenArray = childrenData.children || childrenData;
            setChildren(childrenArray);

            // Auto-select first child if available
            if (childrenArray && childrenArray.length > 0) {
                setSelectedChild(childrenArray[0]);
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            Alert.alert('Error', 'Failed to load children');
            setLoading(false);
        }
    };

    const fetchGamesForChild = async () => {
        try {
            // Fetch only monitored games for selected child
            const games = await getMonitoredGamesByChild(selectedChild.id);
            setMonitoredGames(games);
        } catch (error) {
            console.error('Error fetching games:', error);
            setMonitoredGames([]);
        }
    };

    const fetchScreenTimeLogsForChild = async () => {
        try {
            const logs = await getScreenTimeLogsByChild(selectedChild.id);
            setScreenTimeLogs(Array.isArray(logs) ? logs : []);
        } catch (error) {
            console.error('Error fetching screen time logs:', error);
            setScreenTimeLogs([]);
        }
    };

    const handleRemoveGame = async (gameId, gameName) => {
        if (!selectedChild) {
            Alert.alert('Error', 'Please select a child first');
            return;
        }

        Alert.alert(
            'Remove Game',
            `Stop monitoring ${gameName} for ${selectedChild.childName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Optimistic UI update
                            setMonitoredGames(prev => prev.filter(g => g.id !== gameId));

                            // Call API to remove
                            await toggleGameMonitoring(selectedChild.id, gameId, false);
                        } catch (error) {
                            // Revert on error
                            fetchGamesForChild();
                            Alert.alert('Error', 'Failed to remove game');
                        }
                    }
                }
            ]
        );
    };

    const renderGameItem = ({ item }) => {
        return (
            <View style={styles.gameRow}>
                <Ionicons name="game-controller-outline" size={24} color="#007AFF" style={styles.gameIcon} />
                <Text style={styles.gameName}>{item.name}</Text>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveGame(item.id, item.name)}
                >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderListFooter = () => (
        <View style={styles.footerContainer}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                    if (activeTab === 'games') {
                        router.push({
                            pathname: './add-game',
                            params: {
                                childId: selectedChild?.id,
                                childName: selectedChild?.childName
                            }
                        });
                        return;
                    }

                    router.push('/quick-actions-menu/log-screen-time');
                }}
                disabled={!selectedChild}
            >
                <Text style={styles.addButtonIcon}>{activeTab === 'games' ? '➕' : '⏱️'}</Text>
                <Text style={styles.addButtonText}>
                    {activeTab === 'games' ? 'Add Another Game...' : 'Log Screen Time'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderLogItem = ({ item }) => {
        const minutes = Number(item.durationMinutes || 0);
        const hoursPart = Math.floor(minutes / 60);
        const minsPart = minutes % 60;
        const durationText = `${hoursPart}h ${minsPart}m`;

        return (
            <View style={styles.logRow}>
                <Ionicons name="time-outline" size={22} color="#F59E0B" style={styles.gameIcon} />
                <View style={styles.logMain}>
                    <Text style={styles.gameName}>{item.game?.name || 'Unknown Game'}</Text>
                    <Text style={styles.logMeta}>{new Date(item.logDate).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.logDuration}>{durationText}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Monitored Games' }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!children || children.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Monitored Games' }} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No Children Registered</Text>
                    <Text style={styles.emptySubtitle}>
                        Register your first child to start monitoring their games
                    </Text>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('./register-child')}
                    >
                        <Ionicons name="person-add" size={20} color="#fff" style={styles.registerButtonIcon} />
                        <Text style={styles.registerButtonText}>Register Your First Child</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Monitored Games' }} />

            {/* Child Selector */}
            <TouchableOpacity
                style={styles.childSelector}
                onPress={() => setShowChildPicker(true)}
            >
                <View style={styles.childSelectorLeft}>
                    <Ionicons name="person" size={20} color="#007AFF" />
                    <Text style={styles.childSelectorText}>
                        {selectedChild ? selectedChild.childName : 'Select Child'}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#007AFF" />
            </TouchableOpacity>

            {/* Page Header */}
            <View style={styles.header}>
                <Text style={styles.icon}>🎮</Text>
                <Text style={styles.title}>Monitored Games</Text>
                <Text style={styles.subtitle}>
                    Select games to monitor for {selectedChild?.childName}
                </Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'games' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('games')}
                >
                    <Text style={[styles.tabText, activeTab === 'games' && styles.tabTextActive]}>
                        Games
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'logs' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('logs')}
                >
                    <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
                        Screen Time Logs
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content List */}
            <FlatList
                data={activeTab === 'games' ? monitoredGames : screenTimeLogs}
                renderItem={activeTab === 'games' ? renderGameItem : renderLogItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyGamesContainer}>
                        <Ionicons
                            name={activeTab === 'games' ? 'game-controller-outline' : 'time-outline'}
                            size={48}
                            color="#9CA3AF"
                        />
                        <Text style={styles.emptyGamesText}>
                            {activeTab === 'games'
                                ? 'No games being monitored yet'
                                : 'No screen time logs yet'}
                        </Text>
                        <Text style={styles.emptyGamesSubtext}>
                            {activeTab === 'games'
                                ? 'Tap "Add Another Game" to start monitoring'
                                : 'Tap "Log Screen Time" to add first log'}
                        </Text>
                    </View>
                }
                ListFooterComponent={renderListFooter}
            />

            {/* Child Picker Modal */}
            <Modal
                visible={showChildPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowChildPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Child</Text>
                            <TouchableOpacity onPress={() => setShowChildPicker(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {Array.isArray(children) && children.length > 0 ? (
                                children.map((child) => (
                                    <TouchableOpacity
                                        key={child.id}
                                        style={[
                                            styles.childOption,
                                            selectedChild?.id === child.id && styles.childOptionSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedChild(child);
                                            setShowChildPicker(false);
                                        }}
                                    >
                                        <Ionicons
                                            name="person-circle"
                                            size={32}
                                            color={selectedChild?.id === child.id ? '#007AFF' : '#6B7280'}
                                        />
                                        <View style={styles.childOptionText}>
                                            <Text style={styles.childOptionName}>{child.childName}</Text>
                                            <Text style={styles.childOptionAge}>Age: {child.age}</Text>
                                        </View>
                                        {selectedChild?.id === child.id && (
                                            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                                        )}
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyModalContainer}>
                                    <Text style={styles.emptyModalText}>No children found</Text>
                                </View>
                            )}

                            {/* Register New Child Link */}
                            <TouchableOpacity
                                style={styles.registerLinkContainer}
                                onPress={() => {
                                    setShowChildPicker(false);
                                    router.push('./register-child');
                                }}
                            >
                                <Ionicons name="person-add-outline" size={18} color="#007AFF" />
                                <Text style={styles.registerLinkText}>Register a new child</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    addChildButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
    addChildButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    childSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    childSelectorLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    childSelectorText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    childOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    childOptionSelected: {
        backgroundColor: '#EFF6FF',
    },
    childOptionText: {
        flex: 1,
    },
    childOptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    childOptionAge: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: '#F3F4F6',
    },
    tabButtonActive: {
        backgroundColor: '#DBEAFE',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#1D4ED8',
    },
    icon: {
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    gameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
    },
    gameIcon: {
        marginRight: 16,
    },
    gameName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
    },
    logMain: {
        flex: 1,
    },
    logMeta: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    logDuration: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B45309',
    },
    removeButton: {
        padding: 4,
    },
    emptyGamesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyGamesText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
        textAlign: 'center',
    },
    emptyGamesSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 64,
    },
    footerContainer: {
        padding: 24,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonIcon: {
        fontSize: 18,
        color: '#fff',
        marginRight: 10,
    },
    addButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    emptyModalContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyModalText: {
        fontSize: 16,
        color: '#6B7280',
    },
    registerLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 8,
    },
    registerLinkText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 8,
    },
    registerButtonIcon: {
        marginRight: 4,
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});