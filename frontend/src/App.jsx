import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import YouTube from './pages/YouTube';
import SVT from './pages/SVT';
import SVTSeries from './pages/SVTSeries';
 
function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/youtube" element={<YouTube />} />
            <Route path="/svt" element={<SVT />} />
            <Route path="/svt/series/:path" element={<SVTSeries />} />
            <Route path="/settings" element={<Home />} />
        </Routes>
    );
}
 
export default App;