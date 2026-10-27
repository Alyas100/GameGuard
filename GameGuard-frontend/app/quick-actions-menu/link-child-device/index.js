import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LinkChildDeviceHub() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="phone-portrait-outline" size={60} color="#2563EB" />
                    <Text style={styles.title}>Link Child Device</Text>
                    <Text style={styles.subtitle}>
                        Add and manage child profiles for monitoring
                    </Text>
                </View>

                <View style={styles.optionsContainer}>
                    {/* Option 1: Register New Child */}
                    <TouchableOpacity
                        style={styles.optionCard}
                        onPress={() => router.push('/quick-actions-menu/link-child-device/register-child')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="person-add-outline" size={32} color="#2563EB" />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Add New Child</Text>
                            <Text style={styles.optionDescription}>
                                Register a new child profile
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Option 2: View Existing Children */}
                    <TouchableOpacity
                        style={styles.optionCard}
                        onPress={() => router.push('/quick-actions-menu/link-child-device/manage-children')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                            <Ionicons name="people-outline" size={32} color="#10B981" />
                        </View>
                        <View style={styles.optionContent}>
                            <Text style={styles.optionTitle}>Manage Children</Text>
                            <Text style={styles.optionDescription}>
                                View and edit your children profiles
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                    </TouchableOpacity>

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle-outline" size={24} color="#2563EB" />
                        <Text style={styles.infoText}>
                            You can add, review, and update children profiles here anytime.
                        </Text>
                    </View>
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
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
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
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    },
});
