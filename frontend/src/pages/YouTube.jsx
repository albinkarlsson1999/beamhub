import { useState } from 'react';
import { searchYouTube } from '../api/youtube';
import { playYoutube } from '../api/player';

const styles = {
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        textAlign: 'left',
    },
    thumbnail: {
        width: 160,
        flexShrink: 0,
    },
    info: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    text: {
        margin: 0,
    },
    playButton: {
        fontSize: '1rem',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
    },
};

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatViewCount(viewCount) {
    if (viewCount >= 1_000_000) {
        return `${(viewCount / 1_000_000).toFixed(1)}M`;
    }
    if (viewCount >= 1_000) {
        return `${(viewCount / 1_000).toFixed(1)}K`;
    }
    return viewCount.toString();
}

export default function YouTube() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleSearch() {
        if (!query.trim()) {
            return;
        }

        setLoading(true);
        try {
            const videos = await searchYouTube(query);
            setResults(videos);
        } catch (error) {
            console.error('Error searching YouTube:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }

    return (
        <div>
            <h1>YouTube</h1>

            <input
                type="text"
                placeholder="Search YouTube..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <button onClick={handleSearch} disabled={loading}>
                Search
            </button>

            {loading && <p>Loading...</p>}

            {results.map((video) => (
                <div key={video.id} style={styles.row}>
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={styles.thumbnail}
                    />

                    <div style={styles.info}>
                        <h3 style={styles.text}>{video.title}</h3>
                        <p style={styles.text}>
                            Duration {formatDuration(video.duration)}
                        </p>
                        <p style={styles.text}>
                            {formatViewCount(video.view_count)} views
                        </p>
                    </div>

                    <button
                        onClick={() => playYoutube(video.id)}
                        style={styles.playButton}
                    >
                        Play
                    </button>
                </div>
            ))}
        </div>
    );
}