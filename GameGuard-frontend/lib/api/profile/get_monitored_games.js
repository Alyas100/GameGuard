import { BACKEND_API_URL } from '../../../config_base_url';

/**
 * Fetches monitored games for a specific child
 * @param {number} childId - The ID of the child
 * @returns {Promise<Array>} Array of monitored game objects
 */
export async function getMonitoredGamesByChild(childId) {
    try {
        console.log(`🎮 Fetching monitored games for child ID: ${childId}...`);

        const response = await fetch(`${BACKEND_API_URL}/children/${childId}/monitored-games`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch monitored games: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Monitored games fetched successfully:', data);

        return data;
    } catch (error) {
        console.error('❌ Error fetching monitored games:', error);
        throw error;
    }
}

/**
 * Toggles game monitoring for a specific child
 * @param {number} childId - The ID of the child
 * @param {number} gameId - The ID of the game
 * @param {boolean} shouldMonitor - Whether to monitor (true) or unmonitor (false)
 * @returns {Promise<Object>} Updated monitoring status
 */
export async function toggleGameMonitoring(childId, gameId, shouldMonitor) {
    try {
        console.log(`🔄 ${shouldMonitor ? 'Adding' : 'Removing'} game ${gameId} for child ${childId}...`);

        const response = await fetch(`${BACKEND_API_URL}/children/${childId}/monitored-games`, {
            method: shouldMonitor ? 'POST' : 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gameId }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update monitoring: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Monitoring updated successfully');

        return data;
    } catch (error) {
        console.error('❌ Error updating monitoring:', error);
        throw error;
    }
}

/**
 * Fetches all available games from the database
 * @returns {Promise<Array>} Array of all game objects
 */
export async function getAllGames() {
    try {
        console.log('🎮 Fetching all games...');

        const response = await fetch(`${BACKEND_API_URL}/games`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch games: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ All games fetched successfully');

        return data;
    } catch (error) {
        console.error('❌ Error fetching games:', error);
        throw error;
    }
}
