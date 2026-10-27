import { BACKEND_API_URL } from "../../../../config_base_url";

/**
 * Link child's device using the parent-provided code
 * @param {object} data
 * @param {string} data.deviceId - The linking code from parent
 * @param {string} data.linkedDeviceType - Device OS type ('ios' or 'android')
 * @param {string} data.linkedDeviceModel - Device model name
 * @returns {Promise<object>} - Returns success status and child info
 */
export async function linkDevice({ deviceId, linkedDeviceType, linkedDeviceModel }) {
    try {
        const res = await fetch(`${BACKEND_API_URL}/link-device`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId,
                linkedDeviceType,
                linkedDeviceModel,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || data.message || 'Failed to link device');
        }

        console.log("✅ API linkDevice success:", data);
        return data;

    } catch (err) {
        console.error("❌ API linkDevice error:", err);
        throw err;
    }
}

/**
 * Unlink/disconnect a child's device
 * @param {string} childId - The child's unique ID
 * @returns {Promise<object>} - Returns success message
 */
export async function unlinkDevice(childId) {
    try {
        const res = await fetch(`${BACKEND_API_URL}/children/${childId}/unlink`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to unlink device');
        }

        console.log("✅ API unlinkDevice success:", data);
        return data;

    } catch (err) {
        console.error("❌ API unlinkDevice error:", err);
        throw err;
    }
}

/**
 * Verify if a linking code is valid (without actually linking)
 * @param {string} deviceId - The linking code to verify
 * @returns {Promise<object>} - Returns validity status
 */
export async function verifyCode(deviceId) {
    try {
        const res = await fetch(`${BACKEND_API_URL}/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Invalid code');
        }

        console.log("✅ API verifyCode success:", data);
        return data;

    } catch (err) {
        console.error("❌ API verifyCode error:", err);
        throw err;
    }
}
