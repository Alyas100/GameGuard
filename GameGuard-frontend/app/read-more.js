import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getTrendingAlerts } from '../lib/api/dashboard/get_trending_alerts';

export default function ReadMoreScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [alerts, setAlerts] = useState([]);
    const [topRiskGame, setTopRiskGame] = useState(null);

    // Fetch trending alerts to show on this page
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getTrendingAlerts();
                setAlerts(data);
                if (data && data.length > 0) {
                    setTopRiskGame(data[0]);
                }
            } catch (err) {
                console.error('Error fetching alerts:', err);
            }
        };
        fetchData();
    }, []);

    const safetyTips = [
        {
            icon: 'shield-checkmark-outline',
            title: 'Review Privacy Settings',
            description: 'Check gaming platform privacy settings weekly to limit who can contact your child.',
        },
        {
            icon: 'chatbubble-ellipses-outline',
            title: 'Open Communication',
            description: 'Talk to your child about online interactions and encourage reporting uncomfortable conversations.',
        },
        {
            icon: 'time-outline',
            title: 'Set Screen Time Limits',
            description: 'Establish daily screen time rules and stick to them consistently.',
        },
        {
            icon: 'eye-outline',
            title: 'Monitor Changes',
            description: 'Watch for behavioral changes that might indicate online safety issues.',
        },
    ];

    const alertTypes = [
        {
            icon: 'warning',
            title: 'Most Reported Games',
            description: 'Games with highest report count this week. Requires extra parental attention.',
        },
        {
            icon: 'trending-up',
            title: 'Sudden Report Spikes',
            description: 'Games showing sudden increase in reports (40%+ rise). May indicate emerging issues.',
        },
        {
            icon: 'alert-circle',
            title: 'High-Risk Content',
            description: 'Reports containing predatory behavior, sexual, or violent content flags.',
        },
        {
            icon: 'stats-chart',
            title: 'Community Trends',
            description: 'Aggregated reports from the parent community to show emerging patterns.',
        },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Parent Safety Guide</Text>
                <View style={{ width: 40 }} />
            </View>



            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>  What To Do Now</Text>
                <View style={styles.actionCard}>
                    <View style={styles.actionItem}>
                        <Text style={styles.actionNumber}>1</Text>
                        <View style={styles.actionText}>
                            <Text style={styles.actionTitle}>Review Active Alerts</Text>
                            <Text style={styles.actionDesc}>Check dashboard for latest alerts about reported games.</Text>
                        </View>
                    </View>
                    <View style={styles.actionDivider} />
                    <View style={styles.actionItem}>
                        <Text style={styles.actionNumber}>2</Text>
                        <View style={styles.actionText}>
                            <Text style={styles.actionTitle}>Discuss with Your Child</Text>
                            <Text style={styles.actionDesc}>Talk about games they play and any interactions they had.</Text>
                        </View>
                    </View>
                    <View style={styles.actionDivider} />
                    <View style={styles.actionItem}>
                        <Text style={styles.actionNumber}>3</Text>
                        <View style={styles.actionText}>
                            <Text style={styles.actionTitle}>Adjust Settings</Text>
                            <Text style={styles.actionDesc}>Update game or device privacy settings if needed.</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* How Alerts Work */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>  How Our Alerts Work</Text>
                <View style={styles.alertTypesContainer}>
                    {alertTypes.map((alert, index) => (
                        <View key={index} style={styles.alertTypeCard}>
                            <Ionicons name={alert.icon} size={28} color="#3B82F6" style={styles.alertTypeIcon} />
                            <Text style={styles.alertTypeTitle}>{alert.title}</Text>
                            <Text style={styles.alertTypeDesc}>{alert.description}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Safety Tips */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>  Safety Tips</Text>
                {safetyTips.map((tip, index) => (
                    <View key={index} style={styles.tipCard}>
                        <View style={styles.tipIconWrap}>
                            <Ionicons name={tip.icon} size={22} color="#2563EB" />
                        </View>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>{tip.title}</Text>
                            <Text style={styles.tipDescription}>{tip.description}</Text>
                        </View>
                    </View>
                ))}
            </View>



            <View style={{ height: 30 }} />
        </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    overviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    overviewLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    overviewValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    statusGood: {
        color: '#10B981',
    },
    actionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionItem: {
        flexDirection: 'row',
        gap: 12,
    },
    actionNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontWeight: '700',
        fontSize: 16,
    },
    actionText: {
        flex: 1,
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
    actionDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    alertTypesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    alertTypeCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    alertTypeIcon: {
        marginBottom: 8,
    },
    alertTypeTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 6,
    },
    alertTypeDesc: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    tipIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    tipDescription: {
        fontSize: 12,
        color: '#6B7280',
    },
    resourceCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    resourceIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    resourceContent: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    resourceDesc: {
        fontSize: 12,
        color: '#6B7280',
    },
});
