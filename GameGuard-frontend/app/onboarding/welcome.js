import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
    // 1. Get the user's name passed from the login screen
    const params = useLocalSearchParams();

    // Provide a fallback in case the name is missing
    const displayName = params.name || 'Parent';

    // 2. Define the navigation to the next step
    const handlePress = () => {
        console.log("DBG-WELCOME: Passing params:", params); // This will log { name: '...', userId: '...' }
        // Navigate to the next step in your onboarding flow
        // (You will need to create this 'child-profile' file next)

        router.push({
            pathname: '/onboarding/child-profile',
            params: params // <-- 'params' already contains { name, userId }
        });
    };

    return (
        <View style={styles.container}>
            {/* This View centers the main content */}
            <View style={styles.content}>
                <Text style={styles.emoji}>🛡️</Text>

                <Text style={styles.title}>
                    Welcome, {displayName}!
                </Text>

                <Text style={styles.subtitle}>
                    We're glad you're here. Let's get your GameGuard profile set up in just a few quick steps.
                </Text>

                <Text style={styles.stepIndicator}>
                    Step 1 of 4
                </Text>
            </View>

            {/* This View pins the button to the bottom */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handlePress}>
                    <Text style={styles.buttonText}>Let's Go!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/dashboard')}>
                    <Text style={styles.skipButtonText}>Skip setup</Text>
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
    stepIndicator: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF', // Light gray text
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
    skipButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    skipButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
});