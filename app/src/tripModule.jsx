import React, { useState, useEffect } from 'react';

export default function TripModule() {
  const [screen, setScreen] = useState('splash');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados do formulário de cálculo
  const [form, setForm] = useState({ origin: '', destination: '', km: '', autonomy: '', gasPrice: '5.50', alcPrice: '3.80' });
  const [results, setResults] = useState(null);

  // 1. Splash Screen Timeout
  useEffect(() => {
    if (screen === 'splash') {
      const timer = setTimeout(() => setScreen('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // 2. Login Fixo
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      setScreen('dashboard');
    } else {
      alert('Usuário ou senha incorretos!');
    }
  };

  // 3. Conexão Real com a sua API Node.js
  const handleCalculate = async (e) => {
    e.preventDefault();
    const API_URL = 'http://localhost:3000/api/v1/trip';

    try {
      const [resCost, resTolls, resTime] = await Promise.all([
        fetch(`${API_URL}/cost`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distanceKm: parseFloat(form.km),
            autonomyKmL: parseFloat(form.autonomy),
            priceGasoline: parseFloat(form.gasPrice),
            priceAlcohol: parseFloat(form.alcPrice)
          })
        }),
        fetch(`${API_URL}/tolls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ distanceKm: parseFloat(form.km) })
        }),
        fetch(`${API_URL}/time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ distanceKm: parseFloat(form.km), averageSpeedKmH: 90 })
        })
      ]);

      if (!resCost.ok || !resTolls.ok || !resTime.ok) {
        throw new Error('Erro ao processar dados no servidor.');
      }

      const dataCost = await resCost.json();
      const dataTolls = await resTolls.json();
      const dataTime = await resTime.json();

      setResults({
        liters: dataCost.litersNeeded,
        gasCost: dataCost.costGasoline,
        alcCost: dataCost.costAlcohol,
        tolls: dataTolls.tollCount,
        tollCost: dataTolls.totalTollCost,
        time: dataTime.formattedTime
      });

    } catch (error) {
      alert(error.message);
    }
  };

  // O objeto que estava faltando e gerando o erro no console:
  const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', width: '100%', maxWidth: '500px', margin: '0 auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    nav: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    button: { padding: '8px 12px', cursor: 'pointer', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold' },
    input: { display: 'block', width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }
  };

  if (screen === 'splash') {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '3rem', color: '#007bff', margin: '0 0 10px 0' }}>TRIP ✨</h1>
        <p style={{ margin: '0 0 20px 0', color: '#555' }}>Travel Routing & Cost Predictor</p>
        <p style={{ color: '#888', fontSize: '14px' }}>Carregando módulo...</p>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div style={styles.container}>
        <h2 style={{ marginTop: 0 }}>Login - Módulo TRIP</h2>
        <form onSubmit={handleLogin}>
          <input style={styles.input} type="text" placeholder="Usuário (admin)" onChange={e => setUsername(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Senha (1234)" onChange={e => setPassword(e.target.value)} required />
          <button style={{ ...styles.button, width: '100%', padding: '12px' }} type="submit">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <button style={styles.button} onClick={() => setScreen('dashboard')}>Calculadora</button>
        <button style={styles.button} onClick={() => setScreen('about')}>Sobre a Equipe</button>
        <button style={styles.button} onClick={() => setScreen('help')}>Ajuda</button>
        <button style={{ ...styles.button, background: '#dc3545' }} onClick={() => setScreen('login')}>Sair</button>
      </nav>

      {screen === 'dashboard' && (
        <div>
          <h3 style={{ marginTop: 0 }}>📍 Planejar Nova Viagem</h3>
          <form onSubmit={handleCalculate}>
            <input style={styles.input} type="text" placeholder="Origem" required />
            <input style={styles.input} type="text" placeholder="Destino" required />
            <input style={styles.input} type="number" placeholder="Distância (Km)" onChange={e => setForm({...form, km: e.target.value})} required />
            <input style={styles.input} type="number" placeholder="Consumo do Carro (Km/L)" onChange={e => setForm({...form, autonomy: e.target.value})} required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Preço Gasolina (R$)</label>
                <input style={styles.input} type="number" step="0.01" value={form.gasPrice} onChange={e => setForm({...form, gasPrice: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Preço Álcool (R$)</label>
                <input style={styles.input} type="number" step="0.01" value={form.alcPrice} onChange={e => setForm({...form, alcPrice: e.target.value})} />
              </div>
            </div>

            <button style={{ ...styles.button, width: '100%', padding: '12px', background: '#28a745', marginTop: '10px' }} type="submit">Calcular Custos</button>
          </form>

          {results && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#f8f9fa', 
              borderRadius: '5px', 
              borderLeft: '5px solid #28a745',
              color: '#212529' // <--- ESTA LINHA CORRIGE O ERRO VISUAL DA IMAGEM
            }}>
              <h4 style={{ marginTop: 0, color: '#212529' }}>📊 Resumo da Viagem:</h4>
              <p style={{ color: '#212529' }}>⛽ <b>Combustível Necessário:</b> {results.liters} L</p>
              <p style={{ color: '#212529' }}>💵 <b>Gasto Gasolina:</b> R$ {results.gasCost.toFixed(2)}</p>
              <p style={{ color: '#212529' }}>🌱 <b>Gasto Álcool:</b> R$ {results.alcCost.toFixed(2)}</p>
              <p style={{ color: '#212529' }}>🛣️ <b>Pedágios:</b> {results.tolls} passagens (Total: R$ {results.tollCost.toFixed(2)})</p>
              <p style={{ color: '#212529' }}>⏱️ <b>Tempo Estimado:</b> {results.time}</p>
            </div>
          )}
        </div>
      )}

      {screen === 'about' && (
  <div>
    <h3 style={{ marginTop: 0, color: '#212529', textAlign: 'center', marginBottom: '20px' }}>👥 Nossa Equipe</h3>
    
    {/* Grid ajustado para exibir 3 colunas em telas médias/grandes */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
      gap: '15px', 
      marginTop: '10px' 
    }}>
      
      {/* CARD 1: PAULO CESAR */}
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', textAlign: 'center', border: '1px solid #eee' }}>
        <img 
          src="/0c7e0bac-b672-4d43-bcbb-c3bbfad57452.jpg" 
          alt="Foto do Paulo Cesar" 
          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #007bff' }} 
        />
        <h4 style={{ margin: '5px 0', color: '#212529', fontSize: '15px' }}>Paulo Cesar</h4>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Desenvolvedor Backend</p>
      </div>

      {/* CARD 2: PEDRO HENRIQUE */}
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', textAlign: 'center', border: '1px solid #eee' }}>
        <img 
          src="/6ccdeaa2-345d-4119-abd8-2ac30ac79d99.jpg" 
          alt="Foto do Pedro Henrique" 
          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #007bff' }} 
        />
        <h4 style={{ margin: '5px 0', color: '#212529', fontSize: '15px' }}>Pedro Henrique</h4>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Desenvolvedor Frontend</p>
      </div>

      {/* CARD 3: KAIO BURILLI */}
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', textAlign: 'center', border: '1px solid #eee' }}>
        <img 
          src="/eff0b287-0e77-4c79-923e-8318813d15df.jpg" 
          alt="Foto do Kaio Burilli" 
          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #007bff' }} 
        />
        <h4 style={{ margin: '5px 0', color: '#212529', fontSize: '15px' }}>Kaio Burilli</h4>
        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Gerente de Testes / Quality Assurance</p>
      </div>

    </div>
  </div>
)}

      {screen === 'help' && (
        <div>
          <h3 style={{ marginTop: 0 }}>💡 Central de Ajuda</h3>
          <p><b>Como funciona o cálculo de pedágios?</b></p>
          <p style={{ color: '#555', fontSize: '14px' }}>O sistema estima automaticamente um pedágio fixo a cada 80km rodados baseado nas rotas da API.</p>
          <p><b>Por que o valor do álcool é diferente?</b></p>
          <p style={{ color: '#555', fontSize: '14px' }}>O cálculo leva em conta o coeficiente de rendimento energético do etanol (70%) comparado ao da gasolina.</p>
        </div>
      )}
    </div>
  );
}