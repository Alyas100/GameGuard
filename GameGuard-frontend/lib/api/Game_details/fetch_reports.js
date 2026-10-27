import { BACKEND_API_URL } from "../../../config_base_url";

/**
 * Fetches all details for a single game, including all its reports.
 * @param {string} name - The name of the game to fetch.
 */
export async function getGameDetailsByName(name) {
    try {

        // This creates a URL like: .../api/games/details?name=Roblox
        const url = `${BACKEND_API_URL}/details?name=${encodeURIComponent(name)}`;
        console.log("🌍 Fetching game details from:", url);

        // Uses a GET request by default, just like fetchGames
        const res = await fetch(url);

        // --- FIX 1: If status is NOT OK, read the body for error message ---
        if (!res.ok) {
            const errorText = await res.text();
            console.error('getGameDetailsByName response status:', res.status);
            console.error('getGameDetailsByName error text:', errorText);
            throw new Error(`Failed to fetch game details: ${res.status} - ${errorText.substring(0, 50)}...`);
        }


        const data = await res.json();

        // --- START CORRECTION ---
        const gameName = (data && data.game) ? data.game.name : 'Unknown';
        console.log("✅ Loaded game details for:", gameName);

        // Return the full data object, which contains the nested 'game' object
        return data;
        // --- END CORRECTION ---



    } catch (err) {
        console.error("❌ API getGameDetailsByName error:", err.message, err);
        throw err;
    }
}

// 2. NEW FUNCTION: Fetch Safer Alternatives
export async function getSaferAlternatives(gameId) {
    if (!gameId) return [];

    try {



        const response = await fetch(`${BACKEND_API_URL}/alternatives?gameId=${gameId}`);

        console.log('DEBUG:', response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch alternatives: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.alternatives || [];

    } catch (error) {
        console.error("Error in getSaferAlternatives:", error);
        return [];
    }
}

