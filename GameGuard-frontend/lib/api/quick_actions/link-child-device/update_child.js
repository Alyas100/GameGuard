import { BACKEND_API_URL } from "../../../../config_base_url";

const normalizeValidId = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Update child information
 * @param {string} childId - The child's unique ID
 * @param {object} updates - Object containing fields to update
 * @param {string} [updates.childName] - Updated name
 * @param {number} [updates.age] - Updated age
 * @returns {Promise<object>} - Returns updated child data
 */
export async function updateChild(childId, updates) {
    try {
        const normalizedId = normalizeValidId(childId);
        if (!normalizedId) {
            throw new Error('Invalid child ID');
        }

        const res = await fetch(`${BACKEND_API_URL}/children/${normalizedId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to update child');
        }

        console.log("✅ API updateChild success:", data);
        return data;

    } catch (err) {
        console.error("❌ API updateChild error:", err);
        throw err;
    }
}

/**
 * Delete/unlink a child
 * @param {string} childId - The child's unique ID
 * @returns {Promise<object>} - Returns success message
 */
export async function deleteChild(childId) {
    try {
        const normalizedId = normalizeValidId(childId);
        if (!normalizedId) {
            throw new Error('Invalid child ID');
        }

        const res = await fetch(`${BACKEND_API_URL}/children/${normalizedId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to delete child');
        }

        console.log("✅ API deleteChild success:", data);
        return data;

    } catch (err) {
        console.error("❌ API deleteChild error:", err);
        throw err;
    }
}

/**
 * Regenerate linking code for a child
 * @param {string} childId - The child's unique ID
 * @returns {Promise<object>} - Returns new deviceId
 */
export async function regenerateCode(childId) {
    try {
        const normalizedId = normalizeValidId(childId);
        if (!normalizedId) {
            throw new Error('Invalid child ID');
        }

        const res = await fetch(`${BACKEND_API_URL}/children/${normalizedId}/regenerate-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to regenerate code');
        }

        console.log("✅ API regenerateCode success:", data);
        return data;

    } catch (err) {
        console.error("❌ API regenerateCode error:", err);
        throw err;
    }
}
