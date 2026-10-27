import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// These are your app's core risk categories
// We use the exact strings from your 'SubmitReportScreen' for consistency
const ALL_CONCERNS = [
    '🚨 Predatory Behavior',
    '⚔️ Violence',
    '🔞 Sexual Content',
    '😢 Bullying',
    '💰 Scams',
    '💬 Hate Speech',
    '🕌 Religion Concerns',
];

export default function KeyConcernsScreen() {
    const params = useLocalSearchParams();
    const [selectedConcerns, setSelectedConcerns] = useState([]);

    // Toggles a concern in the state array
    const toggleConcern = (concern) => {
        if (selectedConcerns.includes(concern)) {
            setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
        } else {
            setSelectedConcerns([...selectedConcerns, concern]);
        }
    };

    const handleNext = () => {
        // Navigate to the next step, passing all collected data
        router.push({
            pathname: '/onboarding/monitor-games',
            params: {
                ...params, // This passes along 'name' and 'ageRange'
                concerns: JSON.stringify(selectedConcerns), // Add the new data
            },
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.content}>
                    <Text style={styles.emoji}>😟</Text>

                    <Text style={styles.title}>
                        What are your key concerns?
                    </Text>

                    <Text style={styles.subtitle}>
                        Select all that apply. This will help us customize your dashboard to
                        highlight what matters most to you.
                    </Text>

                    {/* Concerns Selection */}
                    <View style={styles.chipsContainer}>
                        {ALL_CONCERNS.map((concern) => (
                            <TouchableOpacity
                                key={concern}
                                style={[
                                    styles.chip,
                                    selectedConcerns.includes(concern) && styles.chipActive,
                                ]}
                                onPress={() => toggleConcern(concern)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedConcerns.includes(concern) && styles.chipTextActive,
                                    ]}
                                >
                                    {concern}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.stepIndicator}>Step 3 of 4</Text>
            </ScrollView>

            {/* This View pins the buttons to the bottom */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Next</Text>
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
    contentContainer: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 24,
        textAlign: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF',
        textAlign: 'center',
        paddingBottom: 16,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    chip: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
    },
    chipActive: {
        backgroundColor: '#EFF6FF', // Light blue
        borderColor: '#3B82F6', // Primary blue
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    chipTextActive: {
        color: '#3B82F6',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        gap: 12,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        flex: 2,
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
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