import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { linkDevice } from '../../../lib/api/quick_actions/child-app/link_device';

export default function ChildEnterCodeScreen() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleLinkDevice = async () => {
        if (!code.trim()) {
            Alert.alert('Required', 'Please enter the linking code from your parent.');
            return;
        }

        setLoading(true);

        try {
            // Get device info
            const deviceType = Platform.OS; // 'ios' or 'android'
            const deviceModel = Platform.constants?.Model || 'Unknown';

            const data = await linkDevice({
                deviceId: code.trim(),
                linkedDeviceType: deviceType,
                linkedDeviceModel: deviceModel,
            });

            if (data.success) {
                setSuccess(true);
                Alert.alert(
                    'Success! 🎉',
                    'Your device has been linked successfully. Your parent can now monitor your gaming activity.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/dashboard'),
                        },
                    ]
                );
            } else {
                Alert.alert('Invalid Code', data.message || 'The code you entered is invalid or has expired. Please check with your parent.');
            }
        } catch (error) {
            console.error('Link device error:', error);
            Alert.alert('Connection Error', 'Unable to connect to server. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    {!success ? (
                        <>
                            <View style={styles.iconContainer}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="phone-portrait-outline" size={60} color="#2563EB" />
                                </View>
                            </View>

                            <Text style={styles.title}>Link Your Device</Text>
                            <Text style={styles.subtitle}>
                                Enter the code your parent shared with you to link this device
                            </Text>

                            <View style={styles.formCard}>
                                <Text style={styles.label}>Linking Code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. DEV-17-1764742426292"
                                    value={code}
                                    onChangeText={setCode}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholderTextColor="#9CA3AF"
                                    editable={!loading}
                                />

                                <View style={styles.infoBox}>
                                    <Ionicons name="information-circle-outline" size={20} color="#2563EB" />
                                    <Text style={styles.infoText}>
                                        Ask your parent for the linking code. It looks like DEV-XX-XXXXX
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.linkButton, loading && styles.buttonDisabled]}
                                    onPress={handleLinkDevice}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="link-outline" size={20} color="#FFFFFF" />
                                            <Text style={styles.linkButtonText}>Link My Device</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.helpCard}>
                                <Text style={styles.helpTitle}>Need help?</Text>
                                <Text style={styles.helpText}>
                                    • Make sure you entered the code correctly
                                    {'\n'}• The code should start with "DEV-"
                                    {'\n'}• If it doesn't work, ask your parent for a new code
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={100} color="#10B981" />
                            <Text style={styles.successTitle}>Device Linked!</Text>
                            <Text style={styles.successText}>
                                Your device is now connected to your parent's account. They can monitor your gaming activity to keep you safe.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
        marginBottom: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 18,
    },
    linkButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#93C5FD',
    },
    linkButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    helpCard: {
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    helpTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
        marginBottom: 8,
    },
    helpText: {
        fontSize: 13,
        color: '#78350F',
        lineHeight: 20,
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 20,
        marginBottom: 12,
    },
    successText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 24,
    },
});
