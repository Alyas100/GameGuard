// app/(tabs)/_layout.js
import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// --- THEME CONSTANTS DEFINITION ---
// These are the two primary colors based on your "Trust Blue & Gray" theme.

const ACTIVE_COLOR = '#2563EB';       // Primary Brand: Royal Blue (for active state/links)
const INACTIVE_COLOR = '#6B7280';     // Secondary: Cool Gray (for inactive icons/labels)

const CENTER_BG_COLOR = ACTIVE_COLOR; // Center button uses the primary brand color
const TAB_BAR_BACKGROUND = '#FFFFFF'; // Ensures the tab bar itself is clean white

// --- This is your custom component for the "Report" button ---
// It's defined right in the layout file for simplicity.
const CustomTabButton = () => (
    <TouchableOpacity
        style={styles.centerButtonContainer}
        onPress={() => router.push('/report')} // Navigate to the report screen
    >
        <View style={styles.centerButton}>
            <Ionicons name="pencil-outline" size={28} color="#FFFFFF" />
        </View>
    </TouchableOpacity>
);

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false, // Hides the header on top of each screen
                tabBarActiveTintColor: ACTIVE_COLOR, // Active icon/label color
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarStyle: {
                    height: 80, // Taller bar to accommodate the center button
                    backgroundColor: TAB_BAR_BACKGROUND, // Set the background to white
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB', // Light separator line
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    paddingBottom: 10,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard" // Links to `app/(tabs)/dashboard.js`
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="Browse_games" // Links to `app/(tabs)/GameBrowserScreen.js`
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'search' : 'search-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="report" // Links to `app/(tabs)/report.js`
                options={{
                    title: 'Report',
                    tabBarButton: () => <CustomTabButton />, // Use your custom button
                }}
            />
            <Tabs.Screen
                name="Alerts" // Links to `app/(tabs)/myreports.js` (You must create this file)
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'notifications' : 'notifications-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings" // Links to `app/(tabs)/profile.js` (You must create this file)
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerButtonContainer: {
        flex: 1,
        alignItems: 'center',
    },
    centerButton: {
        transform: [{ translateY: -25 }], // Lifts the button up
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: CENTER_BG_COLOR, // <--- CHANGE: Use theme constant
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 4,
        borderColor: 'white', // Creates the "cutout" effect
    },

});