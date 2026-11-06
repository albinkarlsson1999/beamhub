const API_URL = 'localhost:3000'

export async function searchYouTube(query) {
    const response = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw new Error('Failed to search YouTube');
    }

    return response.json();
}