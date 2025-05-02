import React, { useState, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

class Repertoire {
  constructor() {
    this.moves = {};
  }

  addMove(game) {
    const moves = game.history({ verbose: true });
    const lanMoves = moves.map(move => move.from + move.to);
    let curr = this.moves;

    for (const move of lanMoves) {
      if (!(move in curr)) {
        curr[move] = {};
      }
      curr = curr[move];
    }
  }
}

export default function App() {
  const game = useRef(new Chess());
  const repertoire = useRef(new Repertoire());

  const [history, setHistory] = useState([game.current.fen()]);
  const [visualIndex, setVisualIndex] = useState(0);
  const [repertoireName, setRepertoireName] = useState('');

  function onPieceDrop(sourceSquare, targetSquare) {
    const move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });

    if (move === null) {
      return false;
    }

    const newFen = game.current.fen();
    const newHistory = [...history.slice(0, visualIndex + 1), newFen];
    setHistory(newHistory);
    setVisualIndex(newHistory.length - 1);

    repertoire.current.addMove(game.current);
    console.log("Repertoire:", repertoire.current.moves);
    return true;
  }

  function handleUndo() {
    game.current.undo();
    const newHistory = [...history.slice(0, -1)];
    setHistory(newHistory);
    setVisualIndex(newHistory.length - 1);
  }

  function goBackward() {
    const newIndex = visualIndex - 1;
    if (newIndex >= 0) {
      setVisualIndex(newIndex);
    }
  }

  function goForward() {
    const newIndex = visualIndex + 1;
    if (newIndex < history.length) {
      setVisualIndex(newIndex);
    }
  }

  async function handleSave() {
    const moves = game.current.history({ verbose: true }).map(move => move.from + move.to);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: repertoireName, line }),
      });

      const result = await response.json();
      console.log("Server response:", result);
      alert("Line saved successfully!");
    } catch (error) {
      console.error("Error saving line:", error);
      alert("Failed to save line.");
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <div style={{ padding: 16, width: 500 }}>
        <h3 style={{ textAlign: 'center' }}>Chess Repertoire Trainer</h3>

        <div style={{ marginBottom: 10, textAlign: 'center' }}>
          <input
            type="text"
            value={repertoireName}
            onChange={e => setRepertoireName(e.target.value)}
            placeholder="Enter repertoire name"
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <Chessboard
          id="BasicBoard"
          position={history[visualIndex]}
          onPieceDrop={onPieceDrop}
          boardOrientation="white"
          areArrowsAllowed={true}
          arePremovesAllowed={true}
          arePiecesDraggable={true}
        />

        <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={goBackward}>⬅ Backward</button>
          <button onClick={goForward}>Forward ➡</button>
          <button onClick={handleUndo}>❌ Undo Move</button>
          <button onClick={handleSave}>💾 Save Line</button>
        </div>
      </div>
    </div>
  );
}

