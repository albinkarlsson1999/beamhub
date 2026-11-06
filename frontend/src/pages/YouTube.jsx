import { useState } from 'react';
import { searchYouTube } from '../api/youtube';

export default function YouTube() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    async function handleSearch() {
        if (!query.trim()) {
            return;
        }

        setLoading(true);
        try{
            const videos = await searchYouTube(query);
            setResults(videos);
        } catch (error) {
            console.error('Error searching YouTube:', error);
        } finally {
            setLoading(false);
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
            />

            <button onClick={handleSearch} disabled={loading}>
                Search
            </button>


            {loading && <p>Loading...</p>}

            {
                results.map((video) => (
                    <div key={video.id}
                    style={
                        {
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '1rem',
                        }
                    }
                    >
                        <img src={video.thumbnail} 
                        alt={video.title} 
                        width={160} />

                        <div>
                            <h3>{video.title}</h3>
                            <p>Duration {video.duration}s</p>
                            <p>{video.view_count} views</p>
                        </div>

                    </div>
                ))
            }
        </div>
    )
}

