import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { getChildrenByParent } from '../../lib/api/quick_actions/link-child-device/get_children';
import { getScreenTimeLogsByChild } from '../../lib/api/screen-time/log_screen_time';

// Demo behavior: alerts only include logs recorded after this JS session starts.
const APP_SESSION_STARTED_AT_MS = Date.now();

const isSameLocalDay = (dateA, dateB) => (
    dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate()
);

const formatMinutesToHourMinute = (minutes) => {
    const safeMinutes = Math.max(0, Number(minutes) || 0);
    const hoursPart = Math.floor(safeMinutes / 60);
    const minsPart = safeMinutes % 60;
    return `${hoursPart}h ${minsPart}m`;
};

const getLogTimestampMs = (log) => {
    const raw = log?.loggedAt || log?.createdAt || log?.logDate;
    if (!raw) return null;

    const parsed = new Date(raw);
    const ms = parsed.getTime();
    return Number.isFinite(ms) ? ms : null;
};

const getAlertSeverityFromUsage = (usagePercent) => {
    if (usagePercent >= 100) return 'high';
    if (usagePercent >= 80) return 'medium';
    if (usagePercent >= 60) return 'low';
    return null;
};

const getSeverityRank = (severity) => {
    if (severity === 'high') return 3;
    if (severity === 'medium') return 2;
    if (severity === 'low') return 1;
    return 0;
};

const getSeverityUi = (severity) => {
    if (severity === 'high') {
        return {
            iconName: 'time-outline',
            iconColor: '#DC2626',
            title: 'Screen Time Limit Reached',
            titleColor: '#B91C1C',
            badgeText: 'HIGH',
            badgeBg: '#FEE2E2',
            badgeTextColor: '#B91C1C',
            cardBorder: '#FECACA',
            metaColor: '#DC2626',
        };
    }

    if (severity === 'medium') {
        return {
            iconName: 'alert-circle-outline',
            iconColor: '#D97706',
            title: 'Approaching Screen Time Limit',
            titleColor: '#B45309',
            badgeText: 'MEDIUM',
            badgeBg: '#FEF3C7',
            badgeTextColor: '#92400E',
            cardBorder: '#FDE68A',
            metaColor: '#B45309',
        };
    }

    return {
        iconName: 'information-circle-outline',
        iconColor: '#2563EB',
        title: 'Screen Time Activity Notice',
        titleColor: '#1D4ED8',
        badgeText: 'LOW',
        badgeBg: '#DBEAFE',
        badgeTextColor: '#1E40AF',
        cardBorder: '#BFDBFE',
        metaColor: '#1D4ED8',
    };
};

export default function AlertsScreen() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAlerts = useCallback(async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                setAlerts([]);
                return;
            }

            const childrenRes = await getChildrenByParent(userId);
            const children = childrenRes?.children || [];

            if (children.length === 0) {
                setAlerts([]);
                return;
            }

            const today = new Date();

            const perChildAlerts = await Promise.all(
                children.map(async (child) => {
                    try {
                        // Get the child's custom daily limit, fallback to 120 if not set
                        const dailyLimit = child.dailyScreenTimeLimitMinutes || 120;

                        const logs = await getScreenTimeLogsByChild(child.id);
                        const todayTotalMinutes = (Array.isArray(logs) ? logs : []).reduce((sum, log) => {
                            if (!log?.logDate) return sum;

                            const logDate = new Date(log.logDate);
                            if (!isSameLocalDay(logDate, today)) return sum;

                            const logTimestampMs = getLogTimestampMs(log);
                            if (logTimestampMs !== null && logTimestampMs < APP_SESSION_STARTED_AT_MS) {
                                return sum;
                            }

                            return sum + (Number(log.durationMinutes) || 0);
                        }, 0);

                        const safeDailyLimit = Math.max(1, Number(dailyLimit) || 120);
                        const usagePercent = Math.round((todayTotalMinutes / safeDailyLimit) * 100);
                        const severity = getAlertSeverityFromUsage(usagePercent);

                        if (!severity) {
                            return null;
                        }

                        const excessMinutes = Math.max(0, todayTotalMinutes - safeDailyLimit);
                        const remainingMinutes = Math.max(0, safeDailyLimit - todayTotalMinutes);

                        return {
                            id: `screen-limit-${child.id}-${today.toDateString()}`,
                            type: 'screen_time_progress',
                            severity,
                            childName: child.childName || 'Your child',
                            totalMinutes: todayTotalMinutes,
                            excessMinutes,
                            remainingMinutes,
                            usagePercent,
                            dailyLimit: safeDailyLimit,
                            createdAt: new Date().toISOString(),
                        };
                    } catch (error) {
                        console.error('Error fetching logs for child:', child.id, error);
                        return null;
                    }
                })
            );

            const validAlerts = perChildAlerts
                .filter(Boolean)
                .sort((a, b) => {
                    const severityDiff = getSeverityRank(b.severity) - getSeverityRank(a.severity);
                    if (severityDiff !== 0) return severityDiff;
                    return (b.usagePercent || 0) - (a.usagePercent || 0);
                });

            setAlerts(validAlerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setAlerts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAlerts();
        }, [fetchAlerts])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlerts();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.stateText}>Loading alerts...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Alerts</Text>
                    <Text style={styles.subtitle}>Important notifications for your child safety</Text>
                </View>

                {alerts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-circle-outline" size={72} color="#10B981" />
                        <Text style={styles.emptyTitle}>No screen-time alerts</Text>
                        <Text style={styles.emptyDescription}>
                            Your children are currently below the alert threshold.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.alertList}>
                        {alerts.map((alert) => {
                            const severityUi = getSeverityUi(alert.severity);
                            return (
                                <View
                                    key={alert.id}
                                    style={[styles.alertCard, { borderColor: severityUi.cardBorder }]}
                                >
                                    <View style={styles.alertTopRow}>
                                        <View style={styles.alertTypeWrap}>
                                            <Ionicons name={severityUi.iconName} size={20} color={severityUi.iconColor} />
                                            <Text style={[styles.alertTypeText, { color: severityUi.titleColor }]}>
                                                {severityUi.title}
                                            </Text>
                                        </View>
                                        <View style={[styles.severityBadge, { backgroundColor: severityUi.badgeBg }]}>
                                            <Text style={[styles.severityBadgeText, { color: severityUi.badgeTextColor }]}>
                                                {severityUi.badgeText}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.alertMessage}>
                                        {alert.childName} logged {formatMinutesToHourMinute(alert.totalMinutes)} today out of {formatMinutesToHourMinute(alert.dailyLimit)} daily limit ({alert.usagePercent}%).
                                    </Text>
                                    <Text style={[styles.alertMeta, { color: severityUi.metaColor }]}>
                                        {alert.severity === 'high'
                                            ? `Over by ${formatMinutesToHourMinute(alert.excessMinutes)}`
                                            : `${formatMinutesToHourMinute(alert.remainingMinutes)} remaining before limit`}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
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
        paddingBottom: 28,
    },
    centerState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    stateText: {
        fontSize: 15,
        color: '#6B7280',
    },
    header: {
        marginBottom: 18,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: '#6B7280',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 56,
    },
    emptyTitle: {
        marginTop: 14,
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
    },
    emptyDescription: {
        marginTop: 6,
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    alertList: {
        gap: 12,
    },
    alertCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    alertTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    alertTypeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    alertTypeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#B91C1C',
    },
    severityBadge: {
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    severityBadgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    alertMessage: {
        fontSize: 14,
        lineHeight: 20,
        color: '#111827',
    },
    alertMeta: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#DC2626',
    },
});