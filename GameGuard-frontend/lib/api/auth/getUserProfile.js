import { BACKEND_API_URL } from "../../../config_base_url";

/**
 * Fetches the user profile from the backend using their userId.
 * @param {number|string} userId - The currently logged-in user's ID.
 * @returns {Promise<object>} - Returns the user object: { id, name, email, country }.
 */
export async function getUserProfile(userId) {
    try {
        if (!userId) throw new Error("User ID is required to fetch profile");

        const url = `${BACKEND_API_URL}/user-profile/${userId}`;
        console.log("🌍 Fetching user profile:", url);



        const res = await fetch(url);
        // If server responds with an error code
        if (!res.ok) {
            const text = await res.text(); // Sometimes server returns HTML (like 404 page)
            console.error("❌ getUserProfile failed:", text);
            throw new Error(`Failed to fetch user profile: ${res.status}`);
        }

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Unknown API error");

        return data.user; // { id, name, email, country }
    } catch (err) {
        console.error("❌ API getUserProfile error:", err);
        return null; // Return null if there’s an error
    }
}
