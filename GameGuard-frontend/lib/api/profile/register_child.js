import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_API_URL } from '../../../config_base_url';

export const registerChildSimple = async ({ parentId, childName, age }) => {
    try {
        const token = await AsyncStorage.getItem('token');

        const response = await fetch(`${BACKEND_API_URL}/children/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                parentId,
                childName,
                age,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to register child');
        }

        return data;
    } catch (error) {
        console.error('Error registering child:', error);
        throw error;
    }
};
