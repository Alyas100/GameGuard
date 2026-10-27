import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Import your API functions
import { fetchGames } from '../../lib/api/report/games_autocomplete';
// Note: You need to make sure this path is correct from the 'app/onboarding' folder
// You might need to change it to: '../lib/api/report/games_autocomplete'

export default function MonitorGamesScreen() {
    const params = useLocalSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // This state holds the games the user has selected
    const [monitoredGames, setMonitoredGames] = useState([]);

    // --- Debounced Search Logic (Same as your other screens) ---
    useEffect(() => {
        const timerId = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                loadSuggestions();
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

    const loadSuggestions = async () => {
        setIsLoading(true);
        try {
            const data = await fetchGames(searchQuery);
            setSuggestions(data);
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
        }
        setIsLoading(false);
    };
    // --- End of Search Logic ---

    // Function to add a game to the list
    const selectGame = (game) => {
        // Prevent adding duplicates
        if (!monitoredGames.find(g => g.id === game.id)) {
            setMonitoredGames([...monitoredGames, game]);
        }
        setSearchQuery('');
        setSuggestions([]);
    };

    // Function to remove a game from the list
    const removeGame = (gameId) => {
        setMonitoredGames(monitoredGames.filter(g => g.id !== gameId));
    };

    // Function to finish onboarding
    const handleFinish = () => {
        // We only need to pass the IDs, not the whole objects
        const monitoredGameIds = monitoredGames.map(g => g.id);

        router.push({
            pathname: '/onboarding/all-set',
            params: {
                ...params, // Pass along name, ageRange, concerns
                monitoredGames: JSON.stringify(monitoredGameIds),
            },
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <Text style={styles.emoji}>📡</Text>

                    <Text style={styles.title}>
                        What games does your child play?
                    </Text>

                    <Text style={styles.subtitle}>
                        Add a few games to monitor. You can always change this later from your dashboard.
                    </Text>

                    {/* Search Bar Container */}
                    <View style={styles.searchWrapper}>
                        <View style={styles.searchInputContainer}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search for 'Roblox', 'Minecraft', etc..."
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {isLoading && <ActivityIndicator />}
                        </View>

                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item) => item.id.toString()}
                                style={styles.suggestionsList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.suggestionItem}
                                        onPress={() => selectGame(item)}
                                    >
                                        <Text style={styles.suggestionIcon}>🎮</Text>
                                        <Text style={styles.suggestionText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>

                    {/* Selected Games List */}
                    <Text style={styles.listTitle}>Games to Monitor</Text>
                    <View style={styles.selectedGamesContainer}>
                        {monitoredGames.length === 0 ? (
                            <Text style={styles.emptyListText}>No games added yet.</Text>
                        ) : (
                            monitoredGames.map(game => (
                                <View key={game.id} style={styles.selectedGameChip}>
                                    <Text style={styles.selectedGameName}>🎮 {game.name}</Text>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeGame(game.id)}
                                    >
                                        <Text style={styles.removeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <Text style={styles.stepIndicator}>Step 4 of 4</Text>
            </ScrollView>

            {/* This View pins the buttons to the bottom */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleFinish}>
                    <Text style={styles.buttonText}>Finish Setup</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/dashboard')}>
                    <Text style={styles.skipButtonText}>Skip setup</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// These styles are consistent with your other pages
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    contentContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 24,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF',
        textAlign: 'center',
        paddingBottom: 16,
    },
    // --- Search Bar Styles (from Report Screen) ---
    searchWrapper: {
        position: 'relative', // For the absolute-positioned dropdown
        zIndex: 10,
        marginBottom: 24,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    // --- Suggestions List Styles (from Dashboard) ---
    suggestionsList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    suggestionText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    // --- Selected Games List Styles ---
    listTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    selectedGamesContainer: {
        minHeight: 100, // Gives the list some space
    },
    emptyListText: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        paddingTop: 20,
    },
    selectedGameChip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EFF6FF', // Light blue
        borderWidth: 2,
        borderColor: '#3B82F6', // Primary blue
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    selectedGameName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3B82F6',
    },
    removeButton: {
        padding: 4,
    },
    removeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3B82F6',
    },
    // --- Footer Button Styles ---
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        flex: 2,
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    skipButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
});