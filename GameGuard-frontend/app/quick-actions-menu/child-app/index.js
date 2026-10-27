import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChildAppHub() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="shield-checkmark-outline" size={80} color="#10B981" />
                    <Text style={styles.title}>Child Device Setup</Text>
                    <Text style={styles.subtitle}>
                        Connect your device to your parent's GameGuard account
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.infoSection}>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={styles.infoText}>Your parent can help keep you safe while gaming</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={styles.infoText}>They'll be notified of risky games or content</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={styles.infoText}>Gaming should be fun AND safe!</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/quick-actions-menu/child-app/enter-code')}
                    >
                        <Ionicons name="key-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Enter Linking Code</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => Alert.alert('Coming Soon', 'QR code scanning will be available soon!')}
                    >
                        <Ionicons name="qr-code-outline" size={24} color="#2563EB" />
                        <Text style={styles.secondaryButtonText}>Scan QR Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerCard}>
                    <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
                    <Text style={styles.footerText}>
                        Ask your parent for the linking code. They can generate it from their GameGuard app.
                    </Text>
                </View>
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
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 20,
    },
    infoSection: {
        gap: 16,
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 15,
        color: '#374151',
        lineHeight: 20,
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    secondaryButton: {
        backgroundColor: '#EEF2FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
        borderWidth: 2,
        borderColor: '#2563EB',
    },
    secondaryButtonText: {
        color: '#2563EB',
        fontSize: 17,
        fontWeight: '700',
    },
    footerCard: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    footerText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
});
