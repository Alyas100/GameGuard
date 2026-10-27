import { BACKEND_API_URL } from '../../../config_base_url';

/**
 * Fetches trending alerts from the backend.
 * Returns an array of trending alerts with game info, category, change percentage, and severity.
 * 
 * @returns {Promise<Array>} Array of trending alert objects
 * @throws {Error} If the request fails
 */
export async function getTrendingAlerts() {
    try {
        console.log('📊 Fetching trending alerts...');

        const response = await fetch(`${BACKEND_API_URL}/trendingAlerts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch trending alerts: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Trending alerts fetched successfully:', data);

        return data;
    } catch (error) {
        console.error('❌ Error fetching trending alerts:', error);
        throw error;
    }
}
