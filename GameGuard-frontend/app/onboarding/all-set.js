import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { saveOnboardingProfile } from '../../lib/api/onboarding/save-profile'; // Adjust path

export default function AllSetScreen() {
    const params = useLocalSearchParams();
    const [isSaving, setIsSaving] = useState(false);

    // This hook logs the data you've collected.
    // In a real app, this is where you would make your
    // final API call to save all these preferences to your backend.
    useEffect(() => {
        console.log("✅ Onboarding complete! Final data to save:");
        console.log("Child Name:", params.childName);
        console.log("Age Range:", params.ageRange);
        console.log("Key Concerns:", params.concerns);
        console.log("Monitored Games (IDs):", params.monitoredGames);
    }, [params]);

    const handleFinish = async () => {
        setIsSaving(true);
        console.log('DEBUG-1:', params.userId);

        try {
            // --- 2. REMOVE SIMULATION, CALL REAL API ---
            await saveOnboardingProfile({
                userId: params.userId,
                childName: params.childName,
                ageRange: params.ageRange,
                concerns: params.concerns,
                monitoredGames: params.monitoredGames,
            });
            // ------------------------------------------

            console.log('DEBUG-2:', params.userId);

            // 3. On success, replace the navigation stack
            router.replace('/(tabs)/dashboard');

        } catch (err) {
            alert("Failed to save profile. Please try again.");
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* This View centers the main content */}
            <View style={styles.content}>
                <Text style={styles.emoji}>🎉</Text>

                <Text style={styles.title}>
                    You're all set!
                </Text>

                <Text style={styles.subtitle}>
                    Your profile is ready and we'll begin monitoring your selected games. You can change any of these settings later in your profile.
                </Text>
            </View>

            {/* This View pins the button to the bottom */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, isSaving && styles.buttonDisabled]}
                    onPress={handleFinish}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>Go to Dashboard</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

// These styles are consistent with your other pages
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light background
    },
    content: {
        flex: 1, // Takes up all available space
        justifyContent: 'center', // Centers content vertically
        alignItems: 'center', // Centers content horizontally
        padding: 24,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827', // Dark text
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280', // Medium gray text
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB', // Light border
        backgroundColor: '#FFFFFF',
    },
    button: {
        backgroundColor: '#3B82F6', // Your primary blue
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        backgroundColor: '#9CA3AF',
    },
});