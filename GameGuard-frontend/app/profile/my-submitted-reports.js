// MyReportsScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getMySubmittedReports } from "../../lib/api/profile/get_my_submitted_reports";

export default function MyReportsScreen() {
    const [expandedReport, setExpandedReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        const loadReports = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                // Adjust key if your app stores user id with another key
                const storedUserId = await AsyncStorage.getItem("userId");
                console.log("[MyReportsScreen] storedUserId =", storedUserId);

                if (!storedUserId) {
                    setReports([]);
                    setLoadError("User ID not found. Please login again.");
                    return;
                }

                const data = await getMySubmittedReports();
                console.log("[MyReportsScreen] fetched reports count =", Array.isArray(data) ? data.length : 0);
                setReports(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load submitted reports:", error);
                setReports([]);
                setLoadError(error?.message || "Unable to load your reports right now. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        loadReports();
    }, []);

    const stats = useMemo(
        () => ({
            total: reports.length,
        }),
        [reports]
    );

    const getRiskColor = (score) => {
        if (score >= 70) return "#EF4444";
        if (score >= 40) return "#F59E0B";
        return "#10B981";
    };

    const getTopRisk = (risks) => {
        const entries = Object.entries(risks || {});
        if (entries.length === 0) {
            return { category: "Unscored", score: 0 };
        }
        const sorted = entries.sort((a, b) => Number(b[1]) - Number(a[1]));
        return { category: sorted[0][0], score: Number(sorted[0][1]) || 0 };
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn}>
                        <Text style={styles.backBtnText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}> My Reports</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Total Reports</Text>
                    </View>
                </View>

                <View style={styles.reportsList}>
                    {isLoading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.emptyStateSubtext}>Loading your reports...</Text>
                        </View>
                    ) : loadError ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>⚠️</Text>
                            <Text style={styles.emptyStateText}>Could not load reports</Text>
                            <Text style={styles.emptyStateSubtext}>{loadError}</Text>
                        </View>
                    ) : reports.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>📭</Text>
                            <Text style={styles.emptyStateText}>No reports found</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Start protecting your child by submitting reports
                            </Text>
                        </View>
                    ) : (
                        reports.map((report) => {
                            const topRisk = getTopRisk(report.risks);
                            const isExpanded = expandedReport === report.id;

                            return (
                                <View key={report.id} style={styles.reportCard}>
                                    <TouchableOpacity onPress={() => setExpandedReport(isExpanded ? null : report.id)}>
                                        <View style={styles.reportHeader}>
                                            <View style={styles.reportHeaderLeft}>
                                                <Text style={styles.reportGame}>{report.game}</Text>
                                                <Text style={styles.reportDate}>
                                                    {report.date} • {report.platform}
                                                </Text>
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                styles.topRiskBadge,
                                                { backgroundColor: getRiskColor(topRisk.score) },
                                            ]}
                                        >
                                            <Text style={styles.topRiskText}>
                                                ⚠️ {topRisk.score}% {formatRiskLabel(topRisk.category)}
                                            </Text>
                                        </View>

                                        <Text style={styles.reportDescription} numberOfLines={isExpanded ? undefined : 2}>
                                            {report.description || "No description"}
                                        </Text>
                                    </TouchableOpacity>

                                    {isExpanded && (
                                        <View style={styles.expandedSection}>
                                            <View style={styles.divider} />

                                            {report.imageUrl ? (
                                                <>
                                                    <Text style={styles.expandedTitle}>Screenshot Evidence</Text>
                                                    <Image
                                                        source={{ uri: report.imageUrl }}
                                                        style={styles.reportImage}
                                                    />
                                                    <View style={styles.divider} />
                                                </>
                                            ) : null}

                                            <Text style={styles.expandedTitle}>Risk Breakdown</Text>

                                            <View style={styles.riskIndicators}>
                                                {Object.entries(report.risks)
                                                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                                                    .map(([category, score]) => {
                                                        const numeric = Number(score) || 0;
                                                        return (
                                                            <View key={category} style={styles.riskItem}>
                                                                <Text style={styles.riskCategory}>{formatRiskLabel(category)}</Text>
                                                                <View style={styles.riskBarContainer}>
                                                                    <View
                                                                        style={[
                                                                            styles.riskBarFill,
                                                                            {
                                                                                width: `${numeric}%`,
                                                                                backgroundColor: getRiskColor(numeric),
                                                                            },
                                                                        ]}
                                                                    />
                                                                </View>
                                                                <Text style={[styles.riskScore, { color: getRiskColor(numeric) }]}>
                                                                    {numeric}%
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}

                                                {Object.keys(report.risks || {}).length === 0 && (
                                                    <Text style={styles.emptyRiskText}>
                                                        Risk scoring is not available yet for this report.
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.expandButton}
                                        onPress={() => setExpandedReport(isExpanded ? null : report.id)}
                                    >
                                        <Text style={styles.expandButtonText}>
                                            {isExpanded ? "▲ Show Less" : "▼ View Details"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

function formatRiskLabel(label) {
    if (!label) return "Unknown";
    return String(label).replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        shadowColor: "#000",
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
        fontWeight: "bold",
        color: "#111827",
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "800",
        color: "#3B82F6",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "600",
    },
    reportsList: {
        paddingHorizontal: 20,
    },
    reportCard: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    reportHeaderLeft: {
        flex: 1,
    },
    reportGame: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    reportDate: {
        fontSize: 12,
        color: "#6B7280",
    },
    topRiskBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    topRiskText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    reportDescription: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
        marginBottom: 12,
    },
    expandButton: {
        paddingVertical: 10,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        marginTop: 8,
    },
    expandButtonText: {
        fontSize: 13,
        color: "#3B82F6",
        fontWeight: "600",
    },
    expandedSection: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 16,
    },
    expandedTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    riskIndicators: {
        marginBottom: 16,
    },
    riskItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    riskCategory: {
        fontSize: 12,
        color: "#6B7280",
        width: 100,
        fontWeight: "500",
    },
    riskBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: "hidden",
    },
    riskBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    riskScore: {
        fontSize: 12,
        fontWeight: "700",
        width: 45,
        textAlign: "right",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        paddingHorizontal: 40,
    },
    emptyRiskText: {
        fontSize: 13,
        color: "#6B7280",
    },
    reportImage: {
        width: "100%",
        height: 250,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        marginBottom: 16,
    },
});