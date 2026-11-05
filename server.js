const express = require('express');
const { execFile, spawn } = require('child_process');
const net = require('net');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

function sendCommand(command) {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection('/tmp/mpvsocket');

        socket.on('connect', () => {
            socket.write(JSON.stringify({ command}) + '\n');
        });

        socket.on('data', (data) => {
            resolve(data.toString());
            socket.end();
        });
        
        socket.on('error', (err) => {
            reject(err);
        });
    })
}


// ========================
// YouTube Functionality
// ========================

app.get('/search', (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    execFile('yt-dlp', [`ytsearch10:${query}`, '--flat-playlist', '-J'], { timeout: 20000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing yt-dlp: ${error}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const data = JSON.parse(stdout);
            console.log(data);
            const result = data.entries.map(entry => ({
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

let player = null;


app.post('/play', (req, res) => {
    const { id } = req.body ?? {};


    if (!id) {
        return res.status(400).json({ error: 'Video ID is required' });
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }

    const url = `https://www.youtube.com/watch?v=${id}`;

    if (player) {
        player.kill();
    }

    const current = spawn('mpv', [
        '--input-ipc-server=/tmp/mpvsocket',
        '--ytdl-format=bestvideo[height<=?1080][vcodec^=avc1]+bestaudio[ext=m4a]',
        '--force-window=immediate',
        '--fullscreen',
        '--',
        url
    ], {stdio: 'inherit'});

    player = current;

    current.on('error', (err) => {
        console.error(`Failed to start mpv: ${err}`);
        if (player === current) {
            player = null;
        }
    });

    current.on('exit', (code, signal) => {
        console.log(`mpv exited with code ${code} and signal ${signal}`);
        if (player === current) {
            player = null;
        }
    });

    res.json({ message: `Playing video with ID: ${id}` });
});


app.post('/pause', (req, res) => {

})


app.post('/resume', (req, res) => {

})


app.post('/stop', (req, res) => {

})


app.get('/status', (req, res) => {})


// ========================
// M3U Functionality
// ========================
app.get('/channels', (req, res) => {})
app.post('/play-channel', (req, res) => {})

app.get('/movies', (req, res) => {})
app.post('/play-movie', (req, res) => {})

app.get('/series', (req, res) => {})
app.post('/play-series', (req, res) => {})




app.listen(port, '127.0.0.1', () => {
  console.log(`Server is running on port ${port}`);
});