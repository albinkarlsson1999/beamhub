import { useState } from 'react';
import { searchSvt } from '../api/svt';
import { playSvt } from '../api/player';

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
        fontSize: '1.7rem',
        padding: '0.5rem 1rem',
        marginRight: '2rem',
        cursor: 'pointer',
        color: 'lime'
    },
};

function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
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

export default function SVT() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleSearch() {
        if (!query.trim()) {
            return;
        }

        setLoading(true);
        try {
            const videos = await searchSvt(query);
            setResults(videos);
        } catch (error) {
            console.error('Error searching SVT:', error);
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
            <h1>SVT</h1>

            <input
                type="text"
                placeholder="Search SVT..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            <button onClick={handleSearch} disabled={loading}>
                Search
            </button>

            {loading && <p>Loading...</p>}

            {results.map((video) => (
                <div
                    key={video.id}
                    style={styles.row}
                >
                    <div style={styles.info}>
                        <h3 style={styles.text}>
                            {video.title}
                        </h3>

                        {video.subtitle && (
                            <p style={styles.text}>
                                {video.subtitle}
                            </p>
                        )}

                        <p style={styles.text}>
                            {video.type}
                        </p>

                        {video.swedenOnly && (
                            <p style={styles.text}>
                                🇸🇪 Sweden only
                            </p>
                        )}
                    </div>

                    <button
                        style={styles.playButton}
                        onClick={() => playSvt(video.url)}
                    >
                        ▶
                    </button>
                </div>
            ))}

        </div>
    );
}