// lib/api/onboarding/saveProfile.js
import { BACKEND_API_URL } from "../../../config_base_url";

export async function saveOnboardingProfile(data) {
    try {
        // Data object includes: { userId, childName, ageRange, concerns, monitoredGames }
        console.log("🚀 Sending onboarding data to backend:", data);

        const res = await fetch(`${BACKEND_API_URL}/onboarding/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await res.json();

        if (!res.ok) {
            throw new Error(responseData.error || 'Failed to save profile');
        }

        console.log("✅ Profile saved successfully");
        return responseData;

    } catch (err) {
        console.error("❌ API saveOnboardingProfile error:", err);
        throw err;
    }
}