import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { registerChild } from '../../lib/api/quick_actions/link-child-device/register_child'; // adjust the path



export default function RegisterChildScreen() {
    const [childName, setChildName] = useState('');
    const [age, setAge] = useState('');

    const handleRegister = async () => {
        const userId = await AsyncStorage.getItem('userId'); // parent ID
        console.log('DEBUG:', userId);
        if (!userId) {
            Alert.alert('Error', 'Parent not logged in.');
            return;
        }

        if (!childName) {
            Alert.alert('Error', 'Please enter the child\'s name.');
            return;
        }

        if (!age) {
            Alert.alert('Error', "Please enter the child's age.");
            return;
        }

        try {
            // Call your backend API
            const response = await registerChild({
                parentId: userId,
                childName,
                age: parseInt(age),
            });

            // destructure child
            const { child } = response;

            // Navigate to the child profile page with returned info
            router.push({
                pathname: '../monitoring/device_linking',
                params: {
                    childName: child.childName,
                    age: child.age,
                    deviceId: child.deviceId, // backend generated
                    childId: child.id,
                },
            });

        } catch (err) {
            console.error(err);
            Alert.alert('Error', err.message || 'Failed to register child');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#F3F4F6' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Register Your Child</Text>
                <Text style={styles.subHeader}>Fill in your child's details to get started.</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Child's Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter name"
                        value={childName}
                        onChangeText={setChildName}
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter age"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        placeholderTextColor="#9CA3AF"
                    />

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Register Child</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 30,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 25,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#F9FAFB',
    },
    button: {
        marginTop: 30,
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#2563EB',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 4,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
