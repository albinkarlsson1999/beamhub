export async function playYoutube(id) {
    const response = await fetch(
        'http://localhost:3000/play-youtube',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        }
    );

    return response.json();
}