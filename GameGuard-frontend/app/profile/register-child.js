import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
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
import { registerChildSimple } from '../../lib/api/profile/register_child';

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
            const response = await registerChildSimple({
                parentId: parseInt(userId),
                childName: childName.trim(),
                age: ageNum,
            });

            Alert.alert(
                'Success!',
                `${response.child.childName} has been registered successfully.`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
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
            <Stack.Screen options={{ title: 'Register Child' }} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.header}>
                        <Ionicons name="person-add" size={64} color="#007AFF" />
                        <Text style={styles.title}>Register Your Child</Text>
                        <Text style={styles.subtitle}>
                            Add your child's profile to start monitoring
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
                                autoCapitalize="words"
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
                                keyboardType="number-pad"
                                maxLength={2}
                                editable={!loading}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.buttonIcon} />
                                    <Text style={styles.registerButtonText}>Register Child</Text>
                                </>
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
        backgroundColor: '#f8f9fa',
    },
    container: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1f2937',
    },
    registerButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        gap: 8,
    },
    registerButtonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonIcon: {
        marginRight: 4,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 16,
        fontWeight: '500',
    },
});
