import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getMonitoredGamesByChild } from '../../../lib/api/profile/get_monitored_games';
import { getChildrenByParent } from '../../../lib/api/quick_actions/link-child-device/get_children';
import { logScreenTime } from '../../../lib/api/screen-time/log_screen_time';

export default function LogScreenTimeScreen() {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showChildPicker, setShowChildPicker] = useState(false);
    const [showGamePicker, setShowGamePicker] = useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchGames();
        }
    }, [selectedChild]);

    const fetchChildren = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User not logged in');
                return;
            }

            const response = await getChildrenByParent(parseInt(userId));
            const childrenArray = response.children || response;
            setChildren(childrenArray);

            if (childrenArray.length > 0) {
                setSelectedChild(childrenArray[0]);
            }
        } catch (error) {
            console.error('Error fetching children:', error);
            Alert.alert('Error', 'Failed to load children');
        } finally {
            setLoading(false);
        }
    };

    const fetchGames = async () => {
        try {
            const gamesData = await getMonitoredGamesByChild(selectedChild.id);
            setGames(gamesData);
            setSelectedGame(null);
        } catch (error) {
            console.error('Error fetching games:', error);
            setGames([]);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!selectedChild) {
            Alert.alert('Required', 'Please select a child');
            return;
        }

        if (!selectedGame) {
            Alert.alert('Required', 'Please select a game');
            return;
        }

        const hoursNum = parseInt(hours) || 0;
        const minutesNum = parseInt(minutes) || 0;

        if (hoursNum === 0 && minutesNum === 0) {
            Alert.alert('Required', 'Please enter the duration');
            return;
        }

        if (hoursNum < 0 || minutesNum < 0 || minutesNum >= 60) {
            Alert.alert('Invalid', 'Please enter valid hours (0+) and minutes (0-59)');
            return;
        }

        const totalMinutes = hoursNum * 60 + minutesNum;

        try {
            setSaving(true);

            await logScreenTime({
                childId: selectedChild.id,
                gameId: selectedGame.id,
                durationMinutes: totalMinutes,
                logDate: date,
            });

            Alert.alert(
                'Success!',
                `Screen time logged: ${hoursNum}h ${minutesNum}m for ${selectedGame.name}`,
                [
                    {
                        text: 'Log Another',
                        onPress: () => {
                            setHours('');
                            setMinutes('');
                            setSelectedGame(null);
                        },
                    },
                    {
                        text: 'Done',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error logging screen time:', error);
            Alert.alert('Error', 'Failed to log screen time. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Log Screen Time' }} />
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
                <Stack.Screen options={{ title: 'Log Screen Time' }} />
                <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyTitle}>No Children Registered</Text>
                    <Text style={styles.emptySubtitle}>
                        Please register a child first to log screen time
                    </Text>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('/profile/register-child')}
                    >
                        <Text style={styles.registerButtonText}>Register Child</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Log Screen Time' }} />

            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Header Icon */}
                    <View style={styles.headerIcon}>
                        <Ionicons name="time-outline" size={64} color="#007AFF" />
                    </View>
                    <Text style={styles.headerTitle}>Log Gaming Time</Text>
                    <Text style={styles.headerSubtitle}>
                        Track how long your child has been playing
                    </Text>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Child Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Child *</Text>
                            <TouchableOpacity
                                style={styles.selector}
                                onPress={() => setShowChildPicker(true)}
                            >
                                <Text style={styles.selectorText}>
                                    {selectedChild ? selectedChild.childName : 'Select Child'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Game Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Game *</Text>
                            <TouchableOpacity
                                style={styles.selector}
                                onPress={() => setShowGamePicker(true)}
                                disabled={!selectedChild || games.length === 0}
                            >
                                <Text
                                    style={[
                                        styles.selectorText,
                                        !selectedChild || games.length === 0
                                            ? styles.selectorTextDisabled
                                            : {},
                                    ]}
                                >
                                    {selectedGame
                                        ? selectedGame.name
                                        : games.length === 0
                                            ? 'No monitored games'
                                            : 'Select Game'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Duration */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Duration *</Text>
                            <View style={styles.durationRow}>
                                <View style={styles.durationInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={hours}
                                        onChangeText={setHours}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={styles.durationLabel}>hours</Text>
                                </View>
                                <View style={styles.durationInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        value={minutes}
                                        onChangeText={setMinutes}
                                        keyboardType="number-pad"
                                        maxLength={2}
                                    />
                                    <Text style={styles.durationLabel}>minutes</Text>
                                </View>
                            </View>
                        </View>

                        {/* Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date</Text>
                            <View style={styles.dateDisplay}>
                                <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                                <Text style={styles.dateText}>{date}</Text>
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save Log</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Child Picker Modal */}
            <Modal visible={showChildPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Child</Text>
                            <TouchableOpacity onPress={() => setShowChildPicker(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {children.map((child) => (
                                <TouchableOpacity
                                    key={child.id}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        setSelectedChild(child);
                                        setShowChildPicker(false);
                                    }}
                                >
                                    <Ionicons name="person-circle" size={32} color="#007AFF" />
                                    <Text style={styles.modalOptionText}>{child.childName}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Game Picker Modal */}
            <Modal visible={showGamePicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Game</Text>
                            <TouchableOpacity onPress={() => setShowGamePicker(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {games.length === 0 ? (
                                <View style={styles.emptyModal}>
                                    <Text style={styles.emptyModalText}>
                                        No monitored games for this child
                                    </Text>
                                </View>
                            ) : (
                                games.map((game) => (
                                    <TouchableOpacity
                                        key={game.id}
                                        style={styles.modalOption}
                                        onPress={() => {
                                            setSelectedGame(game);
                                            setShowGamePicker(false);
                                        }}
                                    >
                                        <Ionicons
                                            name="game-controller-outline"
                                            size={32}
                                            color="#007AFF"
                                        />
                                        <Text style={styles.modalOptionText}>{game.name}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
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
        backgroundColor: '#F9FAFB',
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
    registerButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    headerIcon: {
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    selectorText: {
        fontSize: 16,
        color: '#1F2937',
    },
    selectorTextDisabled: {
        color: '#9CA3AF',
    },
    durationRow: {
        flexDirection: 'row',
        gap: 12,
    },
    durationInput: {
        flex: 1,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 8,
    },
    durationLabel: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    dateDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    dateText: {
        fontSize: 16,
        color: '#1F2937',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        backgroundColor: '#93C5FD',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
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
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    emptyModal: {
        padding: 32,
        alignItems: 'center',
    },
    emptyModalText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});
