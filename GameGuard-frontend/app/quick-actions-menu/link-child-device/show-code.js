import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Clipboard,
    SafeAreaView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ShowCodeScreen() {
    const params = useLocalSearchParams();
    const { childName, deviceId, age, childId } = params;
    const [copied, setCopied] = useState(false);

    const handleCopyCode = async () => {
        try {
            Clipboard.setString(deviceId);
            setCopied(true);
            Alert.alert('Copied!', `Device code ${deviceId} has been copied to clipboard.`);

            // Reset copied state after 3 seconds
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            Alert.alert('Error', 'Failed to copy code. Please try again.');
        }
    };

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `GameGuard Device Linking Code\n\nChild: ${childName}\nCode: ${deviceId}\n\nInstall GameGuard on your device and enter this code to link.`,
                title: 'GameGuard Linking Code',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleDone = () => {
        // Navigate to manage children or back to dashboard
        router.replace('/dashboard');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                </View>

                <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successIcon: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    codeCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
        marginBottom: 24,
    },
    codeHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        letterSpacing: 1,
        marginTop: 8,
    },
    codeBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#2563EB',
        borderStyle: 'dashed',
    },
    codeText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: 1,
    },
    childInfo: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    copyButton: {
        backgroundColor: '#2563EB',
    },
    shareButton: {
        backgroundColor: '#10B981',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    instructionsCard: {
        width: '100%',
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 16,
    },
    instructionsList: {
        gap: 12,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#F59E0B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#78350F',
        lineHeight: 20,
    },
    doneButton: {
        width: '100%',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    doneButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
