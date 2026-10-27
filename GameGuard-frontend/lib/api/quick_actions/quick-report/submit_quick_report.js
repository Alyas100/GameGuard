import { BACKEND_API_URL } from "../../../../config_base_url";

/**
 * Submit quick urgent report
 * @param {object} data
 * @param {string} data.gameName - The game name
 * @param {number|null} data.gameId - The game ID if exists
 * @param {string} data.concernType - Type of concern
 * @param {string} data.description - Brief description
 * @param {string} data.userId - Parent's user ID
 * @returns {Promise<object>} - Returns success status
 */
export async function submitQuickReport({ gameName, gameId, concernType, description, userId }) {
    try {
        const formData = new FormData();

        if (!userId) {
            throw new Error("No logged-in user found. Please log in again.");
        }

        formData.append("userId", userId.toString());

        // Add game info
        if (gameId) {
            formData.append("gameId", gameId.toString());
        } else {
            formData.append("gameName", gameName);
        }

        // Add concern details
        formData.append("description", description || `Urgent concern: ${concernType}`);
        formData.append("agreedToTerms", "true");
        formData.append("selectedDate", new Date().toISOString().split('T')[0]);

        // Quick report doesn't need platform
        formData.append("platform", JSON.stringify([]));

        // Add category
        const categoriesObject = {};
        categoriesObject[concernType] = null;
        formData.append("categories", JSON.stringify(categoriesObject));

        const res = await fetch(`${BACKEND_API_URL}/sendReport`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to submit quick report');
        }

        console.log("✅ API submitQuickReport success:", data);
        return data;

    } catch (err) {
        console.error("❌ API submitQuickReport error:", err);
        throw err;
    }
}
