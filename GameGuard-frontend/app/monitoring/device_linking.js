import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Clipboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeviceLinkScreen() {
    const params = useLocalSearchParams();
    const { childName, deviceId } = params;

    console.log('DEBUG', params);

    const handleCopy = () => {
        Clipboard.setString(deviceId);
        Alert.alert('Copied', `Device ID ${deviceId} copied to clipboard`);
    };
    console.log('DEBUG', deviceId);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Link {childName}'s Device</Text>
            <Text style={styles.subHeader}>
                Use the unique code below to securely link the GameGuard Child App on their device.
            </Text>

            <View style={styles.card}>
                <Ionicons name="link-outline" size={60} color="#2563EB" style={styles.icon} />
                <Text style={styles.deviceLabel}>UNIQUE DEVICE ID</Text>
                <Text style={styles.deviceId}>{deviceId}</Text>

                <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                    <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.copyButtonText}>Copy ID</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={() => router.replace('/dashboard')}>
                <Text style={styles.doneButtonText}>Done (Go to Dashboard)</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 40,
    },
    icon: {
        marginBottom: 15,
    },
    deviceLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 5,
    },
    deviceId: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 15,
        letterSpacing: 1,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    copyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    doneButton: {
        backgroundColor: '#10B981',
        paddingVertical: 16,
        paddingHorizontal: 25,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
