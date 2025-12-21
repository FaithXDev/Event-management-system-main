/**
 * Helper to get the full API URL.
 * In development, with Vite proxy: defaults to relative '/api/...'.
 * In production, requires VITE_API_BASE_URL to be set to the backend URL (e.g., https://ems-backend.onrender.com).
 * 
 * If VITE_API_BASE_URL is set, it prepends it. 
 * If VITE_API_BASE_URL is not set, it returns the path as is (relative), which works for local development via proxy.
 */
export const getApiUrl = (endpoint) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    // Ensure endpoint starts with / for consistency
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (!baseUrl) {
        return cleanEndpoint;
    }

    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // If endpoint starts with /api and baseUrl already ends with /api, avoid duplication?
    // Usually VITE_API_BASE_URL = "https://backend.com" (root)
    // And endpoint = "/api/auth/signup"
    // Result: "https://backend.com/api/auth/signup"

    return `${cleanBaseUrl}${cleanEndpoint}`;
};
