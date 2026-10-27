// AnalyticsScreen.js

import {
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function AnalyticsScreen() {
    // Mock data (replace with API)
    const stats = {
        reportsSubmitted: 47,
        reportsChange: 12,
        gamesMonitored: 12,
        gamesAdded: 3,
        highRiskDetected: 8,
        riskChange: -25,
        communityReports: 2847,
        communityChange: 450,
    };

    const weeklyTrend = [
        { day: 'Mon', value: 4 },
        { day: 'Tue', value: 6 },
        { day: 'Wed', value: 8 },
        { day: 'Thu', value: 5 },
        { day: 'Fri', value: 10 },
        { day: 'Sat', value: 7 },
        { day: 'Sun', value: 9 },
    ];

    const riskDistribution = [
        { icon: '🚨', name: 'Predatory Behavior', percentage: 35, color: '#EF4444' },
        { icon: '💰', name: 'Scams / Gambling', percentage: 28, color: '#F59E0B' },
        { icon: '⚔️', name: 'Violence', percentage: 18, color: '#3B82F6' },
        { icon: '😢', name: 'Bullying', percentage: 12, color: '#8B5CF6' },
        { icon: '🔞', name: 'Sexual Content', percentage: 7, color: '#EC4899' },
    ];

    const islamicStats = {
        compliant: 45,
        guidance: 35,
        notSuitable: 20,
    };

    const maxTrendValue = Math.max(...weeklyTrend.map(d => d.value));

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.headerTitle}>                      Analytics</Text>
            </View>

            {/* Reports Trend Chart */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Reports Trend (Last 7 Days)</Text>
                <View style={styles.chartContainer}>
                    {/* Chart area */}
                    <View style={styles.chartContent}>
                        {/* Bars */}
                        <View style={styles.barsContainer}>
                            {weeklyTrend.map((item, index) => {
                                const barHeight = (item.value / maxTrendValue) * 150;
                                return (
                                    <View key={index} style={styles.barGroup}>
                                        <View style={styles.barColumn}>
                                            <View
                                                style={[
                                                    styles.bar,
                                                    { height: barHeight }
                                                ]}
                                            >
                                                <Text style={styles.barLabel}>{item.value}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.barDay}>{item.day}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>

            {/* Risk Categories Distribution */}
            <View style={styles.riskDistribution}>
                <Text style={styles.sectionTitle}>Risk Categories Distribution</Text>
                {riskDistribution.map((risk, index) => (
                    <View key={index} style={styles.riskItem}>
                        <Text style={styles.riskIcon}>{risk.icon}</Text>
                        <View style={styles.riskInfo}>
                            <Text style={styles.riskName}>{risk.name}</Text>
                            <View style={styles.riskBarContainer}>
                                <View
                                    style={[
                                        styles.riskBarFill,
                                        { width: `${risk.percentage}%`, backgroundColor: risk.color }
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={[styles.riskPercentage, { color: risk.color }]}>
                            {risk.percentage}%
                        </Text>
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
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    statCard: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        margin: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    statChange: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 6,
    },
    statUp: {
        color: '#EF4444',
    },
    statDown: {
        color: '#10B981',
    },
    chartCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    chartContainer: {
        flexDirection: 'row',
        height: 200,
        marginBottom: 8,
    },
    chartContent: {
        flex: 1,
        paddingLeft: 12,
        paddingRight: 8,
        justifyContent: 'flex-end',
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
    },
    barGroup: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    barColumn: {
        alignItems: 'center',
        height: 150,
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    bar: {
        width: 24,
        backgroundColor: '#3B82F6',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 2,
    },
    barLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    barDay: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
    },
    riskDistribution: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    riskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    riskIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    riskInfo: {
        flex: 1,
    },
    riskName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    riskBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    riskBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    riskPercentage: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 12,
    },
});