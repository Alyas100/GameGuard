import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const faqItems = [
    {
        id: 'faq-1',
        question: "Why can't I see my submitted report?",
        answer:
            'Your report may still be processing or linked to a different account session. Check your network and make sure you are logged into the same account used to submit the report.',
    },
    {
        id: 'faq-2',
        question: 'How risk scoring works',
        answer:
            'Each report is analyzed by category signals. Scores are shown after processing is complete. If scoring is pending, the report can still appear without a percentage value.',
    },
    {
        id: 'faq-3',
        question: 'How to link child device',
        answer:
            'Open Quick Actions, choose Link Child Device, then follow the code pairing flow between parent and child apps. Keep both devices online during setup.',
    },
    {
        id: 'faq-4',
        question: 'How to change language / account details',
        answer:
            'Go to Settings, then Language for language updates. Account details can be managed in your profile-related settings pages.',
    },
];

export default function SupportScreen() {
    const [openFaqId, setOpenFaqId] = useState(null);

    const toggleFaq = (id) => {
        setOpenFaqId((current) => (current === id ? null : id));
    };

    const openEmailSupport = async () => {
        const emailUrl = 'mailto:support@gameguard.app?subject=GameGuard%20Support%20Request';
        const canOpen = await Linking.canOpenURL(emailUrl);
        if (!canOpen) {
            Alert.alert('Support', 'No email app is available on this device.');
            return;
        }
        await Linking.openURL(emailUrl);
    };

    const openExternalLink = async (url, label) => {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
            Alert.alert(label, 'Link is not available on this device.');
            return;
        }
        await Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.pageTitle}>Help & Trust Center</Text>
            <Text style={styles.pageSubtitle}>Get support, troubleshoot issues, and find quick answers.</Text>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Top Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={styles.actionCard} onPress={openEmailSupport}>
                        <Ionicons name="mail-outline" size={22} color="#2563EB" />
                        <Text style={styles.actionTitle}>Contact Support</Text>
                        <Text style={styles.actionSubtitle}>Send an email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => Alert.alert('Report Technical Issue', 'Demo action: issue form coming soon.')}
                    >
                        <Ionicons name="bug-outline" size={22} color="#2563EB" />
                        <Text style={styles.actionTitle}>Report Issue</Text>
                        <Text style={styles.actionSubtitle}>Technical problem</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => Alert.alert('Track Ticket', 'Demo action: ticket tracking coming soon.')}
                    >
                        <Ionicons name="ticket-outline" size={22} color="#2563EB" />
                        <Text style={styles.actionTitle}>Track Ticket</Text>
                        <Text style={styles.actionSubtitle}>Check status</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions (FAQ)</Text>
                {faqItems.map((item) => {
                    const isOpen = openFaqId === item.id;
                    return (
                        <View key={item.id} style={styles.faqItem}>
                            <TouchableOpacity style={styles.faqHeader} onPress={() => toggleFaq(item.id)}>
                                <Text style={styles.faqQuestion}>{item.question}</Text>
                                <Ionicons
                                    name={isOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                                    size={18}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                            {isOpen && <Text style={styles.faqAnswer}>{item.answer}</Text>}
                        </View>
                    );
                })}
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Feedback</Text>

                <TouchableOpacity
                    style={styles.supportRow}
                    onPress={() => Alert.alert('Suggest a Feature', 'Demo action: feature request form coming soon.')}
                >
                    <View style={styles.supportRowLeft}>
                        <Ionicons name="bulb-outline" size={18} color="#2563EB" />
                        <Text style={styles.supportRowText}>Suggest a Feature</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <Text style={styles.feedbackLabel}>Rate your experience</Text>
                <View style={styles.feedbackButtonsRow}>
                    <TouchableOpacity
                        style={styles.feedbackButton}
                        onPress={() => Alert.alert('Thanks', 'Glad to hear that. Thanks for your feedback!')}
                    >
                        <Ionicons name="thumbs-up-outline" size={18} color="#059669" />
                        <Text style={styles.feedbackButtonText}>Good</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.feedbackButton}
                        onPress={() => Alert.alert('Thanks', 'Thanks for the feedback. We will improve this experience.')}
                    >
                        <Ionicons name="thumbs-down-outline" size={18} color="#DC2626" />
                        <Text style={styles.feedbackButtonText}>Needs Work</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Legal & Privacy</Text>

                <TouchableOpacity
                    style={styles.supportRow}
                    onPress={() => openExternalLink('https://gameguard.app/privacy', 'Privacy Policy')}
                >
                    <View style={styles.supportRowLeft}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#2563EB" />
                        <Text style={styles.supportRowText}>Privacy Policy</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.supportRow}
                    onPress={() => openExternalLink('https://gameguard.app/terms', 'Terms of Use')}
                >
                    <View style={styles.supportRowLeft}>
                        <Ionicons name="document-text-outline" size={18} color="#2563EB" />
                        <Text style={styles.supportRowText}>Terms of Use</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.supportRow, styles.supportRowLast]}
                    onPress={() => Alert.alert('Data Deletion Request', 'Demo action: data deletion request flow coming soon.')}
                >
                    <View style={styles.supportRowLeft}>
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        <Text style={styles.supportRowText}>Data Deletion Request</Text>
                    </View>
                    <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 28,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 6,
        marginBottom: 16,
    },
    sectionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#F8FAFC',
    },
    actionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
        marginTop: 8,
    },
    actionSubtitle: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
    faqItem: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        marginTop: 12,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    faqAnswer: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 19,
        marginTop: 8,
    },
    supportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 12,
    },
    supportRowLast: {
        borderBottomWidth: 0,
    },
    supportRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    supportRowText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    feedbackLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 14,
        marginBottom: 10,
    },
    feedbackButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    feedbackButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 6,
        backgroundColor: '#F8FAFC',
    },
    feedbackButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
});
