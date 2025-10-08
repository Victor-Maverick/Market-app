const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const FALLBACK_URL = process.env.NEXT_PUBLIC_API_FALLBACK_URL;


export async function fetchWithFallback(endpoint, options = {}) {
    try {
        // Try primary URL first
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error('Primary API failed');
        return await response.json();
    } catch (error) {
        console.warn('Primary API failed, trying fallback...', error);

        // Try fallback URL if primary fails
        const fallbackResponse = await fetch(`${FALLBACK_URL}${endpoint}`, options);
        if (!fallbackResponse.ok) throw new Error('Fallback API also failed');
        return await fallbackResponse.json();
    }
}