import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { BACKEND_API_URL } from "../../config_base_url";
import { fetchBrowseGames } from '../../lib/api/Game_browse/search_games';

// func to fetch all genres
async function fetchAllGenres() {
    const res = await fetch(`${BACKEND_API_URL}/genres`);
    const data = await res.json();
    if (data.success) {
        return data.genres;
    }
    return [];
}

// Fetch carousel sections (trending, safer, etc.)
async function fetchCarouselGames(type = 'trending') {
    try {
        const endpoint =
            type === 'trending' ? `${BACKEND_API_URL}/browse?sortBy=reports&limit=6` :
                type === 'safer' ? `${BACKEND_API_URL}/browse?sortBy=safety&limit=6` :
                    `${BACKEND_API_URL}/browse?limit=6`;

        const res = await fetch(endpoint);
        const data = await res.json();
        return data.games || data.results || [];
    } catch (e) {
        console.warn(`Carousel fetch (${type}) failed:`, e);
        return [];
    }
}

const simplifyPlatforms = (platforms) => {
    const categories = new Set();
    for (const p of platforms) {
        const plat = p.toLowerCase();
        if (plat.includes('pc') || plat.includes('macos') || plat.includes('linux')) {
            categories.add('PC');
        } else if (plat.includes('playstation') || plat.includes('xbox') || plat.includes('nintendo')) {
            categories.add('Console');
        } else if (plat.includes('ios') || plat.includes('android')) {
            categories.add('Mobile');
        }
    }
    return Array.from(categories);
};

const shuffleArray = (items = []) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Skeleton Loader
const GameCardSkeleton = () => (
    <View style={styles.gameCard}>
        <View style={styles.gameCardHeader}>
            <View style={styles.gameInfo}>
                <View style={[styles.gameImage, { backgroundColor: '#E5E7EB' }]} />
                <View style={{ height: 18, backgroundColor: '#E5E7EB', borderRadius: 6, marginBottom: 8, width: '70%' }} />
                <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 4, width: '50%' }} />
            </View>
            <View style={{ width: 60, height: 60, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
        </View>
    </View>
);

// Carousel Card Component
const CarouselCard = ({ game, onPress }) => {
    const scoreColor = getScoreColor(game.riskScore);
    return (
        <TouchableOpacity style={styles.carouselCard} onPress={onPress}>
            <Image source={{ uri: game.imageUrl }} style={styles.carouselImage} />
            <Text numberOfLines={1} style={styles.carouselTitle}>{game.name}</Text>
            <View style={[styles.carouselScore, { backgroundColor: scoreColor }]}>
                <Text style={styles.carouselScoreText}>{game.riskScore}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function GameBrowserScreen() {
    const sortButtonRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('safety');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [sortDropdownTop, setSortDropdownTop] = useState(230);
    const [allGenres, setAllGenres] = useState([]);

    // Carousel sections
    const [trendingGames, setTrendingGames] = useState([]);
    const [saferGames, setSaferGames] = useState([]);
    const [carouselLoading, setCarouselLoading] = useState(true);

    const sortOptions = [
        { value: 'safety', label: 'Safety' },
        { value: 'name', label: 'Name' },
        { value: 'age', label: 'Age' },
        { value: 'reports', label: 'Reports' }
    ];

    const [filters, setFilters] = useState({
        ageRange: null,
        platforms: [],
        excludeRisks: [],
        islamicOnly: false,
        minSafetyScore: 0,
        genres: [],
    });

    const [tempFilters, setTempFilters] = useState(filters);

    // Fetch genres on load
    useEffect(() => {
        fetchAllGenres().then(genres => {
            setAllGenres(genres);
            console.log("Loaded genres:", genres);
        });
    }, []);

    // Fetch carousel sections on load (lazy)
    useEffect(() => {
        setCarouselLoading(true);
        Promise.all([
            fetchCarouselGames('trending'),
            fetchCarouselGames('safer')
        ]).then(([trending, safer]) => {
            setTrendingGames(shuffleArray(trending));
            setSaferGames(shuffleArray(safer));
            setCarouselLoading(false);
        });
    }, []);

    // Fetch games when filters change
    useEffect(() => {
        const loadGames = async () => {
            setIsLoading(true);
            const fetchedGames = await fetchBrowseGames({
                searchQuery,
                filters,
                sortBy
            });
            setGames(fetchedGames);
            setIsLoading(false);
        };
        loadGames();
    }, [searchQuery, filters, sortBy]);

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.ageRange) count++;
        if (filters.platforms.length > 0) count += filters.platforms.length;
        if (filters.excludeRisks.length > 0) count += filters.excludeRisks.length;
        if (filters.islamicOnly) count++;
        if (filters.minSafetyScore > 0) count++;
        return count;
    };

    const toggleArrayFilter = (key, value) => {
        setTempFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter(item => item !== value)
                : [...prev[key], value]
        }));
    };

    const applyFiltersFromModal = () => {
        setFilters(tempFilters);
        setShowFilterModal(false);
    };

    const clearAllFilters = () => {
        const emptyFilters = {
            ageRange: null,
            platforms: [],
            excludeRisks: [],
            islamicOnly: false,
            minSafetyScore: 0,
            genres: [],
        };
        setTempFilters(emptyFilters);
        setFilters(emptyFilters);
    };

    const handleGamePress = (game) => {
        router.push({
            pathname: "/GameDetailScreen",
            params: { gameName: game.name }
        });
    };

    const openSortDropdown = () => {
        if (!sortButtonRef.current?.measureInWindow) {
            setShowSortDropdown(true);
            return;
        }

        sortButtonRef.current.measureInWindow((x, y, width, height) => {
            setSortDropdownTop(Math.max(12, y + height + 6));
            setShowSortDropdown(true);
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>

                    <Text style={styles.headerTitle}>Browse Games</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search games..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter/Sort Bar */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterBar}
                >
                    <TouchableOpacity
                        style={[styles.filterBtn, getActiveFilterCount() > 0 && styles.filterBtnActive]}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Text style={[styles.filterBtnText, getActiveFilterCount() > 0 && styles.filterBtnTextActive]}>
                            Filters
                        </Text>
                        {getActiveFilterCount() > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>




                </ScrollView>

                {/* --- CAROUSEL SECTIONS (NEW) --- */}
                {!carouselLoading && trendingGames.length > 0 && searchQuery === '' && getActiveFilterCount() === 0 && filters.islamicOnly === false && filters.minSafetyScore === 0 && (
                    <View style={styles.carouselSection}>
                        <Text style={styles.carouselTitle}>Trending Now</Text>

                        <FlatList
                            data={trendingGames}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(i) => String(i.id)}
                            renderItem={({ item }) => (
                                <CarouselCard game={item} onPress={() => handleGamePress(item)} />
                            )}
                            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                        />
                    </View>
                )}

                {!carouselLoading && saferGames.length > 0 && searchQuery === '' && getActiveFilterCount() === 0 && filters.islamicOnly === false && filters.minSafetyScore === 0 && (
                    <View style={styles.carouselSection}>
                        <Text style={styles.carouselTitle}>Safer Picks</Text>

                        <FlatList
                            data={saferGames}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(i) => String(i.id)}
                            renderItem={({ item }) => (
                                <CarouselCard game={item} onPress={() => handleGamePress(item)} />
                            )}
                            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                            scrollEnabled={true}
                            nestedScrollEnabled={true}
                        />
                    </View>
                )}

                {/* Results Header */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>
                        Showing {games.length} games
                    </Text>
                    <TouchableOpacity ref={sortButtonRef} style={styles.sortButton} onPress={openSortDropdown}>
                        <Text style={styles.sortButtonText}>
                            {sortOptions.find(opt => opt.value === sortBy).label}
                        </Text>
                        <Text style={styles.sortArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>

                {/* Loading Skeleton */}
                {isLoading && (
                    <>
                        <GameCardSkeleton />
                        <GameCardSkeleton />
                    </>
                )}

                {/* Game Cards */}
                {!isLoading && games.map(game => {
                    const scoreColor = getScoreColor(game.riskScore);
                    const simplified = simplifyPlatforms(game.platform);

                    return (
                        <TouchableOpacity key={game.id} style={styles.gameCard}
                            onPress={() => handleGamePress(game)}>
                            <View style={styles.gameCardHeader}>
                                <View style={styles.gameInfo}>
                                    <Image
                                        source={{ uri: game.imageUrl }}
                                        style={styles.gameImage}
                                    />
                                    <Text style={styles.gameName}>{game.name}</Text>
                                    <View style={styles.gameMeta}>
                                        <Text style={styles.gameMetaText}>
                                            Age {game.ageRating || 'N/A'} • {game.price || 'N/A'}
                                        </Text>
                                        <Text style={styles.gameMetaText}>
                                            {simplified.length > 0 ? simplified.join(', ') : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.safetyScore}>
                                    <Text style={[styles.scoreLarge, { color: scoreColor }]}>
                                        {game.riskScore !== null ? game.riskScore : 'N/A'}
                                    </Text>
                                    <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                                        {game.riskScore >= 7 ? 'SAFE' : (game.riskScore >= 5 ? 'MODERATE' : 'HIGH RISK')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Sort Dropdown Modal */}
            <Modal
                visible={showSortDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSortDropdown(false)}
            >
                <TouchableOpacity
                    style={[styles.sortModalOverlay, { paddingTop: sortDropdownTop }]}
                    activeOpacity={1}
                    onPressOut={() => setShowSortDropdown(false)}
                >
                    <View style={styles.sortDropdown}>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.sortOption}
                                onPress={() => {
                                    setSortBy(option.value);
                                    setShowSortDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.sortOptionText,
                                    sortBy === option.value && styles.sortOptionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Filter Modal (keep as-is from original) */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Filter Games</Text>
                                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                    <Text style={styles.modalClose}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterSectionTitle}>AGE APPROPRIATENESS</Text>
                                <View style={styles.filterChips}>
                                    {['3-7', '8-12', '13-16', '17+'].map(age => (
                                        <TouchableOpacity
                                            key={age}
                                            style={[
                                                styles.filterChip,
                                                tempFilters.ageRange === age && styles.filterChipSelected
                                            ]}
                                            onPress={() => setTempFilters(prev => ({
                                                ...prev,
                                                ageRange: prev.ageRange === age ? null : age
                                            }))}
                                        >
                                            <Text style={[
                                                styles.filterChipText,
                                                tempFilters.ageRange === age && styles.filterChipTextSelected
                                            ]}>
                                                {age} years
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterSectionTitle}>PLATFORM</Text>
                                <View style={styles.filterChips}>
                                    {[{ label: 'Mobile', value: 'Mobile' }, { label: 'PC', value: 'PC' }, { label: 'Console', value: 'Console' }].map(platform => (
                                        <TouchableOpacity
                                            key={platform.value}
                                            style={[
                                                styles.filterChip,
                                                tempFilters.platforms.includes(platform.value) && styles.filterChipSelected
                                            ]}
                                            onPress={() => toggleArrayFilter('platforms', platform.value)}
                                        >
                                            <Text style={[
                                                styles.filterChipText,
                                                tempFilters.platforms.includes(platform.value) && styles.filterChipTextSelected
                                            ]}>
                                                {platform.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterSectionTitle}>GENRE</Text>
                                <View style={styles.filterChips}>
                                    {allGenres.map(genreName => (
                                        <TouchableOpacity
                                            key={genreName}
                                            style={[
                                                styles.filterChip,
                                                tempFilters.genres.includes(genreName) && styles.filterChipSelected
                                            ]}
                                            onPress={() => toggleArrayFilter('genres', genreName)}
                                        >
                                            <Text style={[
                                                styles.filterChipText,
                                                tempFilters.genres.includes(genreName) && styles.filterChipTextSelected
                                            ]}>
                                                {genreName}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.filterSection}>
                                <Text style={styles.filterSectionTitle}>EXCLUDE THESE RISKS</Text>
                                <View style={styles.filterChips}>
                                    {[
                                        { label: 'Violence', value: 'violence' },
                                        { label: 'Predatory', value: 'predatory' },
                                        { label: 'Sexual', value: 'sexual' },
                                        { label: 'Bullying', value: 'bullying' },
                                        { label: 'Scams', value: 'scams' },
                                    ].map(risk => (
                                        <TouchableOpacity
                                            key={risk.value}
                                            style={[
                                                styles.filterChip,
                                                tempFilters.excludeRisks.includes(risk.value) && styles.filterChipSelected
                                            ]}
                                            onPress={() => toggleArrayFilter('excludeRisks', risk.value)}
                                        >
                                            <Text style={[
                                                styles.filterChipText,
                                                tempFilters.excludeRisks.includes(risk.value) && styles.filterChipTextSelected
                                            ]}>
                                                {risk.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.filterActions}>
                                <TouchableOpacity style={styles.filterClear} onPress={clearAllFilters}>
                                    <Text style={styles.filterClearText}>Clear All</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.filterApply} onPress={applyFiltersFromModal}>
                                    <Text style={styles.filterApplyText}>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Helper functions
const getRiskColor = (score) => {
    if (score >= 70) return '#EF4444';
    if (score >= 40) return '#F59E0B';
    return '#10B981';
};

const getScoreColor = (score) => {
    if (score >= 7) return '#10B981';
    if (score >= 5) return '#F59E0B';
    return '#EF4444';
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    backBtnText: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 90
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    filterBar: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        marginRight: 8,
    },
    filterBtnActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    filterBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    filterBtnTextActive: {
        color: '#3B82F6',
    },
    filterBadge: {
        backgroundColor: '#3B82F6',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 6,
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // --- NEW CAROUSEL STYLES ---
    carouselSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    carouselHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    carouselTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    carouselViewAll: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3B82F6',
    },
    carouselCard: {
        width: 140,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    carouselImage: {
        width: '100%',
        height: 100,
        backgroundColor: '#E5E7EB',
    },
    carouselCardTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        padding: 8,
        paddingBottom: 4,
    },
    carouselScore: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselScoreText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    resultsCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    sortButton: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        alignItems: 'center',
    },
    sortButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    sortArrow: {
        fontSize: 10,
        color: '#6B7280',
        marginLeft: 4,
    },
    sortModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
    },
    sortDropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        overflow: 'hidden',
    },
    sortOption: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sortOptionText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },
    sortOptionTextActive: {
        color: '#3B82F6',
        fontWeight: '700',
    },
    gameCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    gameCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gameInfo: {
        flex: 1,
    },
    gameImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#E5E7EB',
    },
    gameName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    gameMeta: {
        gap: 4,
    },
    gameMetaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    safetyScore: {
        alignItems: 'flex-end',
    },
    scoreLarge: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalClose: {
        fontSize: 24,
        color: '#6B7280',
    },
    filterSection: {
        marginBottom: 24,
    },
    filterSectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    filterChipSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    filterChipTextSelected: {
        color: '#3B82F6',
    },
    filterActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    filterClear: {
        flex: 1,
        padding: 14,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    filterClearText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    filterApply: {
        flex: 2,
        padding: 14,
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    filterApplyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});