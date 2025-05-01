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

return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}>
      <div style={{ padding: 16, width: 500 }}>
        <h3 style={{ textAlign: 'center' }}>Chess Repertoire Trainer</h3>

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
        </div>
      </div>
    </div>
  );
}

