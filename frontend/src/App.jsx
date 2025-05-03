import React, { useState, useRef, useEffect } from 'react'; 
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';


export default function App() {
  const game = useRef(new Chess());

  const [history, setHistory] = useState([game.current.fen()]);
  const [visualIndex, setVisualIndex] = useState(0);
  const [repertoireName, setRepertoireName] = useState('');

  const [boardArrows, setBoardArrows] = useState([]);


  useEffect(() => {
    const trimmedRepertoireName = repertoireName.trim();

    if (!trimmedRepertoireName) {
      setBoardArrows([]); 
      return; 
    }

    let isMounted = true; 
    const currentHistoryVerbose = game.current.history({ verbose: true });
    const moves = currentHistoryVerbose.map(move => move.from + move.to);
    const line = moves.join(' ');

    const fetchRepertoireMoves = async () => {
      setIsLoadingMoves(true);
      setBoardArrows([]);  

      try {
        const response = await fetch('http://localhost:8000/get_moves', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: trimmedRepertoireName, 
            line: line 
          }),
        });

        if (!isMounted) return; 

        if (!response.ok) {
           let errorMsg = `HTTP error! Status: ${response.status}`;
           try {
               const errorData = await response.json();
               errorMsg = `Server Error (${response.status}): ${errorData.message || 'Failed to fetch moves'}`;
           } catch (e) {
               
           }
           throw new Error(errorMsg);
        }


        const suggestedMoves = await response.json(); 

        if (Array.isArray(suggestedMoves)) {
          const newArrows = suggestedMoves.map(move => {
            if (typeof move === 'string' && move.length >= 4) {
              const from = move.substring(0, 2);
              const to = move.substring(2, 4);
              return [from, to, 'rgba(255, 165, 0, 0.6)'];
            }
             console.warn("Received invalid move format in response:", move);
             return null; 
          }).filter(Boolean); 

          setBoardArrows(newArrows);
        } else {
             throw new Error("Invalid response format: Expected an array of moves.");
        }

      } catch (error) {
        console.error("Error fetching repertoire moves:", error);
        if (isMounted) {
          setBoardArrows([]); 
        }
      }
      
    };

    fetchRepertoireMoves();

    return () => {
      isMounted = false; 
    };
  }, [visualIndex, history, repertoireName]);


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
        if (newHistory.length > 0) { 
            setHistory(newHistory);
            setVisualIndex(newHistory.length - 1); 
        }
    } else {
        console.log("Cannot undo further.");
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: repertoireName.trim(), line }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
        throw new Error(`Server responded with ${response.status}: ${errorData.message || 'Failed to save'}`);
      }

      const result = await response.json();
      console.log("Server response:", result);
      alert("Line saved successfully!");
    } catch (error) {
      console.error("Error saving line:", error);
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
            placeholder="Enter Repertoire Name" 
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
