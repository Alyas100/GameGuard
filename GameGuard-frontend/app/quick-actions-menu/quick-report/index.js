import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { submitQuickReport } from '../../../lib/api/quick_actions/quick-report/submit_quick_report';
import { fetchGames } from '../../../lib/api/report/games_autocomplete';

export default function QuickReportScreen() {
    const [gameName, setGameName] = useState('');
    const [gameId, setGameId] = useState(null);
    const [selectedConcern, setSelectedConcern] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const urgentConcerns = [
        { id: '🚨 Predatory Behavior', label: 'Predatory Behavior', icon: 'alert-circle' },
        { id: '🔞 Sexual Content', label: 'Sexual Content', icon: 'warning' },
        { id: '😢 Bullying', label: 'Bullying/Harassment', icon: 'sad' },
        { id: '💰 Scams', label: 'Scams/Fraud', icon: 'cash' },
        { id: '⚔️ Violence', label: 'Extreme Violence', icon: 'skull' },
        { id: '💬 Hate Speech', label: 'Hate Speech', icon: 'chatbubble-ellipses' },
    ];

    // Debounced game search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (gameName.trim().length > 0) {
                loadGameSuggestions();
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [gameName]);

    const loadGameSuggestions = async () => {
        try {
            const data = await fetchGames(gameName);
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Failed to fetch games:', err);
        }
    };

    const selectGame = (game) => {
        setGameName(game.name);
        setGameId(game.id);
        setShowSuggestions(false);
    };

    const handleSubmit = async () => {
        // Validation
        if (!gameName.trim()) {
            Alert.alert('Required', 'Please enter the game name');
            return;
        }

        if (!selectedConcern) {
            Alert.alert('Required', 'Please select the type of concern');
            return;
        }

        setLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');

            await submitQuickReport({
                gameName: gameName,
                gameId: gameId,
                concernType: selectedConcern,
                description: description,
                userId: userId,
            });

            Alert.alert(
                'Report Submitted! 🎉',
                'Thank you for helping keep the gaming community safe. We will review your report.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/dashboard'),
                    },
                ]
            );
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.urgentBadge}>
                            <Ionicons name="warning" size={24} color="#DC2626" />
                            <Text style={styles.urgentText}>URGENT REPORT</Text>
                        </View>
                        <Text style={styles.title}>Quick Report</Text>
                        <Text style={styles.subtitle}>
                            Report concerning behavior immediately. This is a simplified form for urgent situations.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* Game Name */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Game Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Type game name..."
                                value={gameName}
                                onChangeText={setGameName}
                                placeholderTextColor="#9CA3AF"
                            />

                            {/* Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <View style={styles.suggestionsBox}>
                                    {suggestions.slice(0, 5).map((game) => (
                                        <TouchableOpacity
                                            key={game.id}
                                            style={styles.suggestionItem}
                                            onPress={() => selectGame(game)}
                                        >
                                            <Ionicons name="game-controller" size={16} color="#6B7280" />
                                            <Text style={styles.suggestionText}>{game.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Concern Type */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Type of Concern *</Text>
                            <View style={styles.concernGrid}>
                                {urgentConcerns.map((concern) => (
                                    <TouchableOpacity
                                        key={concern.id}
                                        style={[
                                            styles.concernCard,
                                            selectedConcern === concern.id && styles.concernCardSelected,
                                        ]}
                                        onPress={() => setSelectedConcern(concern.id)}
                                    >
                                        <Ionicons
                                            name={concern.icon}
                                            size={24}
                                            color={selectedConcern === concern.id ? '#2563EB' : '#6B7280'}
                                        />
                                        <Text
                                            style={[
                                                styles.concernLabel,
                                                selectedConcern === concern.id && styles.concernLabelSelected,
                                            ]}
                                        >
                                            {concern.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Optional Description */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Additional Details (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Briefly describe what happened..."
                                value={description}
                                onChangeText={setDescription}
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={20} color="#FFFFFF" />
                                    <Text style={styles.submitButtonText}>Submit Report</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#2563EB" />
                            <Text style={styles.infoText}>
                                For detailed reports with screenshots, use the full Report form in the bottom menu in homepage.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        marginBottom: 16,
    },
    urgentText: {
        color: '#DC2626',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    suggestionsBox: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionText: {
        fontSize: 15,
        color: '#1F2937',
    },
    concernGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    concernCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    concernCardSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#2563EB',
    },
    concernLabel: {
        marginTop: 8,
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        textAlign: 'center',
    },
    concernLabelSelected: {
        color: '#2563EB',
    },
    submitButton: {
        backgroundColor: '#DC2626',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 10,
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#FCA5A5',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        padding: 12,
        marginTop: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 18,
    },
});
