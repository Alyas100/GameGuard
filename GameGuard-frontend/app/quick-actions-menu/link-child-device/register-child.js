import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { registerChild } from '../../../lib/api/quick_actions/link-child-device/register_child';

export default function RegisterChildScreen() {
    const [childName, setChildName] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // Validation
        if (!childName.trim()) {
            Alert.alert('Required', 'Please enter the child\'s name.');
            return;
        }

        if (!age.trim()) {
            Alert.alert('Required', 'Please enter the child\'s age.');
            return;
        }

        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
            Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 18.');
            return;
        }

        setLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');

            if (!userId) {
                Alert.alert('Error', 'Parent not logged in. Please log in again.');
                setLoading(false);
                return;
            }

            // Call backend API to register child
            const response = await registerChild({
                parentId: userId,
                childName: childName.trim(),
                age: ageNum,
            });

            const { child } = response;

            Alert.alert(
                'Success',
                `${child.childName} has been added successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/quick-actions-menu/link-child-device/manage-children'),
                    },
                ]
            );

        } catch (err) {
            console.error('Registration error:', err);
            Alert.alert('Error', err.message || 'Failed to register child. Please try again.');
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
                    <View style={styles.header}>
                        <Text style={styles.title}>Register Your Child</Text>
                        <Text style={styles.subtitle}>
                            Enter your child's details to create a profile
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Child's Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter child's full name"
                                value={childName}
                                onChangeText={setChildName}
                                placeholderTextColor="#9CA3AF"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Age *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter age (1-18)"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                                placeholderTextColor="#9CA3AF"
                                maxLength={2}
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Save</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
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
    header: {
        alignItems: 'center',
        marginBottom: 30,
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
        paddingHorizontal: 20,
    },
    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    inputGroup: {
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
    },
    button: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#93C5FD',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
});
