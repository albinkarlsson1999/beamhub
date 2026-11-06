import { useState } from 'react';
import { searchYouTube } from '../api/youtube';
import { playYoutube } from '../api/player';

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
                {loading ? 'Searching...' : 'Search'}
            </button>

            <ul>
                {results.map((video) => (
                    <li key={video.id} style={{ marginBottom: '1rem' }}>
                        <div>
                            <strong>{video.title}</strong>
                        </div>
                        <div>Duration: {formatDuration(video.duration)}</div>
                        <div>Views: {formatViewCount(video.viewCount)}</div>
                        <button onClick={() => playYoutube(video.url)}>▶ Play</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}