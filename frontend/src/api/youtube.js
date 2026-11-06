const API_URL = 'http://localhost:3000'

export async function searchYouTube(query) {
    const response = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw new Error('Failed to search YouTube');
    }

    return response.json();
}