import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { getChildById } from '../../../lib/api/quick_actions/link-child-device/get_children';
import { deleteChild, updateChild } from '../../../lib/api/quick_actions/link-child-device/update_child';

export default function EditChildProfilePage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const childId = Array.isArray(id) ? id[0] : id;

    const [childName, setChildName] = useState('');
    const [age, setAge] = useState('');
    const [dailyScreenTimeLimitMinutes, setDailyScreenTimeLimitMinutes] = useState('120');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadChild = async () => {
            if (!childId) {
                Alert.alert('Error', 'Invalid child profile link.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
                setLoading(false);
                return;
            }

            try {
                const data = await getChildById(childId);
                const child = data.child || data;

                if (!child) {
                    Alert.alert('Error', 'Child profile not found.', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                    return;
                }

                setChildName(child.childName || '');
                setAge(String(child.age ?? ''));
                setDailyScreenTimeLimitMinutes(String(child.dailyScreenTimeLimitMinutes ?? 120));
            } catch (error) {
                Alert.alert('Error', 'Child profile not found.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } finally {
                setLoading(false);
            }
        };

        loadChild();
    }, [childId, router]);

    const handleSaveChanges = async () => {
        if (!childName.trim() || !age.trim() || !dailyScreenTimeLimitMinutes.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 18) {
            Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 18.');
            return;
        }

        const limitNum = parseInt(dailyScreenTimeLimitMinutes, 10);
        if (isNaN(limitNum) || limitNum < 30 || limitNum > 480) {
            Alert.alert('Invalid Limit', 'Please enter a screen time limit between 30 and 480 minutes (8 hours).');
            return;
        }

        try {
            setSaving(true);
            await updateChild(childId, { childName: childName.trim(), age: ageNum, dailyScreenTimeLimitMinutes: limitNum });
            Alert.alert('Success', `${childName}'s profile has been updated.`);
            router.back();
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Profile',
            `Are you sure you want to permanently delete ${childName}'s profile? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteChild(childId);
                            Alert.alert('Deleted', `${childName}'s profile has been removed.`);
                            router.back();
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to delete child profile.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading child profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.icon}>👶</Text>
            <Text style={styles.title}>Edit Child Profile</Text>

            <Text style={styles.label}>Child's Name</Text>
            <TextInput
                style={styles.input}
                value={childName}
                onChangeText={setChildName}
                placeholder="e.g., Jamie"
                editable={!saving}
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="e.g., 10"
                keyboardType="number-pad"
                editable={!saving}
            />

            <Text style={styles.label}>Daily Screen Time Limit (minutes)</Text>
            <TextInput
                style={styles.input}
                value={dailyScreenTimeLimitMinutes}
                onChangeText={setDailyScreenTimeLimitMinutes}
                placeholder="e.g., 120"
                keyboardType="number-pad"
                editable={!saving}
            />
            <Text style={styles.helperText}>30 to 480 minutes (e.g., 120 = 2 hours)</Text>

            <View style={styles.buttonSpacer} />

            <Pressable style={[styles.button, styles.buttonPrimary]} onPress={handleSaveChanges} disabled={saving}>
                <Text style={styles.buttonTextPrimary}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => router.back()} disabled={saving}>
                <Text style={styles.buttonTextSecondary}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
                <Text style={styles.deleteButtonText}>Delete Profile</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    contentContainer: {
        padding: 24,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
        color: '#6B7280',
    },
    icon: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    buttonSpacer: {
        height: 20,
    },
    button: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonPrimary: {
        backgroundColor: '#007AFF',
    },
    buttonTextPrimary: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
    },
    buttonTextSecondary: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '500',
    },
    deleteButton: {
        marginTop: 24,
        padding: 10,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#FF3B30',
        fontSize: 15,
        fontWeight: '500',
    },
});