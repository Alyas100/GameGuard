import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock data - replace with API calls later
const mockActiveSessions = [
    {
        id: 1,
        childId: 'child_123',
        childName: 'Sarah',
        gameName: 'Roblox',
        deviceType: 'iPhone',
        deviceModel: 'iPhone 12',
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        riskLevel: 'medium'
    },
    {
        id: 2,
        childId: 'child_123',
        childName: 'Sarah',
        gameName: 'Minecraft',
        deviceType: 'iPad',
        deviceModel: 'iPad Air',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000), // 2h 15m ago
        riskLevel: 'low'
    },
    {
        id: 3,
        childId: 'child_456',
        childName: 'John',
        gameName: 'Free Fire',
        deviceType: 'Samsung',
        deviceModel: 'Samsung A12',
        startTime: new Date(Date.now() - 1 * 60 * 60 * 1000 - 30 * 60 * 1000), // 1h 30m ago
        riskLevel: 'high'
    }
];

const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
        case 'iphone':
            return 'phone-portrait-outline';
        case 'ipad':
            return 'tablet-landscape-outline';
        case 'samsung':
            return 'phone-portrait-outline';
        case 'laptop':
            return 'laptop-outline';
        default:
            return 'phone-portrait-outline';
    }
};

const formatSessionDuration = (startTime) => {
    const now = new Date();
    const diffMs = now - startTime;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
        case 'high':
            return '#EF4444';
        case 'medium':
            return '#F59E0B';
        case 'low':
            return '#10B981';
        default:
            return '#6B7280';
    }
};

export default function ActiveSessions() {
    const [sessions, setSessions] = useState(mockActiveSessions);
    const router = useRouter();

    const handlePauseSession = (sessionId, gameName) => {
        Alert.alert(
            'Pause Session',
            `Do you want to pause ${gameName}?`,
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Pause',
                    onPress: () => {
                        Alert.alert('Success', `${gameName} session paused`);
                        // API call would go here
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handleSetTimer = (sessionId, gameName) => {
        Alert.alert(
            'Set Time Limit',
            `Set a time limit for ${gameName}`,
            [
                { text: '15 mins', onPress: () => Alert.alert('Timer Set', '15 minutes set for ' + gameName) },
                { text: '30 mins', onPress: () => Alert.alert('Timer Set', '30 minutes set for ' + gameName) },
                { text: '1 hour', onPress: () => Alert.alert('Timer Set', '1 hour set for ' + gameName) },
                { text: 'Cancel', onPress: () => { }, style: 'cancel' }
            ]
        );
    };

    const handleSendAlert = (childName, gameName) => {
        Alert.alert('Alert Sent', `Message sent to ${childName} about ${gameName}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#2563EB" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Sessions</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <View key={session.id} style={styles.sessionCard}>
                                {/* Top Row: Game Name & Live Indicator */}
                                <View style={styles.sessionHeader}>
                                    <View style={styles.gameInfo}>
                                        <Ionicons name="game-controller-outline" size={28} color="#2563EB" />
                                        <Text style={styles.gameName}>{session.gameName}</Text>
                                    </View>
                                    <View style={styles.liveIndicator}>
                                        <View style={styles.liveDot} />
                                        <Text style={styles.liveText}>LIVE</Text>
                                    </View>
                                </View>

                                {/* Device Info */}
                                <View style={styles.detailRow}>
                                    <Ionicons name={getDeviceIcon(session.deviceType)} size={20} color="#6B7280" />
                                    <Text style={styles.detailText}>
                                        {session.deviceModel} ({session.childName})
                                    </Text>
                                </View>

                                {/* Duration */}
                                <View style={styles.detailRow}>
                                    <Ionicons name="time-outline" size={20} color="#6B7280" />
                                    <Text style={styles.detailText}>
                                        Playing for {formatSessionDuration(session.startTime)}
                                    </Text>
                                </View>

                                {/* Risk Level */}
                                <View style={styles.detailRow}>
                                    <View
                                        style={[
                                            styles.riskDot,
                                            { backgroundColor: getRiskColor(session.riskLevel) }
                                        ]}
                                    />
                                    <Text style={[styles.detailText, { color: getRiskColor(session.riskLevel) }]}>
                                        Risk Level: {session.riskLevel.charAt(0).toUpperCase() + session.riskLevel.slice(1)}
                                    </Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.pauseBtn]}
                                        onPress={() => handlePauseSession(session.id, session.gameName)}
                                    >
                                        <Ionicons name="pause-circle-outline" size={18} color="#FFF" />
                                        <Text style={styles.actionBtnText}>Pause</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.timerBtn]}
                                        onPress={() => handleSetTimer(session.id, session.gameName)}
                                    >
                                        <Ionicons name="hourglass-outline" size={18} color="#FFF" />
                                        <Text style={styles.actionBtnText}>Timer</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.alertBtn]}
                                        onPress={() => handleSendAlert(session.childName, session.gameName)}
                                    >
                                        <Ionicons name="notifications-outline" size={18} color="#FFF" />
                                        <Text style={styles.actionBtnText}>Alert</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="controller-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyStateText}>No Active Sessions</Text>
                            <Text style={styles.emptyStateSubtext}>Your children are not currently playing</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937'
    },
    scrollView: {
        flex: 1
    },
    content: {
        padding: 16
    },
    sessionCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2563EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    gameInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1
    },
    gameName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937'
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981'
    },
    liveText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669'
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10
    },
    detailText: {
        fontSize: 14,
        color: '#6B7280'
    },
    riskDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8
    },
    pauseBtn: {
        backgroundColor: '#EF4444'
    },
    timerBtn: {
        backgroundColor: '#F59E0B'
    },
    alertBtn: {
        backgroundColor: '#3B82F6'
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF'
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#9CA3AF',
        marginTop: 16
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#D1D5DB',
        marginTop: 8
    }
});