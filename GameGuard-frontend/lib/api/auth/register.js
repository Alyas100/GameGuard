// lib/api/auth/register.js
import { BACKEND_API_URL } from "../../../config_base_url"; // Adjust path if needed

export async function registerUser(name, email, password) {
    try {
        // 1. Send the request to your backend
        const res = await fetch(`${BACKEND_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        // 2. Get the response from the server
        const data = await res.json();

        // 3. If the server sent an error (like "Email already in use"), throw it
        if (!res.ok) {
            throw new Error(data.error || 'Failed to register');
        }

        // 4. If successful, return the data
        return data;

    } catch (err) {
        console.error("❌ API registerUser error:", err);
        throw err; // Throw the error so the page can catch it
    }
}