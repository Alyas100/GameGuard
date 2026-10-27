import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Define the age brackets you use in your app
const ageBrackets = [
    { label: 'Ages 3-7', value: '3-7' },
    { label: 'Ages 8-12', value: '8-12' },
    { label: 'Ages 13-16', value: '13-16' },
    { label: 'Ages 17+', value: '17+' },
];

export default function ChildProfileScreen() {
    const params = useLocalSearchParams();

    const [name, setName] = useState('');
    const [ageRange, setAgeRange] = useState(null);

    // Check if the form is valid (name is not empty and an age is selected)
    const isFormValid = name.trim().length > 0 && ageRange !== null;

    const handleNext = () => {
        if (!isFormValid) return; // Failsafe

        // Navigate to the next step, passing the data
        router.push({
            pathname: '/onboarding/key-concerns',
            params: {
                ...params, // <-- Passes { name, userId }
                childName: name, // Add the new data
                ageRange: ageRange
            }, // Pass the data to the next screen
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    <Text style={styles.emoji}>👶</Text>

                    <Text style={styles.title}>
                        Tell us about your child
                    </Text>

                    <Text style={styles.subtitle}>
                        This helps us personalize recommendations and set default safety filters.
                    </Text>

                    {/* Name Input */}
                    <Text style={styles.formLabel}>Child's Name or Nickname</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Alex or 'My Son'"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    {/* Age Group Selection */}
                    <Text style={styles.formLabel}>Age Group</Text>
                    <View style={styles.ageChipsContainer}>
                        {ageBrackets.map((bracket) => (
                            <TouchableOpacity
                                key={bracket.value}
                                style={[
                                    styles.chip,
                                    ageRange === bracket.value && styles.chipActive,
                                ]}
                                onPress={() => setAgeRange(bracket.value)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        ageRange === bracket.value && styles.chipTextActive,
                                    ]}
                                >
                                    {bracket.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={styles.stepIndicator}>Step 2 of 4</Text>
            </ScrollView>

            {/* This View pins the buttons to the bottom */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, !isFormValid && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={!isFormValid}
                >
                    <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/dashboard')}>
                    <Text style={styles.skipButtonText}>Skip setup</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// These styles are consistent with your other pages
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light background
    },
    contentContainer: {
        flexGrow: 1, // Allows ScrollView to take full height
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
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        color: '#111827',
        marginBottom: 24,
    },
    ageChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    chip: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
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
        flex: 1, // Takes 1 part of the space
        backgroundColor: '#F3F4F6', // Light gray
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#374151', // Dark gray text
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        flex: 2, // Takes 2 parts of the space
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
    buttonDisabled: {
        backgroundColor: '#9CA3AF', // Gray when disabled
    },
});