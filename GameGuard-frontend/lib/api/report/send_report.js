import { BACKEND_API_URL } from "../../../config_base_url";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function submitReport({
    selectedGame,
    selectedGameId,
    selectedPlatforms,
    description,
    agreedToTerms,
    selectedImage,
    selectedCategories,
    selectedDate,
}) {
    const formData = new FormData();
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
        throw new Error("No logged-in user found. Please log in again.");
    }

    formData.append("userId", userId);

    // --- NEW LOGIC ---
    // If we have an ID (standard game), send it.
    // Otherwise send the name (custom game).
    if (selectedGameId) {
        formData.append("gameId", selectedGameId.toString());
    } else {
        formData.append("gameName", selectedGame);
    }

    if (selectedPlatforms && selectedPlatforms.length > 0) {
        formData.append("platform", JSON.stringify(selectedPlatforms));
    }
    formData.append("description", description);
    formData.append("agreedToTerms", agreedToTerms ? "true" : "false");

    if (selectedDate) {
        const dateStr = selectedDate instanceof Date
            ? selectedDate.toISOString().split('T')[0]
            : selectedDate;
        formData.append("selectedDate", dateStr);
    }

    if (selectedCategories && selectedCategories.length > 0) {
        // 1. Convert Array ["A", "B"] to Object {"A": null, "B": null}
        const categoriesObject = {};
        selectedCategories.forEach(category => {
            categoriesObject[category] = null; // 'null' means not yet scored by AI
        });

        // Sends: {"😢 Bullying": null, "💰 Scams": null}
        formData.append("categories", JSON.stringify(categoriesObject));
    }

    if (selectedImage) {
        formData.append("screenshot", {
            uri: selectedImage.uri,
            name: selectedImage.fileName || "screenshot.jpg",
            type: selectedImage.type || "image/jpeg",
        });
    }

    try {
        const res = await fetch(`${BACKEND_API_URL}/sendReport`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error(`Failed to submit report: ${res.status}`);
        const data = await res.json();
        console.log("✅ Report submitted successfully:", data);
        return data;
    } catch (err) {
        console.error("❌ submitReport error:", err);
        throw err;
    }
}
