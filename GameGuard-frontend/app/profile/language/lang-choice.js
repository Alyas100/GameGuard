import { Stack, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


export default function LanguageSelectionScreen() {
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (lng) => {
        // 1. Change the global application language
        i18n.changeLanguage(lng);

        // 2. Automatically navigate back to the previous page (Profile/Settings)
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Select Language' }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <Text style={styles.sectionTitle}>App Language</Text>

                {/* Language Buttons Group */}
                <View style={styles.languageButtons}>
                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            i18n.language === 'en' && styles.langButtonActive,
                        ]}
                        onPress={() => handleLanguageChange('en')}
                    >
                        <Text style={[
                            styles.langButtonText,
                            i18n.language === 'en' && styles.langButtonTextActive,
                        ]}>
                            English
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.langButton,
                            i18n.language === 'ms' && styles.langButtonActive,
                        ]}
                        onPress={() => handleLanguageChange('ms')}
                    >
                        <Text style={[
                            styles.langButtonText,
                            i18n.language === 'ms' && styles.langButtonTextActive,
                        ]}>
                            Bahasa Melayu
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.note}>
                    Note: Changing the app language will not affect the language of game descriptions from external sources.
                </Text>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    languageButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    langButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    langButtonActive: {
        borderColor: '#2563EB', // Royal Blue
        backgroundColor: '#EFF6FF', // Light Blue
    },
    langButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    langButtonTextActive: {
        color: '#2563EB', // Royal Blue
    },
    note: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    }
});