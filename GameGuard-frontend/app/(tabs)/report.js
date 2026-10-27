// SubmitReportScreen.js

import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native'; // Platform is needed if want to check Platform.OS === 'ios'. (in this case it used for 'date picker')
import { submitReport } from "../../lib/api/report/send_report";





import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { fetchGames } from "../../lib/api/report/games_autocomplete";


export default function SubmitReportScreen() {
    console.log("🟢 SubmitReportScreen mounted");

    const [selectedGame, setSelectedGame] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [agreedToTerms, setAgreedToTerms] = useState(true);
    const [imageUri, setImageUri] = useState(null);
    const [gameSearchQuery, setGameSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCustomGame, setIsCustomGame] = useState(false);
    const [popularGames, setPopularGames] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedGameId, setSelectedGameId] = useState(null);


    useEffect(() => {
        const loadGames = async () => {
            try {
                const data = await fetchGames(gameSearchQuery);
                console.log("✅ Loaded games:", data);
                setPopularGames(data);
            } catch (err) {
                console.error("❌ fetch error:", err);
            }
        };

        // only call when user starts typing
        if (gameSearchQuery.length > 0) {
            loadGames();
        }
    }, [gameSearchQuery]);


    // Filter games based on search query
    const filteredGames = popularGames.filter(game =>
        game.name.toLowerCase().includes(gameSearchQuery.toLowerCase())
    );

    const selectGame = (game) => {
        setSelectedGame(game.name);
        setSelectedGameId(game.id);
        setGameSearchQuery(game.name);
        setShowSuggestions(false);
        setIsCustomGame(false);
    };

    const handleCustomGame = () => {
        setSelectedGame(gameSearchQuery);
        setSelectedGameId(null); // Custom games have no ID yet
        setIsCustomGame(true);
        setShowSuggestions(false);
    };

    const platforms = [
        '💻 PC',
        '🎮 PlayStation',
        '🎮 Xbox',
        '🎮 Nintendo Switch',
        '📱 iOS (iPhone/iPad)',
        '📱 Android'
    ];
    const categories = [
        '🚨 Predatory Behavior',
        '⚔️ Violence',
        '🔞 Sexual Content',
        '😢 Bullying',
        '💰 Scams',
        '💬 Hate Speech',
        '🕌 Religion Concerns',
    ];

    const onChangeDate = (event, date) => {
        setShowPicker(Platform.OS === 'ios'); // keep picker open on iOS
        if (date) {
            setSelectedDate(date);
        }
    }

    const togglePlatform = (platform) => {
        if (selectedPlatforms.includes(platform)) {
            // If it's already selected, remove it
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
        } else {
            // If not selected, add it
            setSelectedPlatforms([...selectedPlatforms, platform]);
        }
    };

    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    // logic for uploading image(screenshot)
    const pickImage = async () => {
        // Ask permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access gallery is required!');
            return;
        }

        // Launch image picker
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]); // result.assets[0] contains uri, width, height, type
            console.log("Selected image:", result.assets[0]);
        }
    };


    async function handleSubmit() {
        if (!selectedGame || !description || !agreedToTerms) return;

        try {
            await submitReport({
                selectedGame,
                selectedGameId,
                selectedPlatforms,
                description,
                agreedToTerms,
                selectedImage,
                selectedCategories,
                selectedDate,
            });

            alert("✅ Report submitted!");
        } catch (err) {
            console.error("Full submit error details:", err);
            alert("❌ Failed to submit report. Please try again.");
        }
    }


    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>

                <Text style={styles.headerTitle}>Submit Report</Text>
            </View>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <Text style={styles.infoBannerTitle}>
                    🛡️ Help Protect Other Children
                </Text>
                <Text style={styles.infoBannerText}>
                    Your report helps other parents make informed decisions. All reports are anonymous and will be reviewed by our AI system.
                </Text>
            </View>

            {/* Section 1: Game Selection */}
            <View style={styles.formSection}>
                <View style={styles.labelContainer}>
                    <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>1</Text>
                    </View>
                    <Text style={styles.formLabel}>
                        Select Game <Text style={styles.required}>*</Text>
                    </Text>
                </View>

                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search or type game name..."
                        placeholderTextColor="#9CA3AF"
                        value={gameSearchQuery}
                        onChangeText={(text) => {
                            setGameSearchQuery(text);
                            setShowSuggestions(text.length > 0);
                            setSelectedGame('');
                        }}
                        onFocus={() => setShowSuggestions(gameSearchQuery.length > 0)}
                    />
                    {gameSearchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setGameSearchQuery('');
                                setSelectedGame('');
                                setShowSuggestions(false);
                            }}
                        >
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                    <View style={styles.suggestionsContainer}>
                        {filteredGames.length > 0 ? (
                            <>
                                <Text style={styles.suggestionsHeader}>Popular Games</Text>
                                {filteredGames.slice(0, 5).map((game) => (
                                    <TouchableOpacity
                                        key={game.id}
                                        style={styles.suggestionItem}
                                        onPress={() => selectGame(game)}
                                    >
                                        <Text style={styles.suggestionIcon}>🎮</Text>
                                        <Text style={styles.suggestionText}>{game.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        ) : (
                            <View style={styles.noResults}>
                                <Text style={styles.noResultsText}>
                                    No popular games found
                                </Text>
                            </View>
                        )}

                        {/* Add Custom Game Option */}
                        {gameSearchQuery.length >= 3 && (
                            <TouchableOpacity
                                style={styles.customGameOption}
                                onPress={handleCustomGame}
                            >
                                <Text style={styles.customGameIcon}>➕</Text>
                                <View style={styles.customGameTextContainer}>
                                    <Text style={styles.customGameText}>
                                        Add &quot;{gameSearchQuery}&quot; manually
                                    </Text>
                                    <Text style={styles.customGameSubtext}>
                                        Game not in our database
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Selected Game Display */}
                {selectedGame && !showSuggestions && (
                    <View style={styles.selectedGameContainer}>
                        <View style={styles.selectedGameBadge}>
                            <Text style={styles.selectedGameIcon}>
                                {isCustomGame ? '📝' : '🎮'}
                            </Text>
                            <Text style={styles.selectedGameText}>{selectedGame}</Text>
                            {isCustomGame && (
                                <View style={styles.customBadge}>
                                    <Text style={styles.customBadgeText}>Custom</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedGame('');
                                setGameSearchQuery('');
                                setIsCustomGame(false);
                            }}
                        >
                            <Text style={styles.changeGameText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.helpText}>
                    💡 Start typing to search from 1000+ games, or add your own
                </Text>

                {/* OR: Popular Games Quick Select */}
                <Text style={styles.orDivider}>OR SELECT FROM POPULAR</Text>
                <View style={styles.popularGamesGrid}>
                    {popularGames.slice(0, 6).map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            style={styles.popularGameChip}
                            onPress={() => selectGame(game)}
                        >
                            <Text style={styles.popularGameText}>{game.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Section 2: Platform */}
            <View style={styles.formSection}>
                <View style={styles.labelContainer}>
                    <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>2</Text>
                    </View>
                    <Text style={styles.formLabel}>
                        Platform Used <Text style={styles.required}>*</Text>
                    </Text>
                </View>

                <View style={styles.platformPills}>
                    {platforms.map((platform) => (
                        <TouchableOpacity
                            key={platform}
                            style={[
                                styles.pill,
                                selectedPlatforms.includes(platform) && styles.pillActive // <-- Checks array
                            ]}
                            onPress={() => togglePlatform(platform)} // <-- Use toggle function
                        >
                            <Text style={[
                                styles.pillText,
                                selectedPlatforms.includes(platform) && styles.pillTextActive // <-- Checks array
                            ]}>
                                {platform}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Section 3: Description */}
            <View style={styles.formSection}>
                <View style={styles.labelContainer}>
                    <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>3</Text>
                    </View>
                    <Text style={styles.formLabel}>
                        Describe What Happened <Text style={styles.required}>*</Text>
                    </Text>
                </View>

                <TextInput
                    style={styles.textarea}
                    multiline
                    numberOfLines={6}
                    placeholder="Example: 'A player asked my daughter for her WhatsApp number and home address, claiming to be a famous YouTuber offering free in-game items.'"
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    maxLength={2000}
                />
                <Text style={styles.charCount}>
                    {description.length} / 2000 characters
                </Text>
                <Text style={styles.helpText}>
                    💡 Be specific: Include what was said, who said it, and when it happened.
                </Text>
            </View>

            {/* Section 4: Screenshot Upload */}
            <View style={styles.formSection}>
                <View style={styles.labelContainer}>
                    <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>4</Text>
                    </View>
                    <Text style={styles.formLabel}>Upload Screenshot (Optional)</Text>
                </View>

                <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadText}>Tap to upload screenshot</Text>
                    <Text style={styles.uploadSubtext}>JPG, PNG • Max 5MB</Text>
                </TouchableOpacity>

                {/* Show preview of picked image */}
                {selectedImage && (
                    <Image
                        source={{ uri: selectedImage.uri }}
                        style={{ width: 100, height: 100, marginTop: 10, borderRadius: 8 }}
                    />
                )}

                <Text style={styles.helpText}>
                    📸 Screenshots help verify reports and improve AI accuracy
                </Text>
            </View>

            {/* Section 5: Date */}
            <View style={styles.formSection}>
                <View style={styles.labelContainer}>
                    <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>5</Text>
                    </View>
                    <Text style={styles.formLabel}>When Did This Happen?</Text>
                </View>

                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateInput}>
                    <Text style={styles.dateInputText}>
                        {selectedDate.toISOString().split('T')[0]}  {/* YYYY-MM-DD */}
                    </Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={selectedDate} // use current selectedDate
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
            </View>

            {/* Section 6: Risk Categories */}
            <View style={styles.formSection}>
                <View style={styles.labelContainer}>
                    <View style={styles.sectionNumber}>
                        <Text style={styles.sectionNumberText}>6</Text>
                    </View>
                    <Text style={styles.formLabel}>Risk Categories (Optional)</Text>
                </View>

                <Text style={styles.helpText}>
                    🤖 Our AI will auto-detect categories, but you can pre-select if you're sure:
                </Text>

                <View style={styles.categoryChips}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                selectedCategories.includes(category) && styles.categoryChipSelected
                            ]}
                            onPress={() => toggleCategory(category)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategories.includes(category) && styles.categoryChipTextSelected
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Confirmation Checkbox */}
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                    {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                    I confirm this report is truthful and accurate. False reports may result in restricted access to GameGuard.
                </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.btnCancel}>
                    <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.btnSubmit,
                        (!selectedGame || !description || !agreedToTerms) && styles.btnDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!selectedGame || !description || !agreedToTerms}
                >
                    <Text style={styles.btnSubmitText}>Submit Report</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 24,

    },

    backBtnText: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 85
    },
    infoBanner: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        marginBottom: 24,
    },
    infoBannerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    infoBannerText: {
        fontSize: 13,
        color: '#FFFFFF',
        opacity: 0.95,
        lineHeight: 18,
    },
    formSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    sectionNumberText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    required: {
        color: '#EF4444',
    },
    gameGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    gameChip: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    gameChipActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    gameChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    gameChipTextActive: {
        color: '#3B82F6',
    },
    platformPills: {
        flexDirection: 'row',
        flexWrap: 'wrap', // <-- ADD THIS
        gap: 8, // <-- Use a smaller gap
        justifyContent: 'center', // <-- Optional: centers the pills
    },
    pill: {
        paddingVertical: 10, // <-- Make slightly smaller
        paddingHorizontal: 14, // <-- Make slightly smaller
        borderRadius: 20, // <-- Make it more rounded
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    pillActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    pillTextActive: {
        color: '#3B82F6',
    },
    textarea: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#111827',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
        textAlign: 'right',
    },
    helpText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 6,
        lineHeight: 16,
    },
    uploadArea: {
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        marginTop: 8,
    },
    uploadIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#6B7280',
    },
    dateInput: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
        marginTop: 8,
    },
    dateInputText: {
        fontSize: 16,
        color: '#111827',
    },
    categoryChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    categoryChipSelected: {
        borderColor: '#EF4444',
        backgroundColor: '#FEE2E2',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    categoryChipTextSelected: {
        color: '#EF4444',
    },
    checkboxContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 24,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#9CA3AF',
        backgroundColor: '#FFFFFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
        lineHeight: 18,
    },
    checkboxLabelBold: {
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
    },
    btnCancel: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    btnCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    btnSubmit: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnSubmitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // NEW STYLES FOR AUTOCOMPLETE
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    clearIcon: {
        fontSize: 18,
        color: '#9CA3AF',
        padding: 4,
    },
    suggestionsContainer: {
        marginTop: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    suggestionsHeader: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        padding: 12,
        paddingBottom: 8,
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    suggestionText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    noResults: {
        padding: 20,
        alignItems: 'center',
    },
    noResultsText: {
        fontSize: 14,
        color: '#6B7280',
    },
    customGameOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#EFF6FF',
        borderTopWidth: 2,
        borderTopColor: '#3B82F6',
    },
    customGameIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    customGameTextContainer: {
        flex: 1,
    },
    customGameText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
        marginBottom: 2,
    },
    customGameSubtext: {
        fontSize: 11,
        color: '#6B7280',
    },
    selectedGameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        padding: 14,
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#10B981',
    },
    selectedGameBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedGameIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    selectedGameText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
    },
    customBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    customBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#D97706',
    },
    changeGameText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3B82F6',
    },
    orDivider: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        textAlign: 'center',
        marginVertical: 16,
        letterSpacing: 1,
    },
    popularGamesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    popularGameChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    popularGameText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
})
