import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play } from 'lucide-react';

import { getSeries } from '../api/svt';
import { playSvt } from '../api/player';

import './SVT.css';

export default function SVTSeries() {
    const { path } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        function handleKeydown(e) {
            if (e.key === 'Escape') {
                navigate('/svt');
            }
        }

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, [navigate]);

    useEffect(() => {
        async function loadSeries() {
            try {
                setLoading(true);

                const data = await getSeries(path);

                setTitle(data.title);
                setSeries(data.seasons);
            } catch (err) {
                console.error(err);
                setError('Could not load series.');
            } finally {
                setLoading(false);
            }
        }

        loadSeries();
    }, [path]);

    if (loading) {
        return (
            <div className="svt-page">
                <p className="svt-status">Loading…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="svt-page">
                <p className="svt-status svt-status--error">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="svt-page">
            <h1 className="svt-page__title">
                {title}
            </h1>

            {series.map((season) => (
                <div
                    key={season.name}
                    style={{ marginBottom: '3rem' }}
                >
                    <h2>{season.name}</h2>

                    <ul className="svt-results">
                        {season.episodes.map(
                            (episode) => (
                                <li key={episode.url}>
                                    <button
                                        className="svt-result"
                                        onClick={() =>
                                            playSvt(
                                                episode.url
                                            )
                                        }
                                    >
                                        <img
                                            className="svt-result__thumbnail"
                                            src={
                                                episode.thumbnail
                                            }
                                            alt={
                                                episode.title
                                            }
                                        />

                                        <span className="svt-result__info">
                                            <span className="svt-series__title">
                                                {
                                                    episode.title
                                                }
                                            </span>

                                            <span className="svt-result__subtitle">
                                                {
                                                    episode.subtitle
                                                }
                                            </span>
                                        </span>

                                        <Play
                                            className="svt-result__play"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            ))}
        </div>
    );
}