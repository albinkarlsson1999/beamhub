import { useParams } from 'react-router-dom';

export default function SVTSeries() {
    const { id } = useParams();

    return (
        <div>
            <h1>SVT Series</h1>
            <p>Series ID: {id}</p>
        </div>
    );
}