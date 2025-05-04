import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Play from '../src/pages/Play';
import Repertoire from '../src/pages/Repertoire';
import Index from '../src/pages/Index';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/play" element={<Play />} />
        <Route path="/repertoire" element={<Repertoire />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  );
}

export default App;

