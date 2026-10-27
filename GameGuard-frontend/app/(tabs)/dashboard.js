import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next'; // <-- 1. Import the hook


import {
    Dimensions,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { getUserProfile } from "../../lib/api/auth/getUserProfile";
import { getTrendingAlerts } from "../../lib/api/dashboard/get_trending_alerts";
import { fetchGames } from "../../lib/api/report/games_autocomplete";



// Mock data (replace with API calls later)
const mockData = {
    stats: {
        gamesMonitored: 13,
        reportsSubmitted: 47,
        highRiskGames: 5
    },
    recentReports: [
        {
            id: 1,
            game: 'Roblox',
            date: '2 days ago',
            description: 'Player asking for personal info in private messages',
            risks: { predatory: 92, violence: 5, sexual: 15 }
        },

    ]
};

export default function ParentDashboard() {
    const { t } = useTranslation(); // <-- 2. Get the 't' (translate) function
    const bannerScrollRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('Parent'); // default fallback
    const [userNameLoading, setUserNameLoading] = useState(true);
    const [trendingAlerts, setTrendingAlerts] = useState([]);
    const [alertsLoading, setAlertsLoading] = useState(true);
    const [bannerIndex, setBannerIndex] = useState(0);
    const [bannerWidth, setBannerWidth] = useState(Dimensions.get('window').width);

    // Fetch user name from DB on mount
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    console.warn('No userId found in storage');
                    setUserNameLoading(false);
                    return;
                }

                const user = await getUserProfile(userId);
                if (user?.name) {
                    setUserName(user.name);
                }
            } catch (err) {
                console.error('Error fetching user name:', err);
            } finally {
                setUserNameLoading(false);
            }
        };

        fetchUserName();
    }, []); // Run once on mount

    // Fetch trending alerts on mount
    useEffect(() => {
        const fetchTrendingAlerts = async () => {
            try {
                const alerts = await getTrendingAlerts();
                setTrendingAlerts(alerts);
            } catch (err) {
                console.error('Error fetching trending alerts:', err);
                setTrendingAlerts([]); // Set to empty array on error
            } finally {
                setAlertsLoading(false);
            }
        };

        fetchTrendingAlerts();
    }, []); // Run once on mount

    // --- ADDED ---
    // This useEffect hook debounces the search. It waits 300ms after
    // the user stops typing before calling the API.
    useEffect(() => {
        // Set up a timer
        const timerId = setTimeout(() => {
            // Only fetch if query is not empty
            if (searchQuery.trim().length > 0) {
                loadSuggestions();
            } else {
                setSuggestions([]); // Clear suggestions if search is empty
            }
        }, 300); // 300ms delay

        // This is the cleanup function
        return () => {
            clearTimeout(timerId); // Clear the timer if the user types again
        };
    }, [searchQuery]); // This effect re-runs every time searchQuery changes

    // --- ADDED ---
    // Function to call your API
    const loadSuggestions = async () => {
        setIsLoading(true);
        try {
            const data = await fetchGames(searchQuery);
            setSuggestions(data);
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
            setSuggestions([]); // Clear on error
        }
        setIsLoading(false);
    };

    // this is search button on the search bar
    const handleSearchSubmit = () => {
        if (searchQuery.trim().length > 0) {
            console.log("Navigating via search button:", searchQuery);

            // --- THIS IS THE CHANGE ---
            // Navigate to the file 'app/GameDetailsScreen.js' and
            // pass the game name as a parameter.
            router.push({
                pathname: "/GameDetailScreen",
                params: { gameName: searchQuery.trim() }
            });
            // --- END CHANGE ---

            setSearchQuery('');
            setSuggestions([]);
        }
    };

    // --- ADDED ---
    // Function to handle when a user taps a suggestion
    const handleSuggestionPress = (game) => {
        console.log("Navigating to game:", game.name);


        router.push({
            pathname: "/GameDetailScreen",
            params: { gameName: game.name }
        });
        // Clear the search query and suggestions list
        setSearchQuery('');
        setSuggestions([]);
    };


    const getRiskColor = (score) => {
        if (score >= 70) return '#EF4444'; // Red
        if (score >= 40) return '#F59E0B'; // Orange
        return '#10B981'; // Green
    };

    const getSeverityColor = (severity) => {
        if (severity === 'high') return '#EF4444';
        if (severity === 'medium') return '#F59E0B';
        return '#10B981';
    };

    const getTopRisk = (risks) => {
        const entries = Object.entries(risks);
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        return { category: sorted[0][0], score: sorted[0][1] };
    };

    const getSeverityBgColor = (severity) => {
        if (severity === 'high') return '#FEE2E2';
        if (severity === 'medium') return '#FEF3C7';
        return '#DEF7EC';
    };

    useEffect(() => {
        if (!bannerWidth) return;

        const timer = setInterval(() => {
            setBannerIndex((prev) => (prev + 1) % 3);
        }, 4000);

        return () => clearInterval(timer);
    }, [bannerWidth]);

    useEffect(() => {
        if (!bannerWidth || !bannerScrollRef.current) return;

        bannerScrollRef.current.scrollTo({
            x: bannerIndex * bannerWidth,
            animated: true,
        });
    }, [bannerIndex, bannerWidth]);

    return (
        // Wrap everything in a SafeAreaView and set the main container background to the theme background color
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>


                {/* --- AUTO-SLIDING BANNER --- */}
                <View
                    style={[styles.bannerContainer, { marginTop: -50 }]}
                    onLayout={(e) => setBannerWidth(e.nativeEvent.layout.width)}
                >
                    <ScrollView
                        ref={bannerScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        onMomentumScrollEnd={(e) => {
                            if (!bannerWidth) return;
                            const nextIndex = Math.round(e.nativeEvent.contentOffset.x / bannerWidth);
                            setBannerIndex(nextIndex);
                        }}
                    >
                        {/* Slide 1 */}
                        <ImageBackground
                            source={{ uri: "https://picsum.photos/800/400?random=1" }}
                            style={[styles.slide, { width: bannerWidth }]}
                        >
                            <View style={styles.overlay}>
                                <Text style={styles.bannerTag}>LIVE WITH CONFIDENCE</Text>
                                <Text style={styles.bannerTitle}>Game Guardian</Text>
                                <Text style={styles.bannerSubtitle}>Keep your kids safe while gaming. Monitor, report, learn.</Text>
                                <TouchableOpacity style={styles.bannerButton}>
                                    <Text style={styles.bannerButtonText}>Learn more →</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>

                        {/* Slide 2 */}
                        <ImageBackground
                            source={{ uri: "https://picsum.photos/800/400?random=2" }}
                            style={[styles.slide, { width: bannerWidth }]}
                        >
                            <View style={styles.overlay}>
                                <Text style={styles.bannerTag}>STAY SAFE</Text>
                                <Text style={styles.bannerTitle}>Parental Control</Text>
                                <Text style={styles.bannerSubtitle}>Monitor your child's gameplay in real time.</Text>
                                <TouchableOpacity style={styles.bannerButton}>
                                    <Text style={styles.bannerButtonText}>Explore →</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>

                        {/* Slide 3 */}
                        <ImageBackground
                            source={{ uri: "https://picsum.photos/800/400?random=3" }}
                            style={[styles.slide, { width: bannerWidth }]}
                        >
                            <View style={styles.overlay}>
                                <Text style={styles.bannerTitle}>Stay Informed</Text>
                                <Text style={styles.bannerSubtitle}>Latest alerts and guidance for parents and kids.</Text>
                                <TouchableOpacity
                                    style={styles.bannerButton}
                                    onPress={() => router.push('/read-more')}
                                >
                                    <Text style={styles.bannerButtonText}>Read More →</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </ScrollView>

                    <View style={styles.dotsContainer}>
                        {[0, 1, 2].map((i) => (
                            <View key={i} style={[styles.dot, bannerIndex === i && styles.dotActive]} />
                        ))}
                    </View>
                </View>


                {/* White Card Container for Quick Links */}
                <View style={styles.quickLinksContainer}>
                    <View style={styles.quickLinksGrid}>
                        <TouchableOpacity
                            style={styles.quickLinkCard}
                            onPress={() => router.push("/quick-actions-menu/link-child-device")}
                        >
                            <Ionicons name="people-outline" size={30} color="#007AFF" />
                            <Text style={styles.quickLinkLabel}>Manage Children</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickLinkCard}
                            onPress={() => router.push('/quick-actions-menu/quick-report')}
                        >
                            <Ionicons name="alert-circle" size={30} color="#007AFF" />
                            <Text style={styles.quickLinkLabel}>Quick Report</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickLinkCard}
                            onPress={() => router.push("/profile/monitored-games")}
                        >
                            <Ionicons name="game-controller-outline" size={30} color="#007AFF" />
                            <Text style={styles.quickLinkLabel}>Monitored Games</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickLinkCard}
                            onPress={() => router.push('/quick-actions-menu/log-screen-time')}
                        >
                            <Ionicons name="time-outline" size={30} color="#007AFF" />
                            <Text style={styles.quickLinkLabel}>Log Screen Time</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickLinkCard}
                            onPress={() => router.push('/view_analytics')}
                        >
                            <Ionicons name="analytics-outline" size={30} color="#007AFF" />
                            <Text style={styles.quickLinkLabel}>View Analytics</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickLinkCard}
                            onPress={() => router.push('/support')}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={30} color="#007AFF" />
                            <Text style={styles.quickLinkLabel}>Support</Text>
                        </TouchableOpacity>

                    </View>
                </View>


                {/* 3. MAIN CONTENT (STARTS BELOW THE CURVE) */}
                <View style={styles.mainContent}>
                    {/* Quick Stats */}
                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, styles.bgBlue]}>
                            <Text style={styles.statNumber}>{mockData.stats.gamesMonitored}</Text>
                            <Text style={styles.statLabel}>{t('dashboard.gamesMonitored')}</Text>
                        </View>
                        <View style={[styles.statCard, styles.bgPurple]}>
                            <Text style={styles.statNumber}>{mockData.stats.reportsSubmitted}</Text>
                            <Text style={styles.statLabel}>{t('dashboard.reportsSubmitted')}</Text>
                        </View>
                        <View style={[styles.statCard, styles.bgRed]}>
                            <Text style={styles.statNumber}>{mockData.stats.highRiskGames}</Text>
                            <Text style={styles.statLabel}>{t('dashboard.highRiskGames')}</Text>
                        </View>
                    </View>

                    {/* Trending Alerts */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{t('dashboard.trendingAlerts')}</Text>

                        </View>

                        {alertsLoading ? (
                            <View style={styles.emptyStateContainer}>
                                <Text style={styles.emptyStateText}>Loading alerts...</Text>
                            </View>
                        ) : trendingAlerts.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateText}>No trending alerts at the moment</Text>
                                <Text style={styles.emptyStateSubtext}>Check back later for updates</Text>
                            </View>
                        ) : (
                            trendingAlerts.map((alert) => {
                                const getAlertIcon = () => {
                                    switch (alert.type) {
                                        case 'most_reported':
                                            return 'warning-outline';
                                        case 'spike':
                                            return 'trending-up';
                                        case 'high_risk_content':
                                            return 'alert-circle-outline';
                                        case 'community_trend':
                                            return 'stats-chart-outline';
                                        default:
                                            return 'notifications-outline';
                                    }
                                };

                                const getAlertTypeLabel = () => {
                                    switch (alert.type) {
                                        case 'most_reported':
                                            return 'Most Reported';
                                        case 'spike':
                                            return 'Report Spike';
                                        case 'high_risk_content':
                                            return 'High-Risk Content';
                                        case 'community_trend':
                                            return 'Community Trend';
                                        default:
                                            return 'Alert';
                                    }
                                };

                                return (
                                    <View key={alert.id} style={styles.alertCard}>
                                        <View style={styles.alertLeft}>
                                            <View
                                                style={[
                                                    styles.alertIndicator,
                                                    { backgroundColor: getSeverityColor(alert.severity) }
                                                ]}
                                            >
                                                <Ionicons
                                                    name={getAlertIcon()}
                                                    size={16}
                                                    color="#FFFFFF"
                                                />
                                            </View>
                                            <View style={styles.alertContent}>
                                                <View style={styles.alertTypeRow}>
                                                    <Text style={styles.alertType}>{getAlertTypeLabel()}</Text>
                                                </View>
                                                <Text style={styles.alertGame}>{alert.game}</Text>
                                                <Text style={styles.alertCategory}>{alert.description || alert.category}</Text>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                styles.alertBadge,
                                                { backgroundColor: getSeverityBgColor(alert.severity) }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.alertChange,
                                                    { color: getSeverityColor(alert.severity) }
                                                ]}
                                            >
                                                {alert.change || alert.reportCount}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    {/* Bottom Spacing */}
                    <View style={{ height: 30 }} />
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({

    slide: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.25)',
        padding: 20,
        paddingBottom: 96, // Push content a bit higher as banner extends behind quick actions
        alignItems: 'center',
    },

    // Add inside styles = StyleSheet.create({ ... })

    bannerContainer: {
        width: '100%',
        height: 420,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        marginBottom: 8,
        marginTop: 0,

    },
    bannerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    quickLinksContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 16,
        marginTop: -82, // pull card further up so banner image extends behind it
        marginBottom: 20, // Add this to control space below

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
    },
    bannerTag: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1.5,
        marginBottom: 8,
        opacity: 0.9,
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
        opacity: 0.95,
    },
    bannerButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    bannerButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004E89',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        opacity: 0.4,
    },
    dotActive: {
        opacity: 1,
        width: 24,
    },

    quickLinksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 0,
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    quickLinkCard: {
        width: '31%',
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickLinkIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    quickLinkLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    mainContent: {
        paddingTop: 10,
    },
    safeArea: {
        flex: 1,
        // Light background for the overall screen
        paddingTop: 0, // Remove top padding

    },
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        marginTop: -50, // Remove any top margin

        // The ScrollView takes up the full space, allowing all content to scroll
    },
    // --- NEW STYLES FOR CURVED HEADER ---
    curvedHeaderBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200, // Height of the blue area before the curve
        backgroundColor: '#2563EB', // Royal Blue
        borderBottomLeftRadius: 30, // Large radius for the curve
        borderBottomRightRadius: 30, // Large radius for the curve
    },
    headerContentWrapper: {
        // This wrapper helps position the header items relative to the ScrollView top
        // and ensures the search bar is contained within the scrollable area.
    },
    mainContent: {
        // Main content starts below where the curve ends
        paddingTop: 10, // A little padding to start the content below the curve
    },

    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: 50,

    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 4,
    },
    profileIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileText: {
        color: '#2563EB',
        fontSize: 20,
        fontWeight: 'bold',
    },
    searchWrapper: {
        position: 'relative',
        marginHorizontal: 20,
        marginBottom: 24,
        zIndex: 10, // Ensures suggestions appear on top of other content
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 20,
        marginRight: 12,
        color: '#6B7280', // Default gray icon

    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    searchButton: {
        backgroundColor: '#2563EB', // Blue color
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginLeft: 8, // Space between input and button
    },
    searchButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    suggestionsList: {
        position: 'absolute',
        top: '100%', // Positioned right below the search bar
        left: 0,
        right: 0,
        marginTop: 4, // Small gap
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 240, // Limit height
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
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.9,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    seeAll: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    alertCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    alertLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    alertIndicator: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContent: {
        flex: 1,
    },
    alertTypeRow: {
        marginBottom: 4,
    },
    alertType: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    alertGame: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    alertCategory: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    alertBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    alertChange: {
        fontSize: 14,
        fontWeight: '700',
    },
    reportCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reportGame: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    reportDate: {
        fontSize: 13,
        color: '#6B7280',
    },
    riskBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    riskBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    reportDescription: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 16,
    },
    riskIndicators: {
        marginBottom: 16,
    },
    riskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    riskCategory: {
        fontSize: 12,
        color: '#6B7280',
        width: 80,
        fontWeight: '500',
    },
    riskBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    riskBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    riskScore: {
        fontSize: 12,
        fontWeight: '700',
        width: 45,
        textAlign: 'right',
    },
    viewDetailsBtn: {
        paddingVertical: 10,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    viewDetailsBtnText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        justifyContent: 'space-between',
    },
    actionBtn: {
        width: '48%', // 100% - 4% margin = 96% total, 96%/2 = 48% each
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    islamicBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#059669',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    islamicIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    islamicContent: {
        flex: 1,
    },
    islamicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    islamicSubtitle: {
        fontSize: 13,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    islamicArrow: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    // Color styles
    bgBlue: {
        backgroundColor: '#3B82F6',
    },
    emptyStateContainer: {
        backgroundColor: '#FFFFFF',
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
        textAlign: 'center',
    },
    bgPurple: {
        backgroundColor: '#8B5CF6',
    },
    bgRed: {
        backgroundColor: '#EF4444',
    },
    bgGreen: {
        backgroundColor: '#10B981',
    },
    bgOrange: {
        backgroundColor: '#F59E0B',
    },
});