import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_API_URL } from '../../../config_base_url';

export const logScreenTime = async ({ childId, gameId, durationMinutes, logDate }) => {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await fetch(`${BACKEND_API_URL}/screen-time/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                childId,
                gameId,
                durationMinutes,
                logDate,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to log screen time');
        }

        return data;
    } catch (error) {
        console.error('Error logging screen time:', error);
        throw error;
    }
};

export const getScreenTimeLogsByChild = async (childId) => {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await fetch(`${BACKEND_API_URL}/screen-time/child/${childId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const rawText = await response.text();
        let data;
        try {
            data = rawText ? JSON.parse(rawText) : [];
        } catch {
            throw new Error('Server returned an invalid response for screen time logs');
        }

        if (!response.ok) {
            throw new Error(data?.error || 'Failed to fetch screen time logs');
        }

        return data.logs || data;
    } catch (error) {
        console.error('Error fetching screen time logs:', error);
        throw error;
    }
};
