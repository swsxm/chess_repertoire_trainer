import React, { useState, useRef } from 'react'; 
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

export default function Play() {
  const game = useRef(new Chess());
  const [history, setHistory] = useState([game.current.fen()]);
  const [visualIndex, setVisualIndex] = useState(0);
  const [repertoireName, setRepertoireName] = useState('');
  const [boardArrows, setBoardArrows] = useState([]);

  function getCurrentLine() {
    const verbose = game.current.history({ verbose: true });
    return verbose.map(m => m.from + m.to).join(' ');
  }

  async function fetchRepertoireMoves() {
    const name = repertoireName.trim();
    if (!name) return;
    setBoardArrows([]);
    const line = getCurrentLine();
    try {
      const response = await fetch('http://localhost:8000/get_moves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, line }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}`);
      }
      const suggested = await response.json();
      if (!Array.isArray(suggested)) {
        throw new Error('Expected an array of UCI moves');
      }
      const arrows = suggested
        .filter(mv => typeof mv === 'string' && mv.length >= 4)
        .map(mv => [mv.slice(0,2), mv.slice(2,4), 'rgba(255,165,0,0.6)']);
      setBoardArrows(arrows);
    } catch (err) {
      console.log(err)
    } 
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      fetchRepertoireMoves();
    }
  };

  function onPieceDrop(sourceSquare, targetSquare) {
    const move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (move === null) return false;
    const newFen = game.current.fen();
    const newHistory = [...history.slice(0, visualIndex + 1), newFen];
    setHistory(newHistory);
    setVisualIndex(newHistory.length - 1);
    return true;
  }

  function handleUndo() {
    const moveUndone = game.current.undo();
    if (moveUndone) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setVisualIndex(newHistory.length - 1);
    }
  }

  function goBackward() {
    setVisualIndex(i => Math.max(0, i - 1));
  }

  function goForward() {
    setVisualIndex(i => Math.min(history.length - 1, i + 1));
  }

  async function handleSave() {
    const currentHistoryVerbose = game.current.history({ verbose: true });
    const moves = currentHistoryVerbose.map(move => move.from + move.to);
    const line = moves.join(' ');
    if (!repertoireName.trim()) {
      alert("Please enter a repertoire name.");
      return;
    }
    if (line.length === 0) {
      alert("No moves to save.");
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: repertoireName.trim(), line }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        throw new Error(`Server responded with ${response.status}: ${errorData.message || 'Failed to save'}`);
      }
      alert("Line saved successfully!");
    } catch (error) {
      alert(`Failed to save line: ${error.message}`);
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{ padding: 16, width: 500, maxWidth: '95%' }}>
        <h3 style={{ textAlign: 'center' }}>Chess Repertoire Trainer</h3>
        <div style={{ marginBottom: 10, textAlign: 'center' }}>
          <input
            type="text"
            value={repertoireName}
            onChange={e => setRepertoireName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter Repertoire Name and press Enter"
            style={{ width: "100%", padding: 8, boxSizing: 'border-box' }}
          />
        </div>
        <Chessboard
          id="BasicBoard"
          position={history[visualIndex]}
          onPieceDrop={onPieceDrop}
          boardOrientation="white"
          customArrows={boardArrows}
          areArrowsAllowed={false}
          arePremovesAllowed={true}
          arePiecesDraggable={true}
        />
        <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={goBackward}>⬅ Backward</button>
          <button onClick={goForward}>Forward ➡</button>
          <button onClick={handleUndo}>❌ Undo Move</button>
          <button onClick={handleSave}>💾 Save Line</button>
        </div>
      </div>
    </div>
  );
}

