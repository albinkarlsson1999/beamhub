export default function Home() {
    return (
        <div>
            <h1>BeamHub</h1>

            <p>
                Developing open source software without a cookie banner.
            </p>

            <h2>Media Sources</h2>

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                <div
                    style={{
                        padding: '1rem',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        minWidth: '200px'
                    }}
                >
                    <h3>YouTube</h3>
                    <p>Search and play videos.</p>
                </div>

                <div
                    style={{
                        padding: '1rem',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        minWidth: '200px'
                    }}
                >
                    <h3>SVT Play</h3>
                    <p>Watch SVT content.</p>
                </div>

                <div
                    style={{
                        padding: '1rem',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        minWidth: '200px'
                    }}
                >
                    <h3>Movies</h3>
                    <p>Coming soon.</p>
                </div>

                <div
                    style={{
                        padding: '1rem',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        minWidth: '200px'
                    }}
                >
                    <h3>Series</h3>
                    <p>Coming soon.</p>
                </div>
            </div>
        </div>
    );
}