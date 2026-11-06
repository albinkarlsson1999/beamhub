import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Search } from 'lucide-react';
import { searchSvt } from '../api/svt';
import { playSvt } from '../api/player';
import './SVT.css';

export default function SVT() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                navigate('/');
            }
        }

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [navigate]);

    async function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const videos = await searchSvt(query);
            console.log(videos);
            setResults(videos);
            setSearched(true);
        } catch (err) {
            console.error('Error searching SVT:', err);
            setError('Could not search SVT. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="svt-page">
            <h1 className="svt-page__title">SVT Play</h1>

            <form className="svt-search" onSubmit={handleSearch}>
                <input
                    className="svt-search__input"
                    type="search"
                    placeholder="Search SVT…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="svt-search__button" type="submit" disabled={loading}>
                    <Search aria-hidden="true" />
                    Search
                </button>
            </form>

            {loading && <p className="svt-status">Searching…</p>}
            {error && <p className="svt-status svt-status--error">{error}</p>}
            {!loading && !error && searched && results.length === 0 && (
                <p className="svt-status">No results for “{query}”.</p>
            )}

            <ul className="svt-results">
                {results.map((video) => (
                    <li key={video.id}>
                        <button className="svt-result" onClick={() => playSvt(video.url)}>
                            <img
                                className="svt-result__thumbnail"
                                src={video.thumbnail}
                                alt={video.title}
                            />
                            <span className="svt-result__info">
                                <span className="svt-result__title">{video.title || video.subtitle}</span>
                                {video.title && video.subtitle && (
                                    <span className="svt-result__subtitle">{video.subtitle}</span>
                                )}
                                <span className="svt-result__meta">
                                    <span className="svt-badge">{video.type}</span>
                                    {video.swedenOnly && (
                                        <span className="svt-badge svt-badge--warn">Sweden only</span>
                                    )}
                                </span>
                            </span>
                            <Play className="svt-result__play" aria-hidden="true" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}