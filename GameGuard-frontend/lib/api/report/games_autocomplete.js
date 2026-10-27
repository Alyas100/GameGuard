import { BACKEND_API_URL } from "../../../config_base_url";


export async function fetchGames(search = "") {
    try {
        const url = `${BACKEND_API_URL}/games?search=${encodeURIComponent(search)}`;
        console.log("🌍 Fetching from:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch games");

        const data = await res.json();
        console.log("✅ Loaded games:", data);
        return data;
    } catch (err) {
        console.error("❌ API fetchGames error:", err.message, err);
        throw err;
    }
}
