import { Ionicons } from '@expo/vector-icons'; // Used for the back and forward arrows
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next'; // To display current language
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getUserProfile } from '../../lib/api/auth/getUserProfile'; // <-- make an API call to get user profile
import { ALL_COUNTRIES } from '../profile/language/country-selection';


// Build a lookup map: code -> full name
const COUNTRY_MAP = ALL_COUNTRIES.reduce((map, country) => {
    map[country.code] = country.name;
    return map;
}, {});




// Reusable button component for settings list items (like the Trivago image)
const SettingButton = ({ title, subtext, onPress, isLast = false }) => (
    <TouchableOpacity
        style={[styles.settingButton, isLast && { borderBottomWidth: 0 }]}
        onPress={onPress}
    >
        <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtext && <Text style={styles.settingSubtext}>{subtext}</Text>}
        </View>
        {/* The forward chevron arrow */}
        <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

export default function LanguageAndRegionScreen() {
    const { i18n } = useTranslation();

    const [currentCountry, setCurrentCountry] = useState('Malaysia'); // Default fallback
    const currentLanguageName = i18n.language === 'en' ? 'English (Malaysia)' : 'Bahasa Melayu (Malaysia)';

    // everytime this page is focused, it will refethc latest data from backend
    useFocusEffect(
        useCallback(() => {
            const loadUserProfile = async () => {
                try {
                    const userId = await AsyncStorage.getItem('userId');
                    console.log('🔍 Loaded userId from AsyncStorage:', userId);

                    if (!userId) return;

                    const profile = await getUserProfile(userId);

                    if (profile && profile.countryCode) {
                        const countryName = COUNTRY_MAP[profile.countryCode] || profile.countryCode;
                        setCurrentCountry(countryName);
                        console.log("DEBUG: Country from backend:", countryName);
                    }
                } catch (err) {
                    console.error('❌ Failed to load user profile:', err);
                }
            };

            loadUserProfile();
        }, [])
    );



    return (
        <SafeAreaView style={styles.container}>
            {/* Header Configuration */}
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '', // We use a custom title below
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back-outline" size={24} color="#111827" />
                        </TouchableOpacity>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Main Page Title Section */}
                <Text style={styles.pageTitle}>Language and country</Text>
                <Text style={styles.pageSubtitle}>Choose your preferred language and country</Text>

                {/* --- SETTINGS LIST GROUP --- */}
                <View style={styles.menuGroup}>

                    {/* 1. COUNTRY ROW */}
                    <SettingButton
                        title="Country"
                        subtext={currentCountry}
                        onPress={() => router.push('/profile/language/country-selection')} // New target screen
                        isLast={false}
                    />

                    {/* 2. LANGUAGE ROW */}
                    <SettingButton
                        title="Language"
                        subtext={currentLanguageName}
                        onPress={() => router.push('/profile/language/lang-choice')} // New target screen
                        isLast={true}
                    />

                    {/* NOTE: Currency row is intentionally omitted here */}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    backButton: {
        marginLeft: 10,
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
    },
    menuGroup: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        marginBottom: 20,
    },
    // --- SETTING BUTTON STYLES ---
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    settingSubtext: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    // --- END SETTING BUTTON STYLES ---
});