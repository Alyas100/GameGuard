import { BACKEND_API_URL } from "../../../config_base_url"; // Adjust path if needed

/**
 * Saves a user's country preference to the database.
 * @param {number} userId - The ID of the parent user.
 * @param {string} countryCode - The two-letter ISO code (e.g., 'MY', 'US').
 */
export async function saveUserCountry(userId, countryCode) {
    try {
        if (!userId || !countryCode) {
            throw new Error("User ID and country code are required.");
        }

        const res = await fetch(`${BACKEND_API_URL}/country`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, countryCode }),
        });

        const responseData = await res.json();

        if (!res.ok) {
            throw new Error(responseData.error || 'Failed to save country setting.');
        }

        console.log(`✅ User ${userId} country set to ${countryCode}`);
        return responseData;

    } catch (err) {
        console.error("❌ API saveUserCountry error:", err);
        throw err;
    }
}