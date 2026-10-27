import { BACKEND_API_URL } from "../../../../config_base_url";

const normalizeValidId = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Get all children registered under a parent
 * @param {string} parentId - The parent's user ID
 * @returns {Promise<array>} - Returns array of children with their linking status
 */
export async function getChildrenByParent(parentId) {
    try {
        const res = await fetch(`${BACKEND_API_URL}/children/parent/${parentId}/children`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch children');
        }

        console.log("✅ API getChildrenByParent success:", data);
        return data;

    } catch (err) {
        console.error("❌ API getChildrenByParent error:", err);
        throw err;
    }
}

/**
 * Get a single child by ID
 * @param {string} childId - The child's unique ID
 * @returns {Promise<object>} - Returns child data
 */
export async function getChildById(childId) {
    try {
        const normalizedId = normalizeValidId(childId);
        if (!normalizedId) {
            throw new Error('Invalid child ID');
        }

        const res = await fetch(`${BACKEND_API_URL}/children/${normalizedId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to fetch child');
        }

        console.log("✅ API getChildById success:", data);
        return data;

    } catch (err) {
        console.error("❌ API getChildById error:", err);
        throw err;
    }
}
