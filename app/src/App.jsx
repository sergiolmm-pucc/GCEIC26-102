import React from 'react';
import TripModule from './tripModule';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',  // Centraliza na horizontal
      alignItems: 'center',      // Centraliza na vertical
      minHeight: '100vh',        // Garante que o container use toda a altura da tela do navegador
      width: '100vw',            // Garante que use toda a largura da tela
      background: '#f4f4f9',     // Cor de fundo leve atrás do card
      margin: 0, 
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <TripModule />
    </div>
  );
}

export default App;