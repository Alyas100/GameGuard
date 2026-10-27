import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // For language switching
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';



// Reusable button component for the menu
const ProfileButton = ({ icon, text, subtext, onPress, isLast = false }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
        <Ionicons name={icon} size={24} color="#6B7280" style={styles.menuIcon} />
        <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>{text}</Text>
            {subtext && <Text style={styles.menuSubtext}>{subtext}</Text>}
        </View>
        <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    // TODO: Replace with a real API call to fetch user/child data
    const [user, setUser] = useState({ name: '', email: '' });
    const [children, setChildren] = useState([]);

    useEffect(() => {
        // Simulate fetching user data
        setTimeout(() => {
            setUser({
                name: 'Alyas Muhd',
                email: 'alyasmuhd1234@gmail.com',
            });
            setChildren([
                { id: 1, name: 'Alex', ageRange: '8-12' }
            ]);
            setIsLoading(false);
        }, 500);
    }, []);

    const handleLogout = () => {
        // Clear any user session/token here
        console.log('User logging out...');
        router.replace('/login'); // Replace entire (tabs) stack with login screen
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            {/* User Card */}
            <View style={styles.userCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                </View>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            {/* preference Section */}
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.menuGroup}>
                <ProfileButton
                    icon="language-outline"
                    text="Language"
                    subtext={i18n.language === 'en' ? 'English' : 'Bahasa Melayu'} // Show current status
                    onPress={() => router.push('/profile/language-settings')} // New target page
                />
                <View style={styles.menuButton}>
                    <Ionicons name="notifications-outline" size={24} color="#6B7280" style={styles.menuIcon} />
                    <View style={styles.menuTextContainer}>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Text style={styles.menuSubtext}>{notificationsEnabled ? 'On' : 'Off'}</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                        thumbColor={notificationsEnabled ? '#2563EB' : '#F3F4F6'}
                        ios_backgroundColor="#D1D5DB"
                    />
                </View>
            </View>



            {/* My Content Section */}
            <Text style={styles.sectionTitle}>My Content</Text>
            <View style={styles.menuGroup}>

                <ProfileButton
                    icon="document-text-outline"
                    text="My Submitted Reports"
                    onPress={() => router.push('/profile/my-submitted-reports')}
                    isLast={true}
                />
            </View>



            {/* Logout Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light gray background
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 125
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '600',
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
    },
    userEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    menuGroup: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    menuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    menuSubtext: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    menuArrow: {
        fontSize: 20,
        color: '#9CA3AF',
    },
    languageContainer: {
        padding: 16,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 12,
    },
    languageButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    langButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    langButtonActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    langButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    langButtonTextActive: {
        color: '#3B82F6',
    },
    footer: {
        padding: 20,
        marginTop: 24,
        marginBottom: 40,
    },
    logoutButton: {
        backgroundColor: '#f88d8d', // Softer red
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        alignSelf: 'center',
        width: '65%',
    },
    logoutButtonText: {
        color: '#ffffff', // White text
        fontSize: 16,
        fontWeight: '600',
    },
});