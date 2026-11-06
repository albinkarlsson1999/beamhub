const API_URL = 'http://localhost:3000';

export async function searchSvt(query) {
    const response = await fetch(
        `${API_URL}/search-svt?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
        throw new Error('SVT search failed');
    }

    return response.json();
}


export async function getSeries(path) {
    const response = await fetch(
        `http://localhost:3000/svt/series?path=/${path}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch series');
    }

    return response.json();
}