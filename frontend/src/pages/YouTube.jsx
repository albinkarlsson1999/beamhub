import { useState } from 'react';
import { Play, Search } from 'lucide-react';

import { searchYouTube } from '../api/youtube';
import { playYoutube } from '../api/player';

import './YouTube.css';

function formatDuration(duration) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
        return `${hours}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    }

    return `${minutes}:${seconds
        .toString()
        .padStart(2, '0')}`;
}

function formatViewCount(viewCount) {
    if (!viewCount) {
        return '0';
    }

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
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    async function handleSearch(e) {
        e.preventDefault();

        if (!query.trim()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const videos = await searchYouTube(query);

            setResults(videos);
            setSearched(true);
        } catch (err) {
            console.error('Error searching YouTube:', err);
            setError('Could not search YouTube. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="youtube-page">
            <h1 className="youtube-page__title">
                YouTube
            </h1>

            <form
                className="youtube-search"
                onSubmit={handleSearch}
            >
                <input
                    className="youtube-search__input"
                    type="search"
                    placeholder="Search YouTube…"
                    value={query}
                    onChange={(e) =>
                        setQuery(e.target.value)
                    }
                />

                <button
                    className="youtube-search__button"
                    type="submit"
                    disabled={loading}
                >
                    <Search aria-hidden="true" />
                    Search
                </button>
            </form>

            {loading && (
                <p className="youtube-status">
                    Searching…
                </p>
            )}

            {error && (
                <p className="youtube-status youtube-status--error">
                    {error}
                </p>
            )}

            {!loading &&
                !error &&
                searched &&
                results.length === 0 && (
                    <p className="youtube-status">
                        No results for "{query}".
                    </p>
                )}

            <ul className="youtube-results">
                {results.map((video) => (
                    <li key={video.id}>
                        <button
                            className="youtube-result"
                            onClick={() =>
                                playYoutube(video.id)
                            }
                        >
                            <img
                                className="youtube-result__thumbnail"
                                src={video.thumbnail}
                                alt={video.title}
                            />

                            <span className="youtube-result__info">
                                <span className="youtube-result__title">
                                    {video.title}
                                </span>

                                <span className="youtube-result__meta">
                                    <span className="youtube-badge">
                                        {formatDuration(
                                            video.duration
                                        )}
                                    </span>

                                    <span className="youtube-badge">
                                        {formatViewCount(
                                            video.view_count
                                        )}{' '}
                                        views
                                    </span>
                                </span>
                            </span>

                            <Play
                                className="youtube-result__play"
                                aria-hidden="true"
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}