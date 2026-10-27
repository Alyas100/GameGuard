import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { saveUserCountry } from '../../../lib/api/profile/country-choice';
// REMOVED: import Flag from 'react-native-country-flag';

// --- Country Data ---
// Function to convert country code (US) into a flag emoji (🇺🇸)
// This is necessary because the Flag component is removed.
const getFlagEmoji = (countryCode) => {
    // Converts country code (e.g., 'MY') to its Unicode flag emoji (🇲🇾)
    return countryCode
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

export const ALL_COUNTRIES = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Australia', code: 'AU' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Japan', code: 'JP' },
    { name: 'China', code: 'CN' },
    { name: 'India', code: 'IN' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Mexico', code: 'MX' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Italy', code: 'IT' },
    { name: 'Spain', code: 'ES' },
    { name: 'Russia', code: 'RU' },
    { name: 'South Africa', code: 'ZA' },
    { name: 'Argentina', code: 'AR' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Norway', code: 'NO' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Finland', code: 'FI' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Austria', code: 'AT' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Greece', code: 'GR' },
    { name: 'Ireland', code: 'IE' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'Singapore', code: 'SG' },
    { name: 'Malaysia', code: 'MY' },
    { name: 'Indonesia', code: 'ID' },
    { name: 'Thailand', code: 'TH' },
    { name: 'Philippines', code: 'PH' },
    { name: 'Vietnam', code: 'VN' },
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'Turkey', code: 'TR' },
    { name: 'Poland', code: 'PL' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'Nigeria', code: 'NG' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Colombia', code: 'CO' },
    { name: 'Chile', code: 'CL' },
    { name: 'Peru', code: 'PE' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Bangladesh', code: 'BD' },
    { name: 'Israel', code: 'IL' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Taiwan', code: 'TW' },
    { name: 'Algeria', code: 'DZ' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'Bulgaria', code: 'BG' },
    // Add more countries as needed
];

// Reusable component for a single country item in the list
const CountryItem = ({ country, onPress }) => (
    <TouchableOpacity style={styles.countryItem} onPress={() => onPress(country)}>
        {/* FIX: Use Text and emoji function instead of Flag component */}
        <Text style={styles.flagIcon}>{getFlagEmoji(country.code)}</Text>
        <Text style={styles.countryName}>{country.name}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

export default function CountrySelectionScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(ALL_COUNTRIES.find(c => c.code === 'MY'));
    const [userId, setUserId] = useState(null);


    const filteredCountries = useMemo(() => {
        if (!searchQuery) {
            return ALL_COUNTRIES;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();
        return ALL_COUNTRIES.filter(country =>
            country.name.toLowerCase().includes(lowerCaseQuery)
        );
    }, [searchQuery]);


    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                const storedUserId = userId ? parseInt(userId, 10) : null;  // parse into integer or null

                if (storedUserId) {
                    setUserId(storedUserId);
                    console.log('User ID loaded from storage:', storedUserId);
                }
            } catch (error) {
                console.error('Failed to load user ID:', error);
            }
        };

        fetchUserId();
    }, []);


    /**
      * Handles selection: calls the API to save the country, then navigates back.
      */
    const handleSelectCountry = async (country) => { // <-- MAKE THIS ASYNC

        // Failsafe check
        if (!userId) {
            console.error("User ID is missing. Cannot save country preference.");
            return;
        }

        setSelectedCountry(country);

        try {
            // 1. Call the API to save the country code (e.g., 'MY') to the User model
            await saveUserCountry(userId, country.code);
            console.log(`✅ Saved country ${country.name} to DB for User ${userId}`);

            // 2. Pass the selected NAME back to the previous screen (LanguageAndRegionScreen)
            router.setParams({ selectedCountryName: country.name });

            // 3. Navigate back to the previous screen
            router.back();

        } catch (error) {
            console.error('❌ Failed to save country:', error.message);
            alert(`Failed to save country: ${error.message}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back-outline" size={24} color="#111827" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.header}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Section Title */}
                <Text style={styles.sectionTitle}>Country</Text>
            </View>

            {/* Country List */}
            <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                    <CountryItem country={item} onPress={handleSelectCountry} />
                )}
                ListFooterComponent={<View style={{ height: 30 }} />}
            />
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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E7EB', // Light gray background for search bar
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 40,
        marginBottom: 20,
        marginTop: 10, // Gives some space from the top header
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    flagIcon: {
        // FIX: Increase font size for emoji flag
        fontSize: 30,
        marginRight: 15,
        // Removed old flagIcon styles
    },
    countryName: {
        flex: 1, // Takes up remaining space
        fontSize: 16,
        color: '#111827',
    },
    // The chevron-forward-outline from Ionicons used in CountryItem will have its own color/size
});

