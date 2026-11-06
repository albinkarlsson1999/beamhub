const express = require('express');
const { execFile, spawn } = require('child_process');
const net = require('net');
const cors = require('cors');
const https = require('https');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

let player = null;

const config = {
    proxy: {
        enabled: false,
        url: null
        // Example:
        // url: 'http://proxy.example.com:8080'
        // Note: If you enable the proxy, make sure to set the correct URL.
    }
}

function validateProxy(proxyUrl) {
    try {
        const url = new URL(proxyUrl);

        const validProtocols = [
            'http:',
            'https:',
            'socks4:',
            'socks5:'
        ];

        return validProtocols.includes(url.protocol);

    } catch (error) {
        return false;
    }
}

function sendCommand(command) {
    return new Promise((resolve, reject) => {
        const socket = net.createConnection('/tmp/mpvsocket');

        socket.setTimeout(2000);

        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Socket connection timed out'));
        });

        socket.on('connect', () => {
            socket.write(JSON.stringify({ command }) + '\n');
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

function startPlayer(source, options = []) {
    if (player) {
        player.kill();
    }

    const args = [
        '--input-ipc-server=/tmp/mpvsocket',
        '--force-window=immediate',
        '--fullscreen'
    ];

    // Proxy support
    if (config.proxy.enabled && config.proxy.url && validateProxy(config.proxy.url)) {
        args.push(`--http-proxy=${config.proxy.url}`);
    }

    // Specific arguments for media type
    args.push(...options);

    // Source must always be last
    args.push('--');
    args.push(source);

    const current = spawn('mpv', args, {
        stdio: 'inherit'
    });

    player = current;

    current.on('error', (err) => {
        console.error(`Failed to start mpv: ${err}`);

        if (player === current) {
            player = null;
        }
    });

    current.on('exit', (code, signal) => {
        console.log(
            `mpv exited with code ${code} and signal ${signal}`
        );

        if (player === current) {
            player = null;
        }
    });

    return current;
}

function stripHtml(text) {
    return text?.replace(/<[^>]*>/g, '') ?? '';
}

// ========================
// YouTube Functionality
// ========================

app.get('/search', (req, res) => {
    const query = req.query.q;

    const ytDlpArgs = [
        `ytsearch25:${query}`,
        '--flat-playlist',
        '-J'
    ];

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    if (config.proxy.enabled && config.proxy.url && validateProxy(config.proxy.url)) {
        ytDlpArgs.push('--proxy', config.proxy.url);
    }



    execFile('yt-dlp', ytDlpArgs, { timeout: 20000 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing yt-dlp: ${error}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const data = JSON.parse(stdout);
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


app.post('/play-youtube', (req, res) => {
    const { id } = req.body ?? {};

    if (!id) {
        return res.status(400).json({
            error: 'Video ID is required'
        });
    }

    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return res.status(400).json({
            error: 'Invalid video ID'
        });
    }

    startPlayer(
        `https://www.youtube.com/watch?v=${id}`,
        [
            '--ytdl-format=bestvideo[height<=?1080][vcodec^=avc1]+bestaudio[ext=m4a]'
        ]
    );

    res.json({
        success: true
    });
});


// ========================
// SVT Play Functionality
// ========================

app.get('/svt/series', async (req, res) => {
    const path = req.query.path;

    if (!path) {
        return res.status(400).json({
            error: 'Query parameter "path" is required'
        });
    }

    const variables = encodeURIComponent(
        JSON.stringify({
            abTestVariants: [],
            history: [],
            kidsFilter: false,
            onlyKidsContent: false,
            path
        })
    );

    const extensions = encodeURIComponent(
        JSON.stringify({
            persistedQuery: {
                sha256Hash:
                    'a375716d2597a79cf0f18785ea4d7ed14c17ae3e16a916d1e0bd4fe936cf1886',
                version: 1
            }
        })
    );

    const url =
        `https://contento.svt.se/graphql` +
        `?operationName=DetailsPageQuery` +
        `&variables=${variables}` +
        `&extensions=${extensions}` +
        `&ua=svtplaywebb-render-prod-client`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Origin': 'https://www.svtplay.se',
                'Referer': 'https://www.svtplay.se/'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `SVT returned status ${response.status}`
            });
        }

        const data = await response.json();

        const modules =
            data?.data?.detailsPageByPath?.modules ?? [];

        const seasons = modules
            .filter(module => module.defaultSelection?.itemsAdult)
            .map(module => ({
                name: module.defaultSelection.name,

                episodes:
                    module.defaultSelection.itemsAdult.map(
                        episode => ({
                            title: episode.heading,
                            subtitle: episode.subHeading,

                            url:
                                'https://www.svtplay.se' +
                                episode.item.urls.svtplay,

                            videoId:
                                episode.item.videoSvtId,

                            thumbnail:
                                `https://www.svtstatic.se/image/custom/430/` +
                                `${episode.images?.wide?.id}/` +
                                `${episode.images?.wide?.changed}` +
                                '?format=auto&chromaSubSampling=false&enableAvif=true&quality=50'
                        })
                    )
            }));

        res.json({
            title:
                data?.data?.detailsPageByPath?.item?.name,

            seasons
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to fetch series'
        });
    }
});

app.get('/search-svt', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: 'Query parameter "q" is required'
        });
    }

    const variables = encodeURIComponent(
        JSON.stringify({
            abTestVariants: [],
            kidsFilter: false,
            onlyKidsContent: false,
            query,
            searchClickHistory: []
        })
    );

    const extensions = encodeURIComponent(
        JSON.stringify({
            persistedQuery: {
                sha256Hash:
                    '665488250690ac83cac858021011cee4d5b22cff046e74d7ab65b72384dfe09e',
                version: 1
            }
        })
    );

    const url =
        `https://contento-search.svt.se/graphql` +
        `?operationName=SearchPage` +
        `&variables=${variables}` +
        `&extensions=${extensions}` +
        `&ua=svtplaywebb-render-prod-client`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Origin': 'https://www.svtplay.se',
                'Referer': 'https://www.svtplay.se/'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: `SVT returned status ${response.status}`
            });
        }

        const data = await response.json();

        const hits =
            data?.data?.searchPage?.flat?.hits ?? [];

        const results = hits
            .filter(hit => hit.teaser)
            .map(hit => {
                const teaser = hit.teaser;

                return {
                    id: teaser.item.svtId,

                    title: stripHtml(teaser.item.title),

                    subtitle: stripHtml(teaser.subHeading),

                    type: teaser.item.__typename,

                    url:
                        `https://www.svtplay.se` +
                        teaser.item.urls.svtplay,

                    videoId: teaser.item.videoSvtId,

                    thumbnail:
                        `https://www.svtstatic.se/image/custom/430/` +
                        `${teaser.images?.wide?.id}/` +
                        `${teaser.images?.wide?.changed}` +
                        '?format=auto&chromaSubSampling=false&enableAvif=true&quality=50',

                    swedenOnly:
                        teaser.item.restrictions
                            .onlyAvailableInSweden
                };
            });

        res.json(results);
    } catch (error) {
        console.error('SVT Search Error:', error);

        res.status(500).json({
            error: 'Failed to search SVT'
        });
    }
});

app.post('/play-svt', (req, res) => {
    const { url } = req.body ?? {};

    if (!url) {
        return res.status(400).json({
            error: 'SVT URL is required'
        });
    }

    startPlayer(url);

    res.json({
        success: true
    });
});

// ========================
// MPV Control Functionality
// ========================

app.post('/toggle-pause', async (req, res) => {
    try {
        await sendCommand([
            'cycle',
            'pause'
        ]);
        res.json({
            success: true,
            message: 'Playback toggled'
        });
    } catch (error) {
        console.error('Error toggling playback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to toggle playback'
        });
    }
})


app.post('/stop', async (req, res) => {
    try {
        await sendCommand([
            'quit'
        ]);

        player = null;

        res.json({
            success: true,
            message: 'Playback stopped'
        });
    } catch (error) {
        console.error('Error stopping playback:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop playback'
        });
    }
})


app.get('/status', async (req, res) => {
    if (!player) {
        return res.json({
            playing: false,
            paused: false
        });
    }

    try {
        const result = await sendCommand([
            'get_property',
            'pause'
        ]);

        const response = JSON.parse(result);

        res.json({
            playing: true,
            paused: response.data
        });
    } catch (error) {
        console.error('Error getting status:', error);

        res.json({
            playing: false,
            paused: false
        });
    }
});


app.get('/settings', async (req, res) => {
    res.json(config);
});

app.get('/version', (req, res) => {
    try {
        const commit = execSync(
            'git rev-parse --short HEAD',
        )
            .toString()
            .trim();

        const branch = execSync(
            'git rev-parse --abbrev-ref HEAD'
        )
            .toString()
            .trim();

        res.json({
            version: commit,
            branch
        });
    } catch (error) {
        console.error('Error getting version:', error);
        res.status(500).json({
            error: 'Failed to get version'
        });
    }
});

// ========================
// M3U Functionality
// ========================
app.get('/channels', (req, res) => {
    res.json([]);
})
app.post('/play-channel', (req, res) => {
    res.json({ error: 'Not implemented' })
})

app.get('/movies', (req, res) => {
    res.json([]);
})
app.post('/play-movie', (req, res) => {
    res.json({ error: 'Not implemented' })
})

app.get('/series', (req, res) => {
    res.json([]);
})
app.post('/play-series', (req, res) => {
    res.json({ error: 'Not implemented' })
})




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});