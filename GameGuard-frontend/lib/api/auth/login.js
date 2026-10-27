// lib/api/auth/login.js
import { BACKEND_API_URL } from "../../../config_base_url"; // Adjust path if needed

export async function loginUser(email, password) {
    try {
        // 1. Send the request to your backend
        const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // 2. Get the response from the server
        const data = await res.json();

        // 3. If the server sent an error (like "Invalid credentials"), throw it
        if (!res.ok) {
            throw new Error(data.error || 'Failed to login');
        }

        // 4. If successful, return the user data
        return data;

    } catch (err) {
        console.error("❌ API loginUser error:", err);
        throw err; // Throw the error so the page can catch it
    }
}