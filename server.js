const express = require('express');
const { execFile } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    execFile('yt-dlp', [`ytsearch10:${query}`, '--flat-playlist', '-J'], (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing yt-dlp: ${error}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const data = JSON.parse(stdout);
            console.log(data);
            const result = data.entries = data.entries.map(entry => ({
                id: entry.id,
                title: entry.title,
                url: entry.url,
                thumbnail: entry.thumbnails?.at(0)?.url,
                duration: entry.duration,
                view_count: entry.view_count,
            }));
            res.json(result);
        } catch (parseError) {
            console.error(`Error parsing JSON: ${parseError}`);
            res.status(500).json({ error: 'Failed to parse yt-dlp output' });
        }
    })
});

app.post('/play', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    res.json({ url });
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});