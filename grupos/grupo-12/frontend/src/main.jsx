import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  BadgeHelp,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  HandCoins,
  LogIn,
  PiggyBank,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { autenticarGrupo12 } from './auth';
import { postGrupo12 } from './api';
import { validarCamposObrigatorios, validarNumerosPositivos } from './validators';
import './styles.css';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const percentual = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

const navegacao = [
  { id: 'dashboard', label: 'Dashboard', icon: Calculator },
  { id: 'faturamento', label: 'Faturamento', icon: Clock3 },
  { id: 'impostos', label: 'Impostos PJ', icon: CircleDollarSign },
  { id: 'prolabore', label: 'Pro-labore', icon: HandCoins },
  { id: 'reservas', label: 'Reservas', icon: PiggyBank },
  { id: 'simulador', label: 'Simulador', icon: BriefcaseBusiness },
  { id: 'sobre', label: 'Sobre', icon: Users },
  { id: 'ajuda', label: 'Ajuda', icon: BadgeHelp },
];

function numero(valor) {
  return Number(String(valor).replace(',', '.'));
}

function formatarResultado(chave, valor) {
  if (typeof valor !== 'number') return valor;

  const chaveNormalizada = chave.toLowerCase();
  if (chaveNormalizada.includes('aliquota') || chaveNormalizada.includes('percentual')) {
    return `${percentual.format(valor)}%`;
  }
  if (chaveNormalizada.includes('horas')) {
    return `${percentual.format(valor)} h`;
  }

  return moeda.format(valor);
}

function Resultado({ dados }) {
  if (!dados) return null;

  return (
    <section className="resultado" aria-live="polite">
      <h3>Resultado</h3>
      <div className="resultado-grid">
        {Object.entries(dados)
          .filter(([chave]) => chave !== 'aviso' && chave !== 'resumo')
          .map(([chave, valor]) => (
            <div className="linha-resultado" key={chave}>
              <span>{chave}</span>
              <strong>{formatarResultado(chave, valor)}</strong>
            </div>
          ))}
      </div>
      {dados.resumo && <p className="resumo">{dados.resumo}</p>}
      <p className="aviso">{dados.aviso}</p>
    </section>
  );
}

function Splash({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1400);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <main className="splash">
      <div>
        <p className="tag">Grupo 12</p>
        <h1>Dev PJ Tax</h1>
        <p>Simulador educacional de impostos, pro-labore e reservas para desenvolvedores PJ.</p>
      </div>
    </main>
  );
}

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function entrar(evento) {
    evento.preventDefault();
    if (autenticarGrupo12(usuario, senha)) {
      setErro('');
      onLogin();
      return;
    }
    setErro('Usuario ou senha incorretos. Use grupo12 / grupo12.');
  }

  return (
    <main className="login-page">
      <form className="auth-box" onSubmit={entrar}>
        <p className="tag">Acesso Grupo 12</p>
        <h1>Entrar</h1>
        <label>
          Usuario
          <input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="grupo12" />
        </label>
        <label>
          Senha
          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="grupo12"
            type="password"
          />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit">
          <LogIn size={18} />
          Entrar
        </button>
      </form>
    </main>
  );
}

function Layout({ tela, setTela, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <ShieldCheck size={28} />
          <div>
            <strong>Dev PJ Tax</strong>
            <span>Grupo 12</span>
          </div>
        </div>
        <nav>
          {navegacao.map((item) => {
            const Icone = item.icon;
            return (
              <button
                className={tela === item.id ? 'nav-ativo' : ''}
                key={item.id}
                onClick={() => setTela(item.id)}
                type="button"
              >
                <Icone size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="conteudo">{children}</main>
    </div>
  );
}

function Dashboard({ setTela }) {
  const cards = [
    {
      id: 'faturamento',
      icon: Clock3,
      titulo: 'Faturamento mensal',
      texto: 'Calcule a receita por hora trabalhada ou informe um faturamento direto.',
    },
    {
      id: 'impostos',
      icon: CircleDollarSign,
      titulo: 'Calculo de impostos PJ',
      texto: 'Estime aliquota efetiva, imposto e receita liquida mensal.',
    },
    {
      id: 'prolabore',
      icon: HandCoins,
      titulo: 'Pro-labore e INSS',
      texto: 'Simule desconto de INSS sobre o pro-labore configurado.',
    },
    {
      id: 'reservas',
      icon: PiggyBank,
      titulo: 'Reservas mensais',
      texto: 'Separe valores para impostos, ferias e emergencia.',
    },
    {
      id: 'simulador',
      icon: BriefcaseBusiness,
      titulo: 'Simulacao completa',
      texto: 'Combine receita, pro-labore, INSS e reserva em um resumo unico.',
    },
    {
      id: 'ajuda',
      icon: BadgeHelp,
      titulo: 'Ajuda',
      texto: 'Veja o significado dos campos e o aviso de uso educacional.',
    },
  ];

  return (
    <>
      <header className="cabecalho">
        <p className="tag">Tema do projeto</p>
        <h1>Calculo de impostos para desenvolvedores PJ</h1>
        <p>
          Use as telas para simular faturamento, impostos, INSS e reservas mensais com parametros
          configuraveis.
        </p>
      </header>

      <section className="cards">
        {cards.map((card) => {
          const Icone = card.icon;
          return (
            <article className="card" key={card.id}>
              <Icone size={30} />
              <h2>{card.titulo}</h2>
              <p>{card.texto}</p>
              <button type="button" onClick={() => setTela(card.id)} aria-label={`Abrir ${card.titulo}`}>
                <ArrowRight size={18} />
                Abrir
              </button>
            </article>
          );
        })}
      </section>

      <section className="faixa-info">
        <CalendarDays size={24} />
        <p>
          Os percentuais nao sao definitivos: ajuste os dados conforme sua realidade e consulte um
          contador antes de tomar decisoes.
        </p>
      </section>
    </>
  );
}

function TelaFaturamento() {
  const [form, setForm] = useState({
    valorHora: '120',
    horasTrabalhadas: '160',
    receitaMensal: '',
  });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function calcular(evento) {
    evento.preventDefault();
    const camposObrigatorios = form.receitaMensal ? ['receitaMensal'] : ['valorHora', 'horasTrabalhadas'];
    const obrigatorios = validarCamposObrigatorios(form, camposObrigatorios);
    const numericos = validarNumerosPositivos(form, ['valorHora', 'horasTrabalhadas', 'receitaMensal']);

    if (!obrigatorios.valido || !numericos.valido) {
      setErro(obrigatorios.mensagem || numericos.mensagem);
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const dados = await postGrupo12('/faturamento-mensal', {
        valorHora: form.valorHora ? numero(form.valorHora) : undefined,
        horasTrabalhadas: form.horasTrabalhadas ? numero(form.horasTrabalhadas) : undefined,
        receitaMensal: form.receitaMensal ? numero(form.receitaMensal) : undefined,
      });
      setResultado(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">API /api/grupo12/faturamento-mensal</p>
        <h1>Faturamento mensal</h1>
      </header>
      <form className="formulario" onSubmit={calcular}>
        <label>
          Valor hora
          <input value={form.valorHora} onChange={(e) => setForm({ ...form, valorHora: e.target.value })} />
        </label>
        <label>
          Horas trabalhadas
          <input
            value={form.horasTrabalhadas}
            onChange={(e) => setForm({ ...form, horasTrabalhadas: e.target.value })}
          />
        </label>
        <label>
          Receita mensal opcional
          <input value={form.receitaMensal} onChange={(e) => setForm({ ...form, receitaMensal: e.target.value })} />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={carregando}>
          <Clock3 size={18} />
          {carregando ? 'Calculando' : 'Calcular'}
        </button>
      </form>
      <Resultado dados={resultado} />
    </section>
  );
}

function TelaImpostos() {
  const [form, setForm] = useState({
    receitaMensal: '10000',
    receitaAnualEstimativa: '120000',
    aliquota: '6',
    deducao: '0',
  });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function calcular(evento) {
    evento.preventDefault();
    const obrigatorios = validarCamposObrigatorios(form, ['receitaMensal', 'aliquota']);
    const numericos = validarNumerosPositivos(form, [
      'receitaMensal',
      'receitaAnualEstimativa',
      'aliquota',
      'deducao',
    ]);

    if (!obrigatorios.valido || !numericos.valido) {
      setErro(obrigatorios.mensagem || numericos.mensagem);
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const dados = await postGrupo12('/impostos-pj', {
        receitaMensal: numero(form.receitaMensal),
        receitaAnualEstimativa: form.receitaAnualEstimativa ? numero(form.receitaAnualEstimativa) : undefined,
        aliquota: numero(form.aliquota),
        deducao: form.deducao ? numero(form.deducao) : 0,
      });
      setResultado(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">API /api/grupo12/impostos-pj</p>
        <h1>Calculo de impostos PJ</h1>
      </header>
      <form className="formulario" onSubmit={calcular}>
        <label>
          Receita mensal
          <input value={form.receitaMensal} onChange={(e) => setForm({ ...form, receitaMensal: e.target.value })} />
        </label>
        <label>
          Receita anual estimada
          <input
            value={form.receitaAnualEstimativa}
            onChange={(e) => setForm({ ...form, receitaAnualEstimativa: e.target.value })}
          />
        </label>
        <label>
          Aliquota nominal (%)
          <input value={form.aliquota} onChange={(e) => setForm({ ...form, aliquota: e.target.value })} />
        </label>
        <label>
          Deducao aproximada
          <input value={form.deducao} onChange={(e) => setForm({ ...form, deducao: e.target.value })} />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={carregando}>
          <Calculator size={18} />
          {carregando ? 'Calculando' : 'Calcular'}
        </button>
      </form>
      <Resultado dados={resultado} />
    </section>
  );
}

function TelaProLabore() {
  const [form, setForm] = useState({ proLabore: '3000', percentualINSS: '11' });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function calcular(evento) {
    evento.preventDefault();
    const campos = ['proLabore', 'percentualINSS'];
    const obrigatorios = validarCamposObrigatorios(form, campos);
    const numericos = validarNumerosPositivos(form, campos);

    if (!obrigatorios.valido || !numericos.valido) {
      setErro(obrigatorios.mensagem || numericos.mensagem);
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const dados = await postGrupo12('/pro-labore-inss', {
        proLabore: numero(form.proLabore),
        percentualINSS: numero(form.percentualINSS),
      });
      setResultado(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">API /api/grupo12/pro-labore-inss</p>
        <h1>Pro-labore e INSS</h1>
      </header>
      <form className="formulario" onSubmit={calcular}>
        <label>
          Pro-labore
          <input value={form.proLabore} onChange={(e) => setForm({ ...form, proLabore: e.target.value })} />
        </label>
        <label>
          Percentual INSS (%)
          <input
            value={form.percentualINSS}
            onChange={(e) => setForm({ ...form, percentualINSS: e.target.value })}
          />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={carregando}>
          <HandCoins size={18} />
          {carregando ? 'Calculando' : 'Calcular'}
        </button>
      </form>
      <Resultado dados={resultado} />
    </section>
  );
}

function TelaReservas() {
  const [form, setForm] = useState({
    receitaMensal: '10000',
    percentualReservaImpostos: '10',
    percentualReservaFerias: '8.33',
    percentualReservaEmergencia: '5',
  });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const campos = [
    'receitaMensal',
    'percentualReservaImpostos',
    'percentualReservaFerias',
    'percentualReservaEmergencia',
  ];

  async function calcular(evento) {
    evento.preventDefault();
    const obrigatorios = validarCamposObrigatorios(form, campos);
    const numericos = validarNumerosPositivos(form, campos);

    if (!obrigatorios.valido || !numericos.valido) {
      setErro(obrigatorios.mensagem || numericos.mensagem);
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const dados = await postGrupo12('/reservas', {
        receitaMensal: numero(form.receitaMensal),
        percentualReservaImpostos: numero(form.percentualReservaImpostos),
        percentualReservaFerias: numero(form.percentualReservaFerias),
        percentualReservaEmergencia: numero(form.percentualReservaEmergencia),
      });
      setResultado(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">API /api/grupo12/reservas</p>
        <h1>Reservas mensais</h1>
      </header>
      <form className="formulario" onSubmit={calcular}>
        {campos.map((campo) => (
          <label key={campo}>
            {campo}
            <input value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} />
          </label>
        ))}
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={carregando}>
          <PiggyBank size={18} />
          {carregando ? 'Calculando' : 'Calcular'}
        </button>
      </form>
      <Resultado dados={resultado} />
    </section>
  );
}

function TelaSimulador() {
  const [form, setForm] = useState({
    receitaMensal: '10000',
    proLabore: '3000',
    percentualImposto: '6',
    percentualINSS: '11',
    percentualReserva: '10',
  });
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const campos = useMemo(
    () => ['receitaMensal', 'proLabore', 'percentualImposto', 'percentualINSS', 'percentualReserva'],
    [],
  );

  async function simular(evento) {
    evento.preventDefault();
    const obrigatorios = validarCamposObrigatorios(form, campos);
    const numericos = validarNumerosPositivos(form, campos);

    if (!obrigatorios.valido || !numericos.valido) {
      setErro(obrigatorios.mensagem || numericos.mensagem);
      return;
    }

    setCarregando(true);
    setErro('');
    try {
      const dados = await postGrupo12('/simulador', {
        receitaMensal: numero(form.receitaMensal),
        proLabore: numero(form.proLabore),
        percentualImposto: numero(form.percentualImposto),
        percentualINSS: numero(form.percentualINSS),
        percentualReserva: numero(form.percentualReserva),
      });
      setResultado(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">API /api/grupo12/simulador</p>
        <h1>Simulacao completa</h1>
      </header>
      <form className="formulario" onSubmit={simular}>
        {campos.map((campo) => (
          <label key={campo}>
            {campo}
            <input value={form[campo]} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} />
          </label>
        ))}
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={carregando}>
          <PiggyBank size={18} />
          {carregando ? 'Simulando' : 'Simular'}
        </button>
      </form>
      <Resultado dados={resultado} />
    </section>
  );
}

function Sobre() {
  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">Sobre</p>
        <h1>Grupo 12</h1>
        <p>Projeto de calculo de impostos para desenvolvedores que trabalham como PJ.</p>
      </header>
      <div className="sobre-grid">
        <div className="foto-equipe">Foto da equipe</div>
        <div>
          <h2>Integrantes</h2>
          <ul className="lista">
            <li>Integrante 1 - placeholder</li>
            <li>Integrante 2 - placeholder</li>
            <li>Integrante 3 - placeholder</li>
            <li>Integrante 4 - placeholder</li>
          </ul>
          <p>
            A proposta e oferecer uma ferramenta simples para visualizar o impacto de impostos,
            pro-labore, INSS e reservas no fluxo mensal de um desenvolvedor PJ.
          </p>
        </div>
      </div>
    </section>
  );
}

function Ajuda() {
  return (
    <section className="painel">
      <header className="cabecalho compact">
        <p className="tag">Help</p>
        <h1>Ajuda</h1>
      </header>
      <div className="ajuda">
        <h2>Como usar</h2>
        <p>Entre com usuario e senha fixos, acesse o dashboard e escolha o calculo desejado.</p>
        <h2>Campos principais</h2>
        <p>
          Receita mensal e o faturamento previsto. Pro-labore e a remuneracao do socio. Aliquotas
          sao percentuais estimados e editaveis.
        </p>
        <h2>Aviso</h2>
        <p>
          Os resultados sao estimativas para fins educacionais e nao substituem consultoria
          contabil oficial.
        </p>
      </div>
    </section>
  );
}

function App() {
  const [fase, setFase] = useState('splash');
  const [tela, setTela] = useState('dashboard');

  if (fase === 'splash') return <Splash onDone={() => setFase('login')} />;
  if (fase === 'login') return <Login onLogin={() => setFase('app')} />;

  return (
    <Layout tela={tela} setTela={setTela}>
      {tela === 'dashboard' && <Dashboard setTela={setTela} />}
      {tela === 'faturamento' && <TelaFaturamento />}
      {tela === 'impostos' && <TelaImpostos />}
      {tela === 'prolabore' && <TelaProLabore />}
      {tela === 'reservas' && <TelaReservas />}
      {tela === 'simulador' && <TelaSimulador />}
      {tela === 'sobre' && <Sobre />}
      {tela === 'ajuda' && <Ajuda />}
    </Layout>
  );
}

createRoot(document.getElementById('root')).render(<App />);
