// GameDetailScreen.js - Detailed information about a specific game
// Access via: /game/[gameName] or /game/[gameId]
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import rate_7 from '../assets/images/tags/Frame 1.png'; // age tag
import ContentDescriptor from '../components/ContentDescriptor';
import { BACKEND_API_URL } from "../config_base_url";
import { getGameDetailsByName, getSaferAlternatives } from '../lib/api/Game_details/fetch_reports';




// TODO: Replace with actual API call using the gameId/gameName from params
const mockGameData = {
    id: 1,
    name: 'Roblox',
    emoji: '🎮',
    shortDescription: 'A user-generated gaming platform where kids can play and create experiences with others online.',
    description: 'Roblox is an online platform and game creation system that allows users to program games and play games created by other users.',
    developer: 'Roblox Corporation',
    releaseYear: 2006,
    pegiRating: 16,
    pegiColor: '#F59E0B', // Orange/Amber for PEGI 16
    pegiDescriptor: 'Violence, Sexual Content, Bad Language', // The full text (for display later)

    // Official Content Descriptors and their required descriptions
    contentDescriptors: [
        {
            title: 'Violence',
            description: 'Realistic-looking violence against human characters and blood may be present.',
            icon: 'skull-outline'
        },
        {
            title: 'Bad Language',
            description: 'Strong, frequent bad language and sexual expletives are heard in chat.',
            icon: 'chatbubble-ellipses-outline'
        },
        {
            title: 'In-Game Purchases',
            description: 'Game contains paid items, including randomized loot box mechanics.',
            icon: 'cart-outline'
        },
    ],
    // --- END NEW DATA INSERTION ---

    platforms: ['Mobile', 'PC', 'Console'],

    // Overall Safety Score
    riskScore: 10.0,
    safetyRating: 'HIGH RISK',

    // Risk Breakdown
    risks: {
        predatory: 92,
        scams: 85,
        sexual: 68,
        bullying: 54,
        violence: 15,
    },

    // Islamic Compliance
    islamicRating: 'guidance', // 'compliant', 'guidance', 'not-suitable'
    islamicNotes: 'Contains user-generated content that may conflict with Islamic values. Parental supervision required.',

    // Community Stats
    totalReports: 2847,
    reportsThisWeek: 127,
    reportsChange: '+45%',
    activeUsers: '70M+ monthly',

    // Recent Community Reports (from other users)
    communityReports: [
        {
            id: 1,
            date: '2 hours ago',
            platform: 'Mobile',
            description: 'Player asking for personal information in exchange for Robux',
            imageUrl: 'https://i.imgur.com/gKj8vWw.png',
            risks: { predatory: 95, scams: 88, sexual: 10, bullying: 20, violence: 5 },
            status: 'verified',
            upvotes: 234,
        },
        {
            id: 2,
            date: '5 hours ago',
            platform: 'PC',
            description: 'Inappropriate avatars and offensive usernames in public servers',
            risks: { sexual: 75, bullying: 60, predatory: 30, scams: 10, violence: 15 },
            status: 'reviewed',
            upvotes: 189,
        },
        {
            id: 3,
            date: '1 day ago',
            platform: 'Mobile',
            description: 'Players using voice chat to harass younger kids, asking ages and locations',
            risks: { predatory: 88, bullying: 70, sexual: 45, scams: 20, violence: 10 },
            status: 'verified',
            upvotes: 456,
        },
        {
            id: 4,
            date: '2 days ago',
            platform: 'Console',
            description: 'Found links to external gambling/scam websites in game chat',
            risks: { scams: 92, predatory: 40, violence: 10, bullying: 15, sexual: 8 },
            status: 'verified',
            upvotes: 312,
        },
        {
            id: 5,
            date: '3 days ago',
            platform: 'PC',
            description: 'Condos (inappropriate user-created games) still accessible despite reports',
            risks: { sexual: 95, predatory: 85, bullying: 20, scams: 30, violence: 15 },
            status: 'pending',
            upvotes: 678,
        },
    ],

    // Safe Alternatives
    alternatives: [
        { name: 'Minecraft', safetyScore: 7.8, emoji: '⛏️' },
        { name: 'Among Us', safetyScore: 8.5, emoji: '🚀' },
        { name: 'Animal Crossing', safetyScore: 9.2, emoji: '🏝️' },
    ],
};

export default function GameDetailScreen() {

    const defaultShortDescription = 'Summary is not available yet for this game. Check the risk breakdown and community reports below.';

    const params = useLocalSearchParams();
    const gameName = params.gameName || params.id; // Support both /game/Roblox and /game/123

    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reports', 'safety'
    const [expandedReports, setExpandedReports] = useState([]);

    // --- CHANGE THIS ---
    // const gameData = mockGameData; // <-- Delete this line
    const [gameData, setGameData] = useState(mockGameData); // <-- Use state, initialized with mock data
    const [isLoading, setIsLoading] = useState(true); // <-- Add loading state
    // --- END CHANGE ---

    const [alternatives, setAlternatives] = useState([]);


    // --- ADD USEEFFECT TO FETCH REAL DATA ---
    useEffect(() => {
        if (!gameName) return;

        const fetchData = async () => {
            console.log(`🔄 Starting fetch for: ${gameName}`);
            setIsLoading(true);
            try {
                const response = await getGameDetailsByName(gameName);
                console.log("📥 API Response received:", response);

                if (response && response.game) {
                    const realGame = response.game;
                    console.log("🎮 Real game data:", realGame.name);
                    console.log("📄 Number of reports in DB:", realGame.reports ? realGame.reports.length : 0);

                    // --- THIS IS THE NEW, COMBINED LOGIC ---
                    setGameData(currentData => {
                        // 1. Start with the current mock data
                        const updatedData = { ...currentData };

                        // 2. Overwrite top-level fields with real data
                        // This will correctly set safetyScore to your new 1-10 score
                        Object.assign(updatedData, realGame);

                        // 3. Keep a copy of the mock reports
                        const updatedReports = [...currentData.communityReports];

                        // 4. Patch the first report card if real reports exist
                        if (realGame.reports && realGame.reports.length > 0) {
                            const firstRealReport = realGame.reports[0];
                            const realRisks = {};
                            if (firstRealReport.categories) {
                                Object.keys(firstRealReport.categories).forEach(cat => {
                                    realRisks[cat] = firstRealReport.categories[cat] || 0;
                                });
                            }

                            if (updatedReports.length > 0) {
                                updatedReports[0] = {
                                    ...updatedReports[0],
                                    description: firstRealReport.description,
                                    imageUrl: firstRealReport.imageUrl,
                                    date: new Date(firstRealReport.createdAt).toLocaleDateString(),
                                    platform: firstRealReport.platform,
                                    risks: realRisks,

                                };
                            }
                        }

                        // 5. Finally, set the community reports
                        updatedData.communityReports = updatedReports;

                        return updatedData;

                    });
                    // 3. FETCH SAFER ALTERNATIVES (Requires the real game ID)
                    const altGames = await getSaferAlternatives(realGame.id);
                    setAlternatives(altGames);
                } else {
                    console.error("API returned an error or unexpected format.");
                }
            } catch (err) {
                console.error("Failed to fetch game details:", err);

            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, [gameName]);
    // --- END CORRECTED USEEFFECT ---

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

    const getTopRisk = (risks) => {
        // 1. Use || {} as a fallback to ensure 'risks' is always an object.
        const entries = Object.entries(risks || {});

        // 2. Check if the object had any entries (i.e., if it was empty)
        if (entries.length === 0) {
            // Return a safe default object if no risks exist
            return { category: 'N/A', score: 0 };
        }

        // 3. Continue with the sorting logic if data exists
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        return { category: sorted[0][0], score: sorted[0][1] };
    };

    const toggleReportExpanded = (reportId) => {
        if (expandedReports.includes(reportId)) {
            setExpandedReports(expandedReports.filter(id => id !== reportId));
        } else {
            setExpandedReports([...expandedReports, reportId]);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'pending') return '#F59E0B';
        if (status === 'reviewed') return '#3B82F6';
        return '#10B981';
    };

    const getStatusBgColor = (status) => {
        if (status === 'pending') return '#FEF3C7';
        if (status === 'reviewed') return '#EFF6FF';
        return '#DEF7EC';
    };

    const scoreColor = getScoreColor(gameData.riskScore);
    const aboutSummary = (gameData.shortDescription || '').trim() || defaultShortDescription;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back-outline" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Game Details</Text>

                </View>

                {/* Game Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.gameEmoji}>{gameData.emoji}</Text>
                    <Text style={styles.gameName}>{gameData.name}</Text>
                    <Text style={styles.gameDeveloper}>{gameData.developer}</Text>

                    {/* Safety Score Circle */}
                    <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                        <Text style={[styles.scoreValue, { color: scoreColor }]}>
                            {gameData.riskScore}
                        </Text>
                        <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                            {gameData.riskScore >= 7 ? 'LOW RISK' : (gameData.riskScore >= 5 ? 'MEDIUM RISK' : 'HIGH RISK')}
                        </Text>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.quickStats}>
                        <View style={styles.quickStatItem}>
                            <Image
                                source={rate_7}
                                style={styles.pegiBadgeQuickStat}
                            />
                            <Text style={styles.quickStatLabel}>Official Rating</Text>
                        </View>
                    </View>


                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reports' && styles.tabActive]}
                        onPress={() => setActiveTab('reports')}
                    >
                        <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>
                            Reports ({gameData.reports?.length || 0})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'safety' && styles.tabActive]}
                        onPress={() => setActiveTab('safety')}
                    >
                        <Text style={[styles.tabText, activeTab === 'safety' && styles.tabTextActive]}>
                            Safety Tips
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <View style={styles.tabContent}>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <View>
                            {/* About */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>About</Text>
                                <Text style={styles.description}>{aboutSummary}</Text>

                                {/* --- START NEW CONTENT DESCRIPTORS SECTION --- */}
                                <Text style={styles.sectionTitle}>
                                    Official Content Descriptors
                                </Text>
                                <View style={styles.descriptorContainer}>
                                    {gameData.contentDescriptors && gameData.contentDescriptors.map((descriptor, index) => (
                                        <ContentDescriptor
                                            key={index}
                                            title={descriptor.title}
                                            description={descriptor.description}
                                            // Ensure pegiColor has a fallback too
                                            color={gameData.pegiColor || '#F59E0B'}
                                        />
                                    ))}
                                </View>
                                {/* --- END NEW CONTENT DESCRIPTORS SECTION --- */}

                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Platforms</Text>
                                        <Text style={styles.infoValue}>
                                            {Array.isArray(gameData.platforms)
                                                ? gameData.platforms.join(', ')
                                                : gameData.platform || 'N/A'}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Released</Text>
                                        <Text style={styles.infoValue}>
                                            {/* Check if date exists, create a new Date object, and get the full year */}
                                            {gameData.releaseDate ? new Date(gameData.releaseDate).getFullYear() : gameData.releaseYear}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Text style={styles.infoLabel}>Genre</Text>
                                        <Text style={styles.infoValue}>
                                            {gameData.genre}
                                        </Text>
                                    </View>

                                </View>
                            </View>

                            {/* Risk Breakdown */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>⚠️ Risk Breakdown</Text>
                                {Object.entries(gameData.risks)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([category, score]) => (
                                        <View key={category} style={styles.riskItem}>
                                            <Text style={styles.riskCategory}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </Text>
                                            <View style={styles.riskBarContainer}>
                                                <View
                                                    style={[
                                                        styles.riskBarFill,
                                                        {
                                                            width: `${score}%`,
                                                            backgroundColor: getRiskColor(score)
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[styles.riskScore, { color: getRiskColor(score) }]}>
                                                {score}%
                                            </Text>
                                        </View>
                                    ))}
                            </View>



                            {/* Safer Alternatives - NOW DYNAMIC */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>✨ Safer Alternatives</Text>
                                {alternatives.length === 0 ? (
                                    <Text style={styles.noAlternativesText}>
                                        No safer alternatives found in the database.
                                    </Text>
                                ) : (
                                    alternatives.map((alt, index) => (
                                        <TouchableOpacity key={alt.id} style={styles.alternativeCard}
                                            onPress={() => router.push({
                                                pathname: "/GameDetailScreen",
                                                params: { gameName: alt.name }
                                            })}
                                        >
                                            {/* --- START REPLACEMENT: Use Image URL --- */}
                                            <Image
                                                source={{ uri: alt.imageUrl }}
                                                style={styles.alternativeImage} // New style for image size
                                            // Optional: Add a subtle green checkmark overlay if it is much safer (riskScore is lower)
                                            />
                                            {/* --- END REPLACEMENT --- */}
                                            <View style={styles.alternativeInfo}>
                                                <Text style={styles.alternativeName}>{alt.name}</Text>
                                                <Text style={[styles.alternativeSafety, { color: getScoreColor(alt.riskScore) }]}>
                                                    Risk Score: {alt.riskScore.toFixed(1)}/10
                                                </Text>
                                            </View>
                                            <Text style={styles.alternativeArrow}>→</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        </View>
                    )}


                    {/* COMMUNITY REPORTS TAB */}
                    {activeTab === 'reports' && (
                        <View>
                            <View style={styles.reportsHeader}>
                                <Text style={styles.reportsHeaderTitle}>Community Reports</Text>
                            </View>

                            {(gameData.reports || []).length === 0 ? (
                                <View style={styles.emptyStateCard}>
                                    <Text style={styles.emptyStateIcon}>📬</Text>
                                    <Text style={styles.emptyStateText}>No Recent Reports Found</Text>
                                    <Text style={styles.emptyStateSubtext}>
                                        No community reports have been submitted for this game yet.
                                    </Text>
                                </View>
                            ) : (
                                <View>
                                    {(gameData.reports || []).map((report) => {
                                        const reportRisks = (report.categories && typeof report.categories === 'string')
                                            ? JSON.parse(report.categories)
                                            : report.categories || {};
                                        const topRisk = getTopRisk(reportRisks);
                                        const isExpanded = expandedReports.includes(report.id);

                                        return (
                                            <View key={report.id} style={styles.communityReportCard}>
                                                <TouchableOpacity
                                                    onPress={() => toggleReportExpanded(report.id)}
                                                >
                                                    {/* Report Header */}
                                                    <View style={styles.reportHeader}>
                                                        <View style={styles.reportHeaderLeft}>
                                                            <Text style={styles.reportDate}>
                                                                {/* Use the DB createdAt date */}
                                                                {new Date(report.createdAt).toLocaleDateString()}
                                                            </Text>

                                                        </View>
                                                    </View>

                                                    {/* Top Risk (Uses DB score categories) */}
                                                    <View
                                                        style={[
                                                            styles.topRiskBadge,
                                                            { backgroundColor: getRiskColor(topRisk.score) }
                                                        ]}
                                                    >
                                                        <Text style={styles.topRiskText}>
                                                            ⚠️ {topRisk.score}% {topRisk.category.charAt(0).toUpperCase() + topRisk.category.slice(1)}
                                                        </Text>
                                                    </View>

                                                    {/* Description (Uses DB description) */}
                                                    <Text
                                                        style={styles.reportDescription}
                                                        numberOfLines={isExpanded ? undefined : 2}
                                                    >
                                                        {report.description}
                                                    </Text>

                                                    {/* Show helpful count only when there is at least one vote */}
                                                    {(report.upvotes || 0) > 0 && (
                                                        <View style={styles.reportFooter}>
                                                            <View style={styles.upvoteContainer}>
                                                                <Text style={styles.upvoteIcon}>👍</Text>
                                                                <Text style={styles.upvoteCount}>
                                                                    {report.upvotes} parents found this helpful
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>

                                                {/* Expanded Details */}
                                                {isExpanded && (
                                                    <View style={styles.expandedSection}>
                                                        <View style={styles.divider} />
                                                        {report.imageUrl && (
                                                            <>
                                                                <Text style={styles.expandedTitle}>Screenshot Evidence</Text>
                                                                <Image
                                                                    source={{ uri: `${BACKEND_API_URL.replace('/api', '')}/${report.imageUrl}` }}
                                                                    style={styles.reportImage}
                                                                />
                                                                <View style={styles.divider} />
                                                            </>
                                                        )}
                                                        <Text style={styles.expandedTitle}>Risk Details</Text>
                                                        {Object.entries(reportRisks)
                                                            .sort((a, b) => b[1] - a[1])
                                                            .map(([category, score]) => (
                                                                <View key={category} style={styles.riskItem}>
                                                                    <Text style={styles.riskCategory}>
                                                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                                                    </Text>
                                                                    <View style={styles.riskBarContainer}>
                                                                        <View
                                                                            style={[
                                                                                styles.riskBarFill,
                                                                                {
                                                                                    width: `${score}%`,
                                                                                    backgroundColor: getRiskColor(score)
                                                                                }
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                    <Text
                                                                        style={[
                                                                            styles.riskScore,
                                                                            { color: getRiskColor(score) }
                                                                        ]}
                                                                    >
                                                                        {score}%
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                    </View>
                                                )}

                                                {/* Expand Button */}
                                                <TouchableOpacity
                                                    style={styles.expandButton}
                                                    onPress={() => toggleReportExpanded(report.id)}
                                                >
                                                    <Text style={styles.expandButtonText}>
                                                        {isExpanded ? '▲ Show Less' : '▼ View Details'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}



                    {/* SAFETY TIPS TAB */}
                    {activeTab === 'safety' && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🛡️ Safety Recommendations</Text>

                            <View style={styles.tipCard}>
                                <Text style={styles.tipTitle}>🔒 Privacy Settings</Text>
                                <Text style={styles.tipText}>
                                    • Disable chat features{'\n'}
                                    • Set account to private{'\n'}
                                    • Limit who can join your child{'\n'}
                                    • Disable in-app purchases
                                </Text>
                            </View>

                            <View style={styles.tipCard}>
                                <Text style={styles.tipTitle}>👨‍👩‍👧 Parental Supervision</Text>
                                <Text style={styles.tipText}>
                                    • Play together with your child{'\n'}
                                    • Review friend requests regularly{'\n'}
                                    • Set time limits{'\n'}
                                    • Discuss online safety rules
                                </Text>
                            </View>

                            <View style={styles.tipCard}>
                                <Text style={styles.tipTitle}>⚠️ Red Flags to Watch</Text>
                                <Text style={styles.tipText}>
                                    • Requests for personal information{'\n'}
                                    • Being asked to move to other platforms{'\n'}
                                    • Offers of free items/currency{'\n'}
                                    • Inappropriate language or content
                                </Text>
                            </View>


                        </View>
                    )}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        position: 'relative',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        position: 'absolute',
        left: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    backBtnText: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
    },
    shareBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    shareBtnText: {
        fontSize: 20,
        color: '#6B7280',
    },
    heroSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    gameEmoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    gameName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    gameDeveloper: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '800',
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    quickStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    pegiBadgeQuickStat: {
        width: 36,  // Adjusted size to fit well in the quick stat box
        height: 36,
        resizeMode: 'contain',
        marginBottom: 4,
    },
    quickStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    quickStatLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    quickStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
    },
    quickActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    quickActionBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryAction: {
        backgroundColor: '#3B82F6',
    },
    secondaryAction: {
        backgroundColor: '#F3F4F6',
    },
    quickActionTextPrimary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    quickActionTextSecondary: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: '#EFF6FF',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#3B82F6',
    },
    tabContent: {
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 16,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    infoItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
    },
    infoLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
    },
    riskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    riskCategory: {
        fontSize: 13,
        color: '#6B7280',
        width: 80,
        fontWeight: '500',
    },
    riskBarContainer: {
        flex: 1,
        height: 10,
        backgroundColor: '#E5E7EB',
        borderRadius: 5,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    riskBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    riskScore: {
        fontSize: 13,
        fontWeight: '700',
        width: 50,
        textAlign: 'right',
    },
    islamicCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    islamicCompliant: {
        backgroundColor: '#DEF7EC',
        borderColor: '#10B981',
    },
    islamicGuidance: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
    },
    islamicNotSuitable: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
    },
    islamicStatus: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    islamicNotes: {
        fontSize: 13,
        color: '#374151',
        lineHeight: 20,
    },
    alternativeCard: {
        flexDirection: 'row',
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
    alternativeEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    // --- NEW STYLE FOR ALTERNATIVE IMAGE ---
    alternativeImage: {
        width: 48,  // Standard small icon/image size
        height: 48,
        borderRadius: 8, // Rounded corners for a modern look
        marginRight: 12,
        backgroundColor: '#E5E7EB', // Placeholder color while loading
    },
    alternativeInfo: {
        flex: 1,
    },
    alternativeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    alternativeSafety: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    alternativeArrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    reportsHeader: {
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
    reportsHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    communityReportCard: {
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
        marginBottom: 12,
    },
    reportHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reportDate: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    reportStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    reportStatusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    topRiskBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    topRiskText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    reportDescription: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 12,
    },
    emptyStateCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 12,
        color: '#6B7280',
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: 300,
    },
    reportFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    upvoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    upvoteIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    upvoteCount: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    expandedSection: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 16,
    },
    expandedTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    expandButton: {
        paddingVertical: 10,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        marginTop: 8,
    },
    expandButtonText: {
        fontSize: 13,
        color: '#3B82F6',
        fontWeight: '600',
    },
    // --- ADD THIS STYLE ---
    reportImage: {
        width: '100%',
        height: 250, // You can adjust this height
        borderRadius: 12,
        backgroundColor: '#F3F4F6', // A light placeholder color
        marginBottom: 16,
    },
    // --- END ---
    tipCard: {
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
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#374151',
        lineHeight: 20,
    },
    reportButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    reportButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});