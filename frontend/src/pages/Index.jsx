// src/pages/Index.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: 16,
      boxSizing: 'border-box',
    }}>
      <h1 style={{ marginBottom: 24, color: '#ffffff' }}>Chess Repertoire Trainer</h1>

      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link
          to="/repertoire"
          style={{
            textDecoration: 'none',
            padding: '12px 24px',
            backgroundColor: '#0074D9',
            color: 'white',
            borderRadius: 4,
            fontSize: '1rem'
          }}
        >
          Create Repertoire
        </Link>

        <Link
          to="/play"
          style={{
            textDecoration: 'none',
            padding: '12px 24px',
            backgroundColor: '#2ECC40',
            color: 'white',
            borderRadius: 4,
            fontSize: '1rem'
          }}
        >
          Train Repertoire
        </Link>
      </div>
    </div>
  );
}

