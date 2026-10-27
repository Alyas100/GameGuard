import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getAllGames, toggleGameMonitoring } from '../../lib/api/profile/get_monitored_games';

export default function AddGameScreen() {
    const params = useLocalSearchParams();
    const childId = params.childId ? parseInt(params.childId) : null;
    const childName = params.childName || 'child';

    const [searchQuery, setSearchQuery] = useState('');
    const [allGames, setAllGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null); // Track which game is being added

    useEffect(() => {
        fetchGames();
    }, []);

    useEffect(() => {
        // Filter games based on search query
        if (searchQuery.trim() === '') {
            setFilteredGames(allGames);
        } else {
            const lowercaseQuery = searchQuery.toLowerCase();
            const results = allGames.filter((game) =>
                game.name.toLowerCase().includes(lowercaseQuery)
            );
            setFilteredGames(results);
        }
    }, [searchQuery, allGames]);

    const fetchGames = async () => {
        try {
            setLoading(true);
            const games = await getAllGames();
            setAllGames(games);
            setFilteredGames(games);
        } catch (error) {
            console.error('Error fetching games:', error);
            Alert.alert('Error', 'Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGame = async (game) => {
        if (!childId) {
            Alert.alert('Error', 'No child selected');
            return;
        }

        try {
            setAdding(game.id);
            await toggleGameMonitoring(childId, game.id, true);

            Alert.alert(
                'Success',
                `${game.name} has been added to ${childName}'s monitored games`,
                [
                    {
                        text: 'Add Another',
                        style: 'default',
                    },
                    {
                        text: 'Done',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error adding game:', error);
            Alert.alert('Error', 'Failed to add game');
        } finally {
            setAdding(null);
        }
    };

    const renderGameItem = ({ item }) => (
        <TouchableOpacity
            style={styles.resultRow}
            onPress={() => handleAddGame(item)}
            disabled={adding === item.id}
        >
            <Ionicons name="game-controller-outline" size={24} color="#007AFF" style={styles.resultIcon} />
            <Text style={styles.resultName}>{item.name}</Text>
            {adding === item.id ? (
                <ActivityIndicator size="small" color="#007AFF" />
            ) : (
                <Ionicons name="add-circle" size={24} color="#10B981" />
            )}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Add New Game' }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading games...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Add New Game' }} />

            {/* Search Bar Area */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a game or app..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={true}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>
                    {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} found
                </Text>
            </View>

            {/* Search Results List */}
            <FlatList
                data={filteredGames}
                renderItem={renderGameItem}
                keyExtractor={(item) => item.id.toString()}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="game-controller-outline" size={64} color="#9CA3AF" />
                        <Text style={styles.emptyText}>No games found</Text>
                        <Text style={styles.emptySubtext}>Try a different search term</Text>
                    </View>
                }
            />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 16,
    },
    resultsHeader: {
        backgroundColor: '#F9FAFB',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    resultsCount: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#fff',
    },
    resultIcon: {
        marginRight: 16,
    },
    resultName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginLeft: 64,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    emptySubtext: {
        marginTop: 4,
        fontSize: 14,
        color: '#6B7280',
    },
});