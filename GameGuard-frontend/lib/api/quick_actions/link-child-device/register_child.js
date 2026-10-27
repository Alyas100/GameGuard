import { BACKEND_API_URL } from "../../../../config_base_url";

/**
 * Register a new child and generate linking code
 * @param {object} data
 * @param {string} data.parentId - The parent's user ID
 * @param {string} data.childName - The child's name
 * @param {number} data.age - The child's age
 * @returns {Promise<object>} - Returns child data with generated deviceId
 */
export async function registerChild({ parentId, childName, age }) {
    try {
        const res = await fetch(`${BACKEND_API_URL}/children/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ parentId, childName, age }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to register child');
        }

        console.log("✅ API registerChild success:", data);
        return data;

    } catch (err) {
        console.error("❌ API registerChild error:", err);
        throw err;
    }
}
