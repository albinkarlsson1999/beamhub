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

export async function playSvt(url) {
    const response = await fetch(
        'http://localhost:3000/play-svt',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        }
    );
    
    return response.json();
}