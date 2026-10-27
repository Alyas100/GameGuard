import { BACKEND_API_URL } from "../../../config_base_url";

/**
 * Fetches games from the backend based on search, filters, and sort options.
 * @param {object} options - An object containing all filter states.
 * @param {string} options.searchQuery - The text from the search bar.
 * @param {object} options.filters - The object containing all filter modal data.
 * @param {string} options.sortBy - The current sort value (e.g., 'safety').
 */
export async function fetchBrowseGames({ searchQuery, filters, sortBy }) {
    try {
        // Use URLSearchParams to build a clean query string
        const params = new URLSearchParams();

        // Add all the values from your frontend state
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sortBy', sortBy);

        // Add all the filters from your 'filters' state object
        if (filters.ageRange) params.append('ageRange', filters.ageRange);
        //     if (filters.islamicOnly) params.append('islamicOnly', 'true');
        //     if (filters.minSafetyScore > 0) params.append('minSafetyScore', filters.minSafetyScore);

        // Loop through the arrays and add them
        // This allows for multiple values (e.g., platforms=PC&platforms=Mobile)
        filters.platforms.forEach(p => params.append('platforms', p));
        filters.genres.forEach(g => params.append('genres', g));

        // Send the full query to the backend
        const url = `${BACKEND_API_URL}/browse?${params.toString()}`;
        console.log("🌍 Fetching browse games:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch games");

        const data = await res.json();
        return data.games; // Return the filtered array of games
    } catch (err) {
        console.error("❌ API fetchBrowseGames error:", err);
        return []; // Return an empty array on error
    }
}