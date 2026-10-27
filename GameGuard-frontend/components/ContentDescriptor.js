import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

// --- ICON MAPPING ---
// Maps the string category name from your mock data to a suitable Ionicons name.
const DESCRIPTOR_ICONS = {
    // Standard PEGI-based content warnings
    Violence: 'skull-outline',
    Drugs: 'flask-outline',
    BadLanguage: 'chatbubble-ellipses-outline',
    Sex: 'heart-dislike-outline',
    Discrimination: 'ban-outline',

    // Additional real-time risks from your app's analysis
    InGamePurchases: 'cart-outline',
    Scams: 'wallet-outline',
    Bullying: 'hand-left-outline',
    Predatory: 'eye-outline',
};

// --- COMPONENT ---
// Displays a single content warning tag (icon + text) with its detailed description.
const ContentDescriptor = ({ title, description, color }) => {
    // Get the icon name safely, defaulting to a generic help icon if not found
    const iconName = DESCRIPTOR_ICONS[title] || 'help-circle-outline';

    // Use the color passed from the Game Detail Screen (e.g., the PEGI Orange/Red)
    const displayColor = color || '#F59E0B';

    return (
        // The container uses the descriptor's color for the prominent left highlight bar
        <View style={[styles.container, { borderLeftColor: displayColor }]}>

            {/* TOP ROW: ICON & TITLE TAG (The Scannable Part) */}
            <View style={styles.tagRow}>
                {/* Icon is colored by the descriptor's color */}
                <Ionicons name={iconName} size={20} color={displayColor} style={styles.icon} />
                <Text style={[styles.titleText, { color: displayColor }]}>
                    {title.toUpperCase()}
                </Text>
            </View>

            {/* BOTTOM ROW: SMALL DESCRIPTION (The Detail/Justification Part) */}
            {description && (
                <Text style={styles.descriptionText}>
                    {description}
                </Text>
            )}

        </View>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderLeftWidth: 4, // The colored bar on the left
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    titleText: {
        fontSize: 16,
        fontWeight: '700',
    },
    descriptionText: {
        fontSize: 13,
        color: '#6B7280', // Cool Gray for the secondary text
        marginLeft: 28, // Indent the text to align with the start of the title
        lineHeight: 18,
    },
});

export default ContentDescriptor;