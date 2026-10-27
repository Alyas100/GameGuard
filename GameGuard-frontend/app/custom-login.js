// app/login.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import GameIcon from '../assets/images/app-logo.png';
import { loginUser } from '../lib/api/auth/login'; // Adjust path if needed

// This log is fine, but you can move it inside the component
// console.log("THE URI BEING CREATED:", makeRedirectUri({ useProxy: true }));

export default function LoginScreen() {
    // --- States ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Custom Email/Password Login ---
    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);
        console.log("Attempting login with:", email, password);
        try {
            // 3. Remove the simulation and call your real API
            const data = await loginUser(email, password);

            console.log("✅ Login successful:", data.user);


            // --- SAVE USER ID LOCALLY ---
            await AsyncStorage.setItem('userId', data.user.id.toString());


            // 4. On success, navigate to onboarding with the real name
            router.replace({
                pathname: '/onboarding/welcome',
                params: {
                    name: data.user.name,  // Pass the real name
                    userId: data.user.id // <-- PASS THE ID HERE
                }
            });
            console.log("User ID stored locally:", data.user.id);



        } catch (err) {
            // 5. Catch any errors (like "Invalid credentials")
            console.error(err);
            alert(`❌ Login Failed: ${err.message}`);
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

                    {/* <--- ADD THE IMAGE HERE: */}
                    <Image
                        source={GameIcon}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>GameGuard</Text>
                    <Text style={styles.subtitle}>Protecting Young Gamers</Text>
                </View>

                <View style={styles.loginCard}>
                    <Text style={styles.welcomeTitle}>Welcome Back</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Sign in to continue
                    </Text>

                    {/* --- NEW FIELDS --- */}
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
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                    {/* --- END NEW FIELDS --- */}


                </View>

                {/* Footer / Link to Register */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.push('/custom-register')}>
                        <Text style={styles.footerText}>
                            Do not have an account? <Text style={styles.linkText}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// --- STYLES (Includes your existing styles + new ones) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40, // Reduced margin
    },
    logo: {
        width: 120, // Adjust size as needed
        height: 120,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
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
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    // --- NEW STYLES ---
    input: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        color: '#1F2937',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#2563EB',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
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
        textAlign: 'center',
    },
    linkText: {
        color: '#2563EB',
        fontWeight: '600',
    }
});