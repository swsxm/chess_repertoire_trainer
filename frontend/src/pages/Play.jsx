import React, { useState, useRef, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

export default function Repertoire() {
  const game = useRef(new Chess());
  
  const [repertoireLines, setRepertoireLines]       = useState([]);
  const [selectedLineIndex, setSelectedLineIndex]   = useState(0);
  const [activeLine, setActiveLine]                 = useState([]);


  const [history, setHistory]       = useState([game.current.fen()]);
  const [moveIndex, setMoveIndex]   = useState(0);
  const [visualIndex, setVisualIndex] = useState(0);
  const [repertoireName, setRepertoireName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);
  const [solved, setSolved]       = useState(false);  

  useEffect(() => {
    game.current.load(history[visualIndex]);
  }, [visualIndex, history]);

  function extractLines(tree) {
    const lines = [];
    function walk(node, prefix) {
      if (!node || typeof node !== 'object') return;
      const moves = Object.keys(node);
      if (moves.length === 0) {
        if (prefix.length) lines.push([...prefix]);
        return;
      }
      for (const mv of moves) {
        prefix.push(mv);
        walk(node[mv], prefix);
        prefix.pop();
      }
    }
    walk(tree, []);
    return lines;
  }

  const handleKeyDown = async e => {
    if (e.key !== 'Enter') return;
    const name = repertoireName.trim();
    if (!name) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/get_repertoire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const tree = data.repertoire || {};
      const lines = extractLines(tree);
      if (!lines.length) throw new Error("No lines found");

      game.current.reset();
      setHistory([game.current.fen()]);
      setMoveIndex(0);
      setVisualIndex(0);
      setSolved(false);

      setRepertoireLines(lines);
      setSelectedLineIndex(0);
      setActiveLine(lines[0]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantChange = e => {
    const idx = Number(e.target.value);
    const line = repertoireLines[idx];
    if (!line) return;

    game.current.reset();
    setHistory([game.current.fen()]);
    setMoveIndex(0);
    setVisualIndex(0);
    setSelectedLineIndex(idx);
    setActiveLine(line);
    setSolved(false);  
  };

  const onPieceDrop = (from, to) => {
    if (moveIndex % 2 !== 0) return false;

    const uci = from + to;
    const expected = activeLine[moveIndex];
    if (uci !== expected) {
      alert(`❌ Wrong move! Expected ${expected}, got ${uci}.`);
      return false;
    }

    game.current.move({ from, to, promotion: 'q' });
    let newHist = [...history.slice(0, visualIndex + 1), game.current.fen()];
    let idx = moveIndex + 1;

    if (idx < activeLine.length) {
      const mv = activeLine[idx];
      const rf = mv.slice(0, 2), rt = mv.slice(2);
      game.current.move({ from: rf, to: rt, promotion: 'q' });
      newHist = [...newHist, game.current.fen()];
      idx++;
    }

    setHistory(newHist);
    setMoveIndex(idx);
    setVisualIndex(newHist.length - 1);

    if (idx >= activeLine.length) {
      setSolved(true);
    }

    return true;
  };

  const goBackward = () => setVisualIndex(i => Math.max(0, i - 1));
  const goForward  = () => setVisualIndex(i => Math.min(history.length - 1, i + 1));
  const handleUndo = () => {
    if (history.length <= 2) return;
    const h = history.slice(0, -2);
    setHistory(h);
    setMoveIndex(mi => Math.max(0, mi - 2));
    setVisualIndex(h.length - 1);
    setSolved(false);  
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh', flexDirection: 'column',
    }}>
      <div style={{ padding: 16, width: 500, maxWidth: '95%' }}>
        <h3 style={{ textAlign: 'center' }}>Chess Repertoire Trainer</h3>

        <input
          type="text"
          value={repertoireName}
          onChange={e => setRepertoireName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter repertoire name and press Enter"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
          disabled={isLoading}
        />
        {isLoading && <div>Loading…</div>}
        {error    && <div style={{ color: 'red' }}>{error}</div>}

        {repertoireLines.length > 0 && (
          <div style={{ margin: '8px 0', textAlign: 'center' }}>
            <label>
              Choose line:{' '}
              <select value={selectedLineIndex} onChange={handleVariantChange}>
                {repertoireLines.map((_, i) => (
                  <option key={i} value={i}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <Chessboard
          id="RepertoireBoard"
          position={history[visualIndex]}
          onPieceDrop={onPieceDrop}
          boardOrientation="white"
          areArrowsAllowed={false}
          arePremovesAllowed={false}
          arePiecesDraggable={true}
        />

        {solved && (
          <div style={{
            marginTop: 12,
            padding: '8px',
            backgroundColor: '#e0ffe0',
            color: '#007700',
            textAlign: 'center',
            borderRadius: 4,
          }}>
            🎉 Line solved!
          </div>
        )}

        <div style={{
          marginTop: 12, display: 'flex',
          gap: 10, justifyContent: 'center', flexWrap: 'wrap'
        }}>
          <button onClick={goBackward} disabled={visualIndex === 0}>⬅ Back</button>
          <button onClick={handleUndo}  disabled={history.length <= 2}>❌ Undo</button>
          <button onClick={goForward}   disabled={visualIndex === history.length - 1}>Forward ➡</button>
        </div>
      </div>
    </div>
  );
}
