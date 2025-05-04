import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Play from '../src/pages/Play';
import Repertoire from '../src/pages/Repertoire';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/play" element={<Play />} />
        <Route path="/repertoire" element={<Repertoire />} />
      </Routes>
    </Router>
  );
}

export default App;

