// app/register.js
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { registerUser } from '../lib/api/auth/register'; // Adjust path if needed

export default function RegisterScreen() {
    // --- States ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Custom Email/Password Register ---
    const handleRegister = async () => {
        if (loading) return;
        setLoading(true);
        console.log("Attempting to register with:", name, email, password);
        try {
            // 3. Remove the simulation and call your real API
            const data = await registerUser(name, email, password);

            console.log("✅ Registration successful:", data.user);
            await AsyncStorage.setItem('userId', data.user.id.toString());

            // 4. On success, navigate to onboarding with the real name
            router.replace({
                pathname: '/onboarding/welcome',
                params: {
                    name: data.user.name,  // Pass the real name
                    userId: data.user.id
                }

            });

        } catch (err) {
            // 5. Catch any errors (like "Email already in use")
            console.error(err);
            alert(`❌ Registration Failed: ${err.message}`);
        } finally {
            // 6. Always stop the loading spinner
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>🛡️ GameGuard</Text>
                    <Text style={styles.subtitle}>Protecting Young Gamers</Text>
                </View>

                <View style={styles.loginCard}>
                    <Text style={styles.welcomeTitle}>Create Account</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Get started by creating your profile
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                    <TouchableOpacity
                        style={[styles.button, (loading) && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer / Link to Login */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.replace('/custom-login')}>
                        <Text style={styles.footerText}>
                            Already have an account? <Text style={styles.linkText}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// --- STYLES (Copied from login.js for consistency) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    loginCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        color: '#111827',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8, // Added margin top
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    footer: {
        marginTop: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center'
    },
    linkText: {
        color: '#3B82F6',
        fontWeight: '600',
    }
});