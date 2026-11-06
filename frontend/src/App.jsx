import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import YouTube from './pages/YouTube';
import SVT from './pages/SVT';
 
function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/youtube" element={<YouTube />} />
            <Route path="/svt" element={<SVT />} />
        </Routes>
    );
}
 
export default App;