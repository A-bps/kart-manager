const { useState, useEffect } = React;

// === auth ===
function auth_getSession() {
  try { return JSON.parse(sessionStorage.getItem('sp_usuario') || 'null'); } catch { return null; }
}
function auth_clearSession() { sessionStorage.removeItem('sp_usuario'); }
const usuario = auth_getSession();
if (!usuario || usuario.role !== 'admin') window.location.replace('index.html');
function handleLogout() { auth_clearSession(); window.location.href = 'index.html'; }

// === pilotos ===
function pilotos_listar() { return JSON.parse(localStorage.getItem('sp_pilotos') || '[]'); }
function pilotos_salvar(lista) { localStorage.setItem('sp_pilotos', JSON.stringify(lista)); }
function pilotos_deletar(id) { pilotos_salvar(pilotos_listar().filter(p => p.id !== id)); }
function pilotos_email_existe(email) { return pilotos_listar().some(p => p.email === email); }
function pilotos_cadastrar(piloto) {
  pilotos_salvar([...pilotos_listar(), { ...piloto, role: 'piloto', id: Date.now(), criadoEm: new Date().toISOString() }]);
}

// === frota ===
function frota_listar() { return JSON.parse(localStorage.getItem('sp_frota') || '[]'); }
function frota_salvar(l) { localStorage.setItem('sp_frota', JSON.stringify(l)); }
function frota_add(numero) {
  frota_salvar([...frota_listar(), { id: `k${Date.now()}`, numero: Number(numero), status: 'pronto' }]);
}
function frota_setStatus(id, status) {
  frota_salvar(frota_listar().map(k => k.id === id ? { ...k, status } : k));
}
function frota_remover(id) { frota_salvar(frota_listar().filter(k => k.id !== id)); }

function calcCategoria(nascimento) {
  if (!nascimento) return 'open';
  const hoje = new Date();
  const nasc = new Date(nascimento + 'T12:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
  return idade <= 13 ? 'junior' : 'open';
}

// === horários (grade criada pelo admin) ===
function horarios_listar() { return JSON.parse(localStorage.getItem('sp_horarios') || '[]'); }
function horarios_salvar(l) { localStorage.setItem('sp_horarios', JSON.stringify(l)); }
function horarios_add(d) { horarios_salvar([...horarios_listar(), { id: `h${Date.now()}`, ...d }]); }
function horarios_remover(id) {
  horarios_salvar(horarios_listar().filter(h => h.id !== id));
  reservas_salvar(reservas_listar().filter(r => r.horarioId !== id));
}
function horarios_do_dia(data) {
  return horarios_listar().filter(h => h.data === data).sort((a, b) => a.hora.localeCompare(b.hora));
}

// === reservas (inscrições em um horário) ===
function reservas_listar() { return JSON.parse(localStorage.getItem('sp_reservas') || '[]'); }
function reservas_salvar(l) { localStorage.setItem('sp_reservas', JSON.stringify(l)); }
function reservas_add(d) { reservas_salvar([...reservas_listar(), { id: `r${Date.now()}`, ...d }]); }
function reservas_remover(id) { reservas_salvar(reservas_listar().filter(r => r.id !== id)); }
function reservas_do_horario(horarioId) { return reservas_listar().filter(r => r.horarioId === horarioId); }

// === corrida ativa ===
function corrida_get() { return JSON.parse(localStorage.getItem('sp_corrida_ativa') || 'null'); }
function corrida_set(c) { localStorage.setItem('sp_corrida_ativa', JSON.stringify(c)); }
function corrida_clear() { localStorage.removeItem('sp_corrida_ativa'); }

// === FATURAMENTO ===
function fat_listar() { return JSON.parse(localStorage.getItem('sp_faturamento') || '[]'); }
function fat_salvar(l) { localStorage.setItem('sp_faturamento', JSON.stringify(l)); }
function fat_add(d) {
  // d pode icnluir: valor, descricao, formaPagamento, status
  fat_salvar([...fat_listar(), { id: `f${Date.now()}`, data: new Date().toISOString().slice(0, 10), status: 'pago', formaPagamento: 'pix', ...d }]);
}
function fat_update(id, dados) {
  fat_salvar(fat_listar().map(f => f.id === id ? { ...f, ...dados } : f));
}
function fat_hoje() {
  const hoje = new Date().toISOString().slice(0, 10);
  return fat_listar().filter(f => f.data === hoje && f.status !== 'pendente').reduce((s, f) => s + Number(f.valor), 0);
}
function fat_ontem() {
  const d = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return fat_listar().filter(f => f.data === d && f.status !== 'pendente').reduce((s, f) => s + Number(f.valor), 0);
}

// === histórico de corridas ===
function historico_listar() { return JSON.parse(localStorage.getItem('sp_historico') || '[]'); }
function historico_add(corrida) {
  localStorage.setItem('sp_historico', JSON.stringify([
    ...historico_listar(),
    { ...corrida, encerradaEm: Date.now() },
  ]));
}

// === helpers ===
const hoje = new Date().toISOString().slice(0, 10);
function dataLabel(data) {
  if (data === hoje) return 'Hoje';
  const d = new Date(data + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}
function somarDias(data, n) {
  const d = new Date(data + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// === agenda fixa ===
const PISTAS = [
  { id: 'pista1', nome: 'Pista 1', capacidade: 15, metros: 550,  categoria: 'junior' },
  { id: 'pista2', nome: 'Pista 2', capacidade: 20, metros: 800,  categoria: 'open'   },
  { id: 'pista3', nome: 'Pista 3', capacidade: 30, metros: 1200, categoria: 'open'   },
];
const HORARIOS_SEMANA = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
const HORARIOS_FDS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

function getHorariosDia(data) {
  const dia = new Date(data + 'T12:00:00').getDay();
  return (dia === 5 || dia === 6) ? HORARIOS_FDS : HORARIOS_SEMANA;
}
function reservas_do_slot(data, hora, pistaId) {
  return reservas_listar().filter(r => r.data === data && r.hora === hora && r.pistaId === pistaId);
}

const NAV_ITEMS = [
  { id: 'painel', label: 'Painel', icon: 'dashboard' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar_month' },
  { id: 'clientes', label: 'Clientes', icon: 'group' },
  { id: 'classificacao', label: 'Classificação', icon: 'leaderboard' },
  { id: 'frota', label: 'Frota', icon: 'directions_car' },
  { id: 'financeiro', label: 'Financeiro', icon: 'payments' },
];

// === sidebar ===
function Sidebar({ activeTab, onTabChange, isOpen, onClose }) {
  return (
    <>
      {/* overlay mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 z-40 flex flex-col border-r border-outline-variant/20 bg-surface-container-low transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ width: '224px', minHeight: '100vh' }}>

        {/* botão fechar (mobile) */}
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface lg:hidden"
          onClick={onClose}>
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        <a href="index.html" className="flex items-center gap-3 border-b border-outline-variant/20 px-5 py-5">
          <img src="src/assets/images/LogoSpeedPark.png" alt="Speed Park" className="h-9 w-9 rounded object-cover" />
          <div className="flex flex-col">
            <span className="font-black italic leading-none tracking-tight text-primary"
              style={{ fontFamily: 'Anybody,sans-serif', fontSize: '14px' }}>SPEED PARK</span>
            <span className="mt-0.5 text-secondary"
              style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>
              Track Operations
            </span>
          </div>
        </a>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map(item => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => onTabChange(item.id)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${active
                  ? 'bg-primary-container text-white'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-outline-variant/20 p-2">
          <button onClick={() => window.open('https://wa.me/551836383050', '_blank')}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
            <span className="material-symbols-outlined text-xl">help</span>
            <span style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Suporte</span>
          </button>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// === topbar ===
function TopBar({ onMenuToggle }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [busca, setBusca] = useState('');

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-variant/20 bg-surface-container-low px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-3">
        {/* hambúrguer — visível só em mobile */}
        <button
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface lg:hidden"
          onClick={onMenuToggle}>
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <div className="relative max-w-sm flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-on-surface-variant">search</span>
          <input type="text" placeholder="Pesquisar corridas, pilotos ou karts..."
            value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full border border-outline-variant/20 bg-surface-container py-2 pl-9 pr-4 text-sm text-on-surface-variant placeholder-on-surface-variant/50 focus:border-primary/50 focus:outline-none transition-colors" />
        </div>
      </div>
      <div className="flex items-center gap-3 relative">
        <button onClick={() => setNotifOpen(v => !v)}
          className="flex h-8 w-8 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        {notifOpen && (
          <div className="absolute right-12 top-10 z-50 w-64 border border-outline-variant/30 bg-surface-container shadow-xl"
            onMouseLeave={() => setNotifOpen(false)}>
            <div className="border-b border-outline-variant/20 px-4 py-3">
              <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', color: 'var(--tw-text-opacity)' }}
                className="text-on-surface-variant uppercase">Notificações</p>
            </div>
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">notifications_off</span>
              <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>Nenhuma notificação nova</p>
            </div>
          </div>
        )}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container">
          <span className="material-symbols-outlined text-sm text-white">person</span>
        </div>
      </div>
    </header>
  );
}

// === modal briefing de segurança ===
function BriefingSegurancaModal({ onClose }) {
  const itens = [
    { icon: 'sports_motorsports', title: 'Equipamento Obrigatório', body: 'Todos os pilotos devem usar capacete, macacão e luvas fornecidos pelo kartódromo. Verifique tamanho e estado antes de cada sessão.' },
    { icon: 'speed', title: 'Limites de Velocidade', body: 'Karts Open: até 60 km/h. Karts Pro: até 110 km/h. Karts Junior: até 40 km/h. Respeite os limites da categoria.' },
    { icon: 'flag', title: 'Sinais de Bandeira', body: 'Verde: pista liberada. Amarela: perigo, reduza a velocidade. Vermelha: pare imediatamente. Xadrez: fim da sessão.' },
    { icon: 'health_and_safety', title: 'Regras de Segurança', body: 'Proibido contato intencional. Mantenha distância segura. Em caso de pane, acione a bandeira e aguarde o fiscal. Nunca abandone o kart na pista.' },
    { icon: 'emergency', title: 'Emergência', body: 'Em caso de acidente: permaneça no kart, acione a bandeira e aguarde os fiscais. Ramal interno: 0. Desfibrilador disponível na recepção.' },
  ];
  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto border border-outline-variant/20 bg-surface-container"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-5">
          <div>
            <p className="text-secondary" style={lbl}>SPEED PARK · OPERAÇÕES</p>
            <h3 className="font-bold italic text-on-surface mt-0.5" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '22px' }}>
              Briefing de Segurança
            </h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-5 p-6">
          {itens.map(item => (
            <div key={item.title} className="flex gap-4 items-start">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-secondary/30 bg-surface-container-low">
                <span className="material-symbols-outlined text-secondary text-xl">{item.icon}</span>
              </div>
              <div>
                <p className="font-bold text-on-surface mb-1" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>{item.title}</p>
                <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', lineHeight: '1.6' }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-outline-variant/20 px-6 py-4">
          <button onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-2 border border-secondary/40 py-2 text-secondary hover:bg-secondary/10 transition-colors"
            style={lbl}>
            <span className="material-symbols-outlined text-base">print</span>IMPRIMIR BRIEFING
          </button>
        </div>
      </div>
    </div>
  );
}

// === modal iniciar corrida ===
function IniciarCorridaModal({ onClose, onIniciada, pilotos: pilotsInicial }) {
  const [numero, setNumero] = useState('');
  const [duracao, setDuracao] = useState('10');
  const [pilotos, setPilotos] = useState(
    pilotsInicial && pilotsInicial.length > 0
      ? pilotsInicial
      : [{ kart: '', nome: '' }, { kart: '', nome: '' }]
  );
  const pilotosCadastrados = JSON.parse(localStorage.getItem('sp_pilotos') || '[]');
  const kartsCadastrados = JSON.parse(localStorage.getItem('sp_frota') || '[]');

  const addPiloto = () => setPilotos(p => [...p, { kart: '', nome: '' }]);
  const removePiloto = (i) => setPilotos(p => p.filter((_, idx) => idx !== i));
  const update = (i, campo, val) => setPilotos(p => p.map((item, idx) => idx === i ? { ...item, [campo]: val } : item));

  const iniciar = () => {
    const posicoes = pilotos.filter(p => p.nome.trim());
    if (!numero || !duracao || posicoes.length === 0) return;
    corrida_set({
      numero: Number(numero),
      iniciadaEm: Date.now(),
      duracaoSec: Number(duracao) * 60,
      posicoes: posicoes.map(p => ({ kart: p.kart || '?', nome: p.nome.trim() })),
    });
    onIniciada();
  };

  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-screen w-full max-w-md flex-col gap-4 overflow-y-auto border border-outline-variant/20 bg-surface-container p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '20px' }}>Iniciar Corrida</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant" style={lbl}>Nº DA CORRIDA</label>
            <input type="number" value={numero} onChange={e => setNumero(e.target.value)} placeholder="Ex: 43" className="modal-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant" style={lbl}>DURAÇÃO (MIN)</label>
            <input type="number" value={duracao} onChange={e => setDuracao(e.target.value)} placeholder="10" className="modal-input" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-on-surface-variant" style={lbl}>PILOTOS (ordem de largada)</label>
            <button onClick={addPiloto} className="text-secondary transition-colors hover:text-primary" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700' }}>+ Adicionar</button>
          </div>
          <datalist id="pilotos-cadastrados">
            {pilotosCadastrados.map(p => <option key={p.id} value={p.nome} />)}
          </datalist>
          <datalist id="karts-frota">
            {kartsCadastrados.map(k => <option key={k.id} value={String(k.numero)} />)}
          </datalist>
          {pilotos.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={p.kart} onChange={e => update(i, 'kart', e.target.value)}
                placeholder="Kart" list="karts-frota" className="modal-input" style={{ width: '64px', flexShrink: 0 }} />
              <input type="text" value={p.nome} onChange={e => update(i, 'nome', e.target.value)}
                placeholder="Nome do piloto" list="pilotos-cadastrados" className="modal-input flex-1" />
              {pilotos.length > 1 && (
                <button onClick={() => removePiloto(i)} className="text-error/60 transition-colors hover:text-error">
                  <span className="material-symbols-outlined text-base">remove_circle</span>
                </button>
              )}
            </div>
          ))}
        </div>
        <button onClick={iniciar}
          className="flex items-center justify-center gap-2 bg-primary-container py-3 text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
          <span className="material-symbols-outlined text-base">play_circle</span>INICIAR CORRIDA
        </button>
      </div>
    </div>
  );
}

// === modal encerrar corrida (registra melhor volta e penalidades) ===
function EncerrarCorridaModal({ corrida, onClose, onEncerrada }) {
  const [posicoes, setPosicoes] = useState(
    (corrida.posicoes || []).map(p => ({ ...p, melhorVolta: '', penalidades: '' }))
  );

  const update = (i, campo, val) =>
    setPosicoes(p => p.map((item, idx) => idx === i ? { ...item, [campo]: val } : item));

  const encerrar = () => {
    historico_add({ ...corrida, posicoes });
    corrida_clear();
    onEncerrada();
  };

  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-screen w-full max-w-lg flex-col gap-4 overflow-y-auto border border-outline-variant/20 bg-surface-container p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '20px' }}>Encerrar Corrida #{corrida.numero}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>
          Registre o resultado final. Melhor volta e penalidades aparecem no histórico do piloto.
        </p>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[2rem_1fr_7rem_9rem] gap-2">
            <span className="text-on-surface-variant" style={lbl}>#</span>
            <span className="text-on-surface-variant" style={lbl}>PILOTO</span>
            <span className="text-on-surface-variant" style={lbl}>MELHOR V.</span>
            <span className="text-on-surface-variant" style={lbl}>PENALIDADES</span>
          </div>
          {posicoes.map((p, i) => (
            <div key={i} className="grid grid-cols-[2rem_1fr_7rem_9rem] gap-2 items-center">
              <span className="text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>P{i + 1}</span>
              <span className="text-on-surface truncate" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>{p.nome}</span>
              <input type="text" value={p.melhorVolta} onChange={e => update(i, 'melhorVolta', e.target.value)}
                placeholder="Ex: 58.4" className="modal-input"
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }} />
              <input type="text" value={p.penalidades} onChange={e => update(i, 'penalidades', e.target.value)}
                placeholder="Ex: +5s" className="modal-input"
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={encerrar}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-container py-3 text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            <span className="material-symbols-outlined text-base">flag</span>SALVAR E ENCERRAR
          </button>
          <button onClick={onClose}
            className="border border-outline-variant/30 px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}

// === painel principal ===
function PainelPrincipal({ onTabChange }) {
  const [frota, setFrota] = useState(frota_listar);
  const [corrida, setCorrida] = useState(corrida_get);
  const [fatHojeVal, setFatHojeVal] = useState(fat_hoje);
  const [fatOntemVal, setFatOntemVal] = useState(fat_ontem);
  const [proximasHoje, setProximasHoje] = useState([]);
  const [showIniciar, setShowIniciar] = useState(false);
  const [showEncerrar, setShowEncerrar] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const reload = () => {
    setFrota(frota_listar());
    setCorrida(corrida_get());
    setFatHojeVal(fat_hoje());
    setFatOntemVal(fat_ontem());
    const hs = horarios_do_dia(hoje).map(h => ({
      ...h,
      vagasOcupadas: reservas_do_horario(h.id).length,
    }));
    setProximasHoje(hs);
  };

  useEffect(() => { reload(); }, []);

  const totalKarts = frota.length;
  const prontos = frota.filter(k => k.status === 'pronto').length;
  const stress = frota.filter(k => k.status === 'stress').length;
  const manutencao = frota.filter(k => k.status === 'manutencao').length;
  const kartsAtivos = prontos + stress;

  let tempoRestanteSec = 0;
  if (corrida) {
    const elapsed = Math.floor((Date.now() - corrida.iniciadaEm) / 1000);
    tempoRestanteSec = Math.max(0, corrida.duracaoSec - elapsed);
  }
  const min = String(Math.floor(tempoRestanteSec / 60)).padStart(2, '0');
  const sec = String(tempoRestanteSec % 60).padStart(2, '0');

  const racersNaPista = corrida ? (corrida.posicoes || []).length : 0;
  const ocupacao = totalKarts > 0 && corrida ? Math.min(100, Math.round((racersNaPista / totalKarts) * 100)) : 0;

  const fatDiff = fatOntemVal > 0 ? ((fatHojeVal - fatOntemVal) / fatOntemVal * 100).toFixed(1) : null;
  const fmtMoney = v => v >= 1000 ? `${(v / 1000).toFixed(1)}` : String(Math.round(v));

  const encerrarCorrida = () => setShowEncerrar(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '32px', lineHeight: '1.2' }}>Centro de Comando</h1>
          <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>
            Visão geral das operações ao vivo na Pista Principal do Speed Park.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <button onClick={() => setShowBriefing(true)}
            className="flex items-center gap-2 border border-secondary/40 px-4 py-2 text-secondary transition-colors hover:bg-secondary/10"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            <span className="material-symbols-outlined text-base">security</span>Briefing de Segurança
          </button>
          <button onClick={() => onTabChange('agenda')}
            className="flex items-center gap-2 bg-primary-container px-4 py-2 text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            <span className="material-symbols-outlined text-base">add</span>NOVA RESERVA
          </button>
        </div>
      </div>

      {/* cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* ocupação */}
        <div className="flex flex-col gap-3 border border-outline-variant/20 bg-surface-container p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>OCUPAÇÃO DA PISTA</span>
            <span className="material-symbols-outlined text-xl text-secondary">directions_car</span>
          </div>
          {totalKarts === 0 ? (
            <>
              <span className="font-black italic leading-none text-on-surface-variant" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '52px' }}>--</span>
              <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>
                Cadastre karts na aba <button onClick={() => onTabChange('frota')} className="text-secondary underline">Frota</button>
              </p>
            </>
          ) : (
            <>
              <div className="flex items-end gap-1">
                <span className="font-black italic leading-none text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '52px' }}>{ocupacao}</span>
                <span className="mb-1 text-2xl font-bold text-on-surface">%</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{kartsAtivos}/{totalKarts} Karts Ativos</span>
                {ocupacao >= 80 && <span className="border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-yellow-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>Próximo à Capacidade</span>}
              </div>
            </>
          )}
        </div>

        {/* frota */}
        <div className="flex flex-col gap-3 border border-outline-variant/20 bg-surface-container p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>FROTA ATIVA</span>
            <span className="material-symbols-outlined text-xl text-secondary">sports_motorsports</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="font-black italic leading-none text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '52px' }}>{kartsAtivos}</span>
            <span className="mb-1 text-xl font-bold text-on-surface-variant">/{totalKarts}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {prontos > 0 && <span className="border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-green-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>{prontos} Prontos</span>}
            {stress > 0 && <span className="border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 text-yellow-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>{stress} Atenção</span>}
            {manutencao > 0 && <span className="border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-red-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>{manutencao} Manutenção</span>}
            {totalKarts === 0 && <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>Nenhum kart cadastrado</span>}
          </div>
        </div>

        {/* faturamento */}
        <div className="flex flex-col gap-3 border border-outline-variant/20 bg-surface-container p-5">
          <div className="flex items-center justify-between">
            <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>FATURAMENTO (HOJE)</span>
            <span className="material-symbols-outlined text-xl text-secondary">payments</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="mb-1 text-lg font-bold text-on-surface-variant">R$</span>
            <span className="font-black italic leading-none text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '52px' }}>{fmtMoney(fatHojeVal)}</span>
            {fatHojeVal >= 1000 && <span className="mb-1 text-xl font-bold text-on-surface-variant">k</span>}
          </div>
          {fatDiff !== null ? (
            <div className={`flex items-center gap-1 ${Number(fatDiff) >= 0 ? 'text-green-400' : 'text-error'}`}>
              <span className="material-symbols-outlined text-sm">{Number(fatDiff) >= 0 ? 'trending_up' : 'trending_down'}</span>
              <span style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700' }}>{Number(fatDiff) >= 0 ? '+' : ''}{fatDiff}% vs ontem</span>
            </div>
          ) : (
            <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>
              {fatHojeVal === 0 ? 'Nenhum registro hoje' : 'Sem dados de ontem'}
            </p>
          )}
        </div>
      </div>

      {/* status + próximas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* status ao vivo */}
        <div className="flex flex-col border border-outline-variant/20 bg-surface-container lg:col-span-3">
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
            <div className="flex items-center gap-2">
              {corrida && <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container"></span>}
              <span className="font-bold italic uppercase text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '14px' }}>Status da Pista ao Vivo</span>
            </div>
            {corrida
              ? <span className="border border-primary/40 bg-primary-container/20 px-2 py-1 text-primary" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>CORRIDA {corrida.numero} EM ANDAMENTO</span>
              : <span className="border border-outline-variant/20 px-2 py-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>SEM CORRIDA ATIVA</span>
            }
          </div>
          {corrida ? (
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>LÍDER ATUAL</p>
                  <p className="mt-0.5 font-bold text-on-surface" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>
                    {corrida.posicoes[0] ? `#${corrida.posicoes[0].kart} - ${corrida.posicoes[0].nome}` : '--'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>TEMPO RESTANTE</p>
                  <p className="mt-0.5 text-primary" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '28px', fontWeight: '500', lineHeight: '1' }}>{min}:{sec}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {corrida.posicoes.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-container-high px-4 py-3">
                    <span className="w-6 text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>P{i + 1}</span>
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '11px' }}>{p.kart}</span>
                    <span className="flex-1 text-on-surface" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>{p.nome}</span>
                    {i === 0 && <span className="text-green-400" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }}>Líder</span>}
                  </div>
                ))}
              </div>
              <button onClick={encerrarCorrida}
                className="flex items-center justify-center gap-2 border border-error/40 py-2 text-error transition-colors hover:bg-error/10"
                style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>
                <span className="material-symbols-outlined text-base">stop_circle</span>ENCERRAR CORRIDA
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-10 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl">flag</span>
              <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Nenhuma corrida em andamento</p>
              <button onClick={() => setShowIniciar(true)}
                className="flex items-center gap-2 bg-primary-container px-5 py-2.5 text-white transition-opacity hover:opacity-90"
                style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
                <span className="material-symbols-outlined text-base">play_circle</span>INICIAR CORRIDA
              </button>
            </div>
          )}
        </div>

        {/* próximas corridas — lê da grade de horários */}
        <div className="flex flex-col border border-outline-variant/20 bg-surface-container lg:col-span-2">
          <div className="flex items-center justify-between border-b border-outline-variant/20 px-5 py-4">
            <span className="font-bold italic uppercase text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '14px' }}>Próximas Corridas</span>
            <button onClick={() => onTabChange('agenda')} className="text-secondary transition-colors hover:text-primary"
              style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700' }}>Ver Tudo</button>
          </div>
          {proximasHoje.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl">calendar_month</span>
              <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>Nenhum horário na grade de hoje</p>
              <button onClick={() => onTabChange('agenda')}
                className="border border-secondary/40 px-4 py-2 text-secondary transition-colors hover:bg-secondary/10"
                style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>
                + MONTAR GRADE
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="grid grid-cols-3 border-b border-outline-variant/20 px-5 py-2">
                  {['HORA', 'TIPO', 'VAGAS'].map(h => (
                    <span key={h} className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>{h}</span>
                  ))}
                </div>
                {proximasHoje.map(h => {
                  const cheio = h.vagasOcupadas >= Number(h.capacidade);
                  return (
                    <div key={h.id} className="grid grid-cols-3 items-center border-b border-outline-variant/10 px-5 py-4 last:border-0 transition-colors hover:bg-surface-container-high">
                      <span className="text-on-surface" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>{h.hora}</span>
                      <div>
                        <p className="text-on-surface" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>{h.tipo}</p>
                        {h.duracao && <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' }}>{h.duracao} MIN</p>}
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-on-surface" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>{h.vagasOcupadas}/{h.capacidade}</span>
                        <span className={`border px-1.5 py-0.5 ${cheio ? 'border-error/40 bg-error/10 text-error' : 'border-green-500/40 bg-green-500/10 text-green-400'}`}
                          style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>
                          {cheio ? 'FECHADO' : 'ABERTO'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-outline-variant/20 p-5">
                <button onClick={() => onTabChange('agenda')}
                  className="flex w-full items-center justify-center gap-2 border border-secondary/40 py-2.5 text-secondary transition-colors hover:bg-secondary/10"
                  style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>
                  <span className="material-symbols-outlined text-base">calendar_month</span>GERENCIAR AGENDA
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showIniciar && (
        <IniciarCorridaModal onClose={() => setShowIniciar(false)} onIniciada={() => { reload(); setShowIniciar(false); }} />
      )}
      {showEncerrar && corrida && (
        <EncerrarCorridaModal
          corrida={corrida}
          onClose={() => setShowEncerrar(false)}
          onEncerrada={() => { setShowEncerrar(false); reload(); }}
        />
      )}
      {showBriefing && <BriefingSegurancaModal onClose={() => setShowBriefing(false)} />}
    </div>
  );
}

// === agenda ===
function Agenda() {
  const [dataAtiva, setDataAtiva] = useState(hoje);
  const [slotAberto, setSlotAberto] = useState(null);
  const [formNome, setFormNome] = useState('');
  const [slotParaIniciar, setSlotParaIniciar] = useState(null);
  const [, forceUpdate] = useState(0);
  const pilotosCadastrados = JSON.parse(localStorage.getItem('sp_pilotos') || '[]');

  const reload = () => forceUpdate(x => x + 1);

  const horarios = getHorariosDia(dataAtiva);
  const diaObj = new Date(dataAtiva + 'T12:00:00');
  const ehFds = [5, 6].includes(diaObj.getDay());
  const diaNome = diaObj.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  const slotKey = (hora, pistaId) => `${hora}__${pistaId}`;
  const isAberto = (hora, pistaId) => slotAberto === slotKey(hora, pistaId);

  const toggleSlot = (hora, pistaId) => {
    setSlotAberto(s => s === slotKey(hora, pistaId) ? null : slotKey(hora, pistaId));
    setFormNome('');
  };

  const addPiloto = (hora, pistaId) => {
    if (!formNome.trim()) return;
    const pista = PISTAS.find(p => p.id === pistaId);
    if (reservas_do_slot(dataAtiva, hora, pistaId).length >= pista.capacidade) return;
    reservas_add({ data: dataAtiva, hora, pistaId, nome: formNome.trim() });
    setFormNome('');
    reload();
  };

  const removePiloto = (id) => { reservas_remover(id); reload(); };

  const totalPilotosDia = PISTAS.reduce((acc, p) =>
    acc + horarios.reduce((a2, h) => a2 + reservas_do_slot(dataAtiva, h, p.id).length, 0), 0);

  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '32px', lineHeight: '1.2' }}>Agenda</h1>
        <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>
          Disponibilidade das pistas por horário. Clique em uma célula para ver ou editar pilotos.
        </p>
      </div>

      {/* navegação de data */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => { setDataAtiva(d => somarDias(d, -1)); setSlotAberto(null); }}
          className="flex h-9 w-9 items-center justify-center border border-outline-variant/20 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <div className="flex items-center gap-2 border border-outline-variant/20 bg-surface-container px-4 py-2">
          <span className="material-symbols-outlined text-base text-secondary">calendar_today</span>
          <input type="date" value={dataAtiva} onChange={e => { setDataAtiva(e.target.value); setSlotAberto(null); }}
            className="bg-transparent text-on-surface focus:outline-none"
            style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }} />
          {dataAtiva === hoje && (
            <span className="border border-primary/40 bg-primary-container/20 px-2 py-0.5 text-primary"
              style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>HOJE</span>
          )}
        </div>
        <button onClick={() => { setDataAtiva(d => somarDias(d, 1)); setSlotAberto(null); }}
          className="flex h-9 w-9 items-center justify-center border border-outline-variant/20 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface">
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
        <button onClick={() => { setDataAtiva(hoje); setSlotAberto(null); }}
          className="border border-outline-variant/20 px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          style={lbl}>HOJE</button>
        {ehFds && (
          <span className="flex items-center gap-1 border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-secondary"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700' }}>
            <span className="material-symbols-outlined text-sm">nights_stay</span>
            FIM DE SEMANA — HORÁRIOS ESTENDIDOS
          </span>
        )}
      </div>

      {/* resumo do dia */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant capitalize"
        style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>
        <span>{diaNome}</span>
        <span>·</span>
        <span>{horarios.length} horários</span>
        <span>·</span>
        <span>{totalPilotosDia} piloto{totalPilotosDia !== 1 ? 's' : ''} agendado{totalPilotosDia !== 1 ? 's' : ''} hoje</span>
      </div>

      {/* header das pistas (desktop) */}
      <div className="hidden md:grid gap-3" style={{ gridTemplateColumns: '5rem 1fr 1fr 1fr' }}>
        <div />
        {PISTAS.map(pista => (
          <div key={pista.id} className="bg-surface-container border border-outline-variant/20 px-4 py-3 text-center">
            <p className="text-on-surface font-bold italic" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '15px' }}>{pista.nome}</p>
            <p className="text-on-surface-variant mt-0.5" style={lbl}>{pista.metros}m · CAP. {pista.capacidade}</p>
          </div>
        ))}
      </div>

      {/* grade */}
      <div className="flex flex-col gap-3">
        {horarios.map(hora => (
          <React.Fragment key={hora}>
            {/* linha da hora */}
            <div className="md:grid gap-3 flex flex-col" style={{ gridTemplateColumns: '5rem 1fr 1fr 1fr' }}>
              {/* hora */}
              <div className="hidden md:flex items-center justify-center">
                <span className="text-on-surface font-bold" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '16px' }}>{hora}</span>
              </div>
              {/* label hora mobile */}
              <div className="md:hidden flex items-center gap-2 border-b border-outline-variant/20 pb-2">
                <span className="text-on-surface font-bold" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '16px' }}>{hora}</span>
                {ehFds && hora >= '20:00' && (
                  <span className="border border-secondary/30 px-2 py-0.5 text-secondary" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>NOTURNO</span>
                )}
              </div>

              {/* células das pistas */}
              {PISTAS.map(pista => {
                const rs = reservas_do_slot(dataAtiva, hora, pista.id);
                const ocup = rs.length;
                const cap = pista.capacidade;
                const cheio = ocup >= cap;
                const pct = Math.round(ocup / cap * 100);
                const aberto = isAberto(hora, pista.id);
                const barColor = cheio ? 'bg-error' : pct > 70 ? 'bg-yellow-400' : 'bg-green-400';

                return (
                  <div key={pista.id}
                    className={`border bg-surface-container transition-all ${aberto ? 'border-primary' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}>
                    {/* cabeçalho mobile da pista */}
                    <p className="md:hidden px-4 pt-3 text-on-surface-variant" style={lbl}>{pista.nome} · {pista.metros}m</p>

                    {/* botão de célula */}
                    <button onClick={() => toggleSlot(hora, pista.id)} className="w-full text-left p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '14px' }}>{ocup}/{cap}</span>
                        <span className={`border px-2 py-0.5 ${cheio ? 'border-error/40 bg-error/10 text-error' : 'border-green-500/40 bg-green-500/10 text-green-400'}`}
                          style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>
                          {cheio ? 'LOTADA' : 'ABERTA'}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5">
                        <div className={`h-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>
                        {cheio ? 'Sem vagas' : `${cap - ocup} vaga${cap - ocup !== 1 ? 's' : ''} livre${cap - ocup !== 1 ? 's' : ''}`}
                      </span>
                    </button>

                    {/* painel expandido */}
                    {aberto && (
                      <div className="border-t border-outline-variant/20 p-4 flex flex-col gap-3 bg-surface-container-low">
                        {rs.length === 0 ? (
                          <p className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>
                            Nenhum piloto inscrito.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {rs.map((r, i) => (
                              <div key={r.id} className="flex items-center gap-2 bg-surface-container px-3 py-2">
                                <span className="text-on-surface-variant flex-shrink-0" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '11px' }}>{i + 1}.</span>
                                <span className="flex-1 text-on-surface truncate" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>{r.nome}</span>
                                {r.formaPagamento && (
                                  <span className="flex-shrink-0 border border-secondary/30 px-1.5 text-secondary"
                                    style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>
                                    {r.formaPagamento === 'pix' ? 'PIX' : r.formaPagamento === 'cartao_credito' ? 'CRÉD' : r.formaPagamento === 'cartao_debito' ? 'DÉB' : 'DIN'}
                                  </span>
                                )}
                                <button onClick={() => removePiloto(r.id)} className="flex-shrink-0 text-error/40 transition-colors hover:text-error">
                                  <span className="material-symbols-outlined text-base">close</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* adicionar piloto */}
                        {!cheio && (
                          <div className="flex items-center gap-2">
                            <datalist id="pilotos-agenda">
                              {pilotosCadastrados.map(p => <option key={p.id} value={p.nome} />)}
                            </datalist>
                            <input type="text" value={formNome}
                              onChange={e => setFormNome(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addPiloto(hora, pista.id)}
                              placeholder="Adicionar piloto…" list="pilotos-agenda" className="modal-input flex-1"
                              autoFocus />
                            <button onClick={() => addPiloto(hora, pista.id)}
                              className="flex items-center gap-1 bg-primary-container px-3 py-2 text-white transition-opacity hover:opacity-90 flex-shrink-0"
                              style={lbl}>
                              <span className="material-symbols-outlined text-sm">person_add</span>ADD
                            </button>
                          </div>
                        )}

                        {/* iniciar corrida */}
                        {rs.length > 0 && (
                          <button
                            onClick={() => setSlotParaIniciar({ pilotos: rs.map(r => ({ nome: r.nome, kart: '' })) })}
                            className="flex items-center justify-center gap-2 border border-primary/40 bg-primary-container/10 py-2 text-primary transition-colors hover:bg-primary-container/20"
                            style={lbl}>
                            <span className="material-symbols-outlined text-sm">play_circle</span>INICIAR CORRIDA
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>

      {slotParaIniciar && (
        <IniciarCorridaModal
          pilotos={slotParaIniciar.pilotos}
          onClose={() => setSlotParaIniciar(null)}
          onIniciada={() => setSlotParaIniciar(null)}
        />
      )}
    </div>
  );
}

// === frota ===
function Frota() {
  const [frota, setFrota] = useState(frota_listar);
  const [novoNum, setNovoNum] = useState('');
  const [erro, setErro] = useState('');
  const reload = () => setFrota(frota_listar());
  const addKart = () => {
    const num = Number(novoNum);
    if (!num || num < 1) { setErro('Número inválido'); return; }
    if (frota.some(k => k.numero === num)) { setErro(`Kart #${num} já existe`); return; }
    frota_add(num); setNovoNum(''); setErro(''); reload();
  };
  const statusCfg = {
    pronto: { label: 'Pronto', cls: 'text-green-400 border-green-500/40 bg-green-500/10' },
    atenção: { label: 'Atenção', cls: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
    manutencao: { label: 'Manutenção', cls: 'text-red-400 border-red-500/40 bg-red-500/10' },
  };
  const sorted = [...frota].sort((a, b) => a.numero - b.numero);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '32px', lineHeight: '1.2' }}>Frota</h1>
        <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Gerencie o status dos karts disponíveis na pista.</p>
      </div>
      <div className="border border-outline-variant/20 bg-surface-container p-5 flex flex-col gap-3">
        <p className="font-bold text-on-surface" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>Adicionar Kart</p>
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-1">
            <input type="number" value={novoNum} onChange={e => setNovoNum(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKart()} placeholder="Número do kart" className="modal-input" style={{ width: '160px' }} />
            {erro && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erro}</p>}
          </div>
          <button onClick={addKart} className="flex items-center gap-2 bg-primary-container px-4 py-2 text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            <span className="material-symbols-outlined text-base">add</span>ADICIONAR
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-outline-variant/20 bg-surface-container py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl">directions_car</span>
          <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Nenhum kart cadastrado ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {sorted.map(k => {
            const cfg = statusCfg[k.status] || statusCfg.pronto;
            return (
              <div key={k.id} className="flex flex-col gap-3 border border-outline-variant/20 bg-surface-container p-4">
                <div className="flex items-center justify-between">
                  <span className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '28px', lineHeight: '1' }}>#{k.numero}</span>
                  <button onClick={() => { frota_remover(k.id); reload(); }} className="text-error/40 transition-colors hover:text-error">
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
                <span className={`self-start border px-2 py-0.5 ${cfg.cls}`}
                  style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}>{cfg.label}</span>
                <div className="flex flex-col gap-1">
                  {Object.entries(statusCfg).map(([val, c]) => (
                    <button key={val} onClick={() => { frota_setStatus(k.id, val); reload(); }}
                      className={`px-2 py-1 text-left transition-colors ${k.status === val ? `border ${c.cls} font-bold` : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                      style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{c.label}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// === modal comprovante ===
function ModalComprovante({ registro, onClose }) {
  const formaPagLabel = { pix: 'PIX', cartao_credito: 'Cartão de Crédito', cartao_debito: 'Cartão de Débito', dinheiro: 'Dinheiro' };
  const statusLabel = { pago: 'PAGO', pendente: 'PENDENTE' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm border border-outline-variant/20 bg-surface-container p-8 flex flex-col gap-5"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '20px' }}>Comprovante</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
          {[
            ['ID', registro.id],
            ['DATA', new Date(registro.data + 'T12:00:00').toLocaleDateString('pt-BR')],
            ['DESCRIÇÃO', registro.descricao || '--'],
            ['PAGAMENTO', formaPagLabel[registro.formaPagamento] || registro.formaPagamento || '--'],
            ['STATUS', statusLabel[registro.status] || registro.status || '--'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>{k}</span>
              <span className="text-on-surface" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>{v}</span>
            </div>
          ))}
          <div className="flex justify-between items-end border-t border-outline-variant/20 pt-3">
            <span className="text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '16px', fontWeight: '800', fontStyle: 'italic' }}>TOTAL</span>
            <span className="text-green-400" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '28px', fontWeight: '800', fontStyle: 'italic' }}>
              R$ {Number(registro.valor).toFixed(2)}
            </span>
          </div>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center justify-center gap-2 border border-secondary/40 py-2 text-secondary hover:bg-secondary/10 transition-colors"
          style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
          <span className="material-symbols-outlined text-base">print</span>IMPRIMIR
        </button>
      </div>
    </div>
  );
}

// === financeiro ===
function Financeiro() {
  const [registros, setRegistros] = useState(fat_listar);
  const [showForm, setShowForm] = useState(false);
  const [comprovante, setComprovante] = useState(null);
  const [form, setForm] = useState({ valor: '', descricao: '', formaPagamento: 'pix', status: 'pago' });
  const reload = () => setRegistros(fat_listar());

  const salvar = () => {
    if (!form.valor || Number(form.valor) <= 0) return;
    fat_add({ valor: Number(form.valor), descricao: form.descricao, formaPagamento: form.formaPagamento, status: form.status });
    setForm({ valor: '', descricao: '', formaPagamento: 'pix', status: 'pago' });
    setShowForm(false);
    reload();
  };

  const totalHoje = registros.filter(f => f.data === hoje && f.status !== 'pendente').reduce((s, f) => s + Number(f.valor), 0);
  const totalGeral = registros.filter(f => f.status !== 'pendente').reduce((s, f) => s + Number(f.valor), 0);
  const totalPendente = registros.filter(f => f.status === 'pendente').reduce((s, f) => s + Number(f.valor), 0);
  const fmtMoney = v => v >= 1000 ? `${(v / 1000).toFixed(1)}` : v.toFixed(0);
  const sorted = [...registros].sort((a, b) => b.id.localeCompare(a.id));

  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };
  const formaPagLabel = { pix: 'PIX', cartao_credito: 'Crédito', cartao_debito: 'Débito', dinheiro: 'Dinheiro' };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '32px', lineHeight: '1.2' }}>Financeiro</h1>
          <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Registros de faturamento do kartódromo.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary-container px-4 py-2 text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
          <span className="material-symbols-outlined text-base">add</span>NOVO REGISTRO
        </button>
      </div>

      {/* cards de totais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'HOJE (RECEBIDO)', val: totalHoje, color: 'text-on-surface' },
          { label: 'TOTAL GERAL', val: totalGeral, color: 'text-on-surface' },
          { label: 'PENDENTE', val: totalPendente, color: 'text-yellow-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex flex-col gap-2 border border-outline-variant/20 bg-surface-container p-5">
            <span className="text-on-surface-variant" style={lbl}>{label}</span>
            <div className="flex items-end gap-1">
              <span className="mb-1 text-lg font-bold text-on-surface-variant">R$</span>
              <span className={`font-black italic leading-none ${color}`} style={{ fontFamily: 'Anybody,sans-serif', fontSize: '40px' }}>{fmtMoney(val)}</span>
              {val >= 1000 && <span className="mb-1 text-xl font-bold text-on-surface-variant">k</span>}
            </div>
          </div>
        ))}
      </div>

      {/* formulário */}
      {showForm && (
        <div className="border border-outline-variant/20 bg-surface-container p-5 flex flex-col gap-4">
          <p className="font-bold italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '16px' }}>Novo Registro</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1 sm:col-span-1">
              <label className="text-on-surface-variant" style={lbl}>VALOR (R$) *</label>
              <input type="number" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0.00" className="modal-input" />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-1">
              <label className="text-on-surface-variant" style={lbl}>FORMA DE PAGAMENTO</label>
              <select value={form.formaPagamento} onChange={e => setForm(f => ({ ...f, formaPagamento: e.target.value }))} className="modal-input">
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-1">
              <label className="text-on-surface-variant" style={lbl}>STATUS</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="modal-input">
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
              <label className="text-on-surface-variant" style={lbl}>DESCRIÇÃO</label>
              <input type="text" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Sessão avulsa" className="modal-input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={salvar} className="bg-primary-container px-4 py-2 text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>SALVAR</button>
            <button onClick={() => setShowForm(false)} className="border border-outline-variant/30 px-4 py-2 text-on-surface-variant transition-colors hover:bg-surface"
              style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* tabela */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-outline-variant/20 bg-surface-container py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl">receipt_long</span>
          <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Nenhum registro financeiro ainda</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-outline-variant/20 bg-surface-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high">
                {['Data', 'Descrição', 'Pagamento', 'Status', 'Valor', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-on-surface-variant whitespace-nowrap" style={lbl}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(f => (
                <tr key={f.id} className="border-b border-outline-variant/10 last:border-0 transition-colors hover:bg-surface-container-high">
                  <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }}>
                    {new Date(f.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 text-on-surface" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>{f.descricao || '--'}</td>
                  <td className="px-5 py-3 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px' }}>
                    {formaPagLabel[f.formaPagamento] || f.formaPagamento || '--'}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => {
                        const novoStatus = f.status === 'pago' ? 'pendente' : 'pago';
                        const update = { status: novoStatus };
                        if (novoStatus === 'pago') update.data = new Date().toISOString().slice(0, 10);
                        fat_update(f.id, update);
                        reload();
                      }}
                      className={`group border px-2 py-0.5 transition-colors cursor-pointer ${f.status === 'pendente' ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400' : 'border-green-500/40 bg-green-500/10 text-green-400 hover:bg-yellow-500/20 hover:border-yellow-500/40 hover:text-yellow-400'}`}
                      style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700' }}
                      title={f.status === 'pendente' ? 'Clique para marcar como PAGO' : 'Clique para marcar como PENDENTE'}>
                      <span className="group-hover:hidden">{f.status === 'pendente' ? 'PENDENTE' : 'PAGO'}</span>
                      <span className="hidden group-hover:inline">{f.status === 'pendente' ? '→ PAGO' : '→ PENDENTE'}</span>
                    </button>
                  </td>
                  <td className="px-5 py-3 text-green-400 whitespace-nowrap" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px', fontWeight: '600' }}>
                    R$ {Number(f.valor).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setComprovante(f)}
                        className="flex h-7 w-7 items-center justify-center border border-secondary/30 text-secondary transition-colors hover:bg-secondary/10"
                        title="Ver comprovante">
                        <span className="material-symbols-outlined text-sm">receipt</span>
                      </button>
                      <button onClick={() => { fat_salvar(fat_listar().filter(x => x.id !== f.id)); reload(); }}
                        className="flex h-7 w-7 items-center justify-center border border-error/30 text-error transition-colors hover:bg-error/10">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {comprovante && <ModalComprovante registro={comprovante} onClose={() => setComprovante(null)} />}
    </div>
  );
}

// === modal cadastrar piloto (pelo admin) ===
function ModalCadastrarPiloto({ onClose, onCadastrado }) {
  const VAZIO = { nome: '', cpf: '', email: '', telefone: '', nascimento: '', altura: '', peso: '', senha: '' };
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [gerarSenha, setGerarSenha] = useState(false);

  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };

  const formatCPF = v => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  const formatTel = v => v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');

  const set = field => e => { setForm(p => ({ ...p, [field]: e.target.value })); setErros(p => ({ ...p, [field]: '' })); };

  const gerarSenhaAleatoria = () => {
    const s = Math.random().toString(36).slice(2, 8).toUpperCase();
    setForm(p => ({ ...p, senha: s }));
    setGerarSenha(true);
    setSenhaVisivel(true);
  };

  const validar = () => {
    const e = {};
    if (!form.nome.trim() || form.nome.trim().split(' ').length < 2) e.nome = 'Informe nome e sobrenome';
    if (form.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido';
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido';
    if (!form.nascimento) e.nascimento = 'Informe a data de nascimento';
    if (!form.altura || form.altura < 100 || form.altura > 250) e.altura = 'Altura inválida (100–250 cm)';
    if (!form.peso || form.peso < 20 || form.peso > 200) e.peso = 'Peso inválido (20–200 kg)';
    if (!form.senha || form.senha.length < 6) e.senha = 'Mínimo 6 caracteres';
    return e;
  };

  const salvar = () => {
    const e = validar();
    if (Object.keys(e).length > 0) { setErros(e); return; }
    if (pilotos_email_existe(form.email)) { setErros({ email: 'Este e-mail já está cadastrado' }); return; }
    pilotos_cadastrar(form);
    onCadastrado(form.nome.split(' ')[0], gerarSenha ? form.senha : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-y-auto border border-outline-variant/20 bg-surface-container"
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-5">
          <div>
            <p className="text-secondary" style={lbl}>SPEED PARK · ATENDIMENTO</p>
            <h3 className="font-bold italic text-on-surface mt-0.5" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '22px' }}>
              Cadastrar Novo Piloto
            </h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* form */}
        <div className="flex flex-col gap-5 p-6">

          {/* nome */}
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant" style={lbl}>NOME COMPLETO *</label>
            <input type="text" value={form.nome} onChange={set('nome')} placeholder="Ex: Carlos Mendonça" className="modal-input" autoComplete="off" />
            {erros.nome && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.nome}</p>}
          </div>

          {/* cpf + nascimento */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant" style={lbl}>CPF *</label>
              <input type="text" value={form.cpf} inputMode="numeric" placeholder="000.000.000-00"
                onChange={e => { setForm(p => ({ ...p, cpf: formatCPF(e.target.value) })); setErros(p => ({ ...p, cpf: '' })); }}
                className="modal-input" />
              {erros.cpf && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.cpf}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant" style={lbl}>DATA DE NASCIMENTO *</label>
              <input type="date" value={form.nascimento} onChange={set('nascimento')} className="modal-input" style={{ colorScheme: 'dark' }} />
              {erros.nascimento && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.nascimento}</p>}
            </div>
          </div>

          {/* email + telefone */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant" style={lbl}>E-MAIL *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="piloto@email.com" className="modal-input" autoComplete="off" />
              {erros.email && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.email}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant" style={lbl}>TELEFONE *</label>
              <input type="tel" value={form.telefone} inputMode="numeric" placeholder="(00) 00000-0000"
                onChange={e => { setForm(p => ({ ...p, telefone: formatTel(e.target.value) })); setErros(p => ({ ...p, telefone: '' })); }}
                className="modal-input" />
              {erros.telefone && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.telefone}</p>}
            </div>
          </div>


          {/* altura + peso */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant" style={lbl}>ALTURA (cm) *</label>
              <input type="number" value={form.altura} onChange={set('altura')} placeholder="Ex: 175" min="100" max="250" inputMode="numeric" className="modal-input" />
              {erros.altura && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.altura}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant" style={lbl}>PESO (kg) *</label>
              <input type="number" value={form.peso} onChange={set('peso')} placeholder="Ex: 70" min="20" max="200" inputMode="numeric" className="modal-input" />
              {erros.peso && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.peso}</p>}
            </div>
          </div>

          {/* senha */}
          <div className="flex flex-col gap-2">
            <label className="text-on-surface-variant" style={lbl}>SENHA DE ACESSO *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type={senhaVisivel ? 'text' : 'password'} value={form.senha}
                  onChange={e => { setForm(p => ({ ...p, senha: e.target.value })); setErros(p => ({ ...p, senha: '' })); setGerarSenha(false); }}
                  placeholder="Mínimo 6 caracteres" className="modal-input w-full" style={{ paddingRight: '44px' }} autoComplete="new-password" />
                <button type="button" onClick={() => setSenhaVisivel(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">{senhaVisivel ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <button type="button" onClick={gerarSenhaAleatoria}
                className="flex-shrink-0 border border-secondary/40 px-3 py-2 text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-1"
                style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em' }}>
                <span className="material-symbols-outlined text-base">shuffle</span>
                GERAR
              </button>
            </div>
            {erros.senha && <p className="text-error" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>{erros.senha}</p>}
            {gerarSenha && (
              <div className="flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
                <span className="material-symbols-outlined text-yellow-400 text-base">warning</span>
                <p className="text-yellow-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>
                  Anote a senha gerada e entregue ao cliente: <strong>{form.senha}</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-outline-variant/20 px-6 py-4 flex gap-3">
          <button onClick={salvar}
            className="flex-1 flex items-center justify-center gap-2 bg-primary-container py-3 text-white transition-opacity hover:opacity-90"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            <span className="material-symbols-outlined text-base">person_add</span>CADASTRAR PILOTO
          </button>
          <button onClick={onClose}
            className="border border-outline-variant/30 px-5 py-3 text-on-surface-variant transition-colors hover:bg-surface"
            style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}

// === clientes ===
function Clientes() {
  const [pilotos, setPilotos] = useState(pilotos_listar);
  const [busca, setBusca] = useState('');
  const [pendDelete, setPendDelete] = useState(null);
  const [showCadastro, setShowCadastro] = useState(false);
  const [sucesso, setSucesso] = useState(null); // { nome, senha }

  const reload = () => setPilotos(pilotos_listar());

  const catLabel = { open: 'Open', junior: 'Junior' };
  const catColor = { open: 'border-secondary/40 text-secondary', junior: 'border-tertiary/40 text-tertiary' };
  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em' };

  const filtrados = pilotos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  const handleDelete = (id) => { pilotos_deletar(id); reload(); setPendDelete(null); };

  const handleCadastrado = (nome, senha) => {
    setShowCadastro(false);
    reload();
    setSucesso({ nome, senha });
  };

  const stats = [
    { label: 'Total', valor: pilotos.length, icon: 'group', color: 'text-on-surface' },
    { label: 'Open', valor: pilotos.filter(p => calcCategoria(p.nascimento) === 'open').length, icon: 'directions_car', color: 'text-secondary' },
    { label: 'Junior', valor: pilotos.filter(p => calcCategoria(p.nascimento) === 'junior').length, icon: 'child_care', color: 'text-tertiary' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '32px', lineHeight: '1.2' }}>Clientes</h1>
          <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Gerencie os pilotos cadastrados no sistema.</p>
        </div>
        <button onClick={() => { setShowCadastro(true); setSucesso(null); }}
          className="flex items-center gap-2 bg-primary-container px-4 py-2 text-white transition-opacity hover:opacity-90"
          style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em' }}>
          <span className="material-symbols-outlined text-base">person_add</span>CADASTRAR PILOTO
        </button>
      </div>

      {/* banner de sucesso após cadastro */}
      {sucesso && (
        <div className="flex items-start gap-3 border border-green-500/40 bg-green-500/10 px-5 py-4">
          <span className="material-symbols-outlined text-green-400 text-xl flex-shrink-0 mt-0.5">check_circle</span>
          <div>
            <p className="text-green-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px', fontWeight: '700' }}>
              Piloto <strong>{sucesso.nome}</strong> cadastrado com sucesso!
            </p>
            {sucesso.senha && (
              <p className="text-green-400/80 mt-1" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px' }}>
                Senha gerada: <strong style={{ fontFamily: 'JetBrains Mono,monospace' }}>{sucesso.senha}</strong> — entregue ao cliente antes de fechar esta tela.
              </p>
            )}
          </div>
          <button onClick={() => setSucesso(null)} className="ml-auto text-green-400/60 hover:text-green-400 transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="flex flex-col gap-2 border border-secondary/20 bg-surface-container p-5">
            <span className={`material-symbols-outlined text-xl ${s.color}`}>{s.icon}</span>
            <div className={`font-black italic leading-none ${s.color}`} style={{ fontFamily: 'Anybody,sans-serif', fontSize: '40px' }}>{s.valor}</div>
            <div className="text-on-surface-variant" style={lbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* tabela */}
      <div className="border border-secondary/20 bg-surface-container">
        <div className="flex flex-col gap-4 border-b border-outline-variant/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 font-bold italic uppercase text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '14px' }}>
            <span className="material-symbols-outlined text-base text-secondary">manage_accounts</span>
            Pilotos Cadastrados
          </h2>
          <input type="text" className="modal-input" style={{ maxWidth: '280px' }}
            placeholder="Buscar nome ou e-mail…" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>

        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">person_off</span>
            <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '16px' }}>
              {busca ? 'Nenhum resultado' : 'Nenhum piloto cadastrado ainda'}
            </p>
            {!busca && (
              <button onClick={() => setShowCadastro(true)}
                className="mt-2 flex items-center gap-2 border border-secondary/40 px-4 py-2 text-secondary hover:bg-secondary/10 transition-colors"
                style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>
                <span className="material-symbols-outlined text-base">person_add</span>CADASTRAR PRIMEIRO PILOTO
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-high">
                  {['Nome', 'E-mail', 'Categoria', 'Altura', 'Peso', 'Cadastro', ''].map(h => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-on-surface-variant" style={lbl}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id} className="border-b border-outline-variant/10 last:border-0 transition-colors hover:bg-surface-container-high group">
                    <td className="px-5 py-4">
                      <div className="text-on-surface" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>{p.nome}</div>
                      <div className="text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }}>{p.telefone}</div>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>{p.email}</td>
                    <td className="px-5 py-4">
                      <span className={`border px-2 py-0.5 ${catColor[calcCategoria(p.nascimento)] || 'border-secondary/40 text-secondary'}`} style={lbl}>
                        {catLabel[calcCategoria(p.nascimento)]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }}>{p.altura ? `${p.altura}cm` : '--'}</td>
                    <td className="px-5 py-4 text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '12px' }}>{p.peso ? `${p.peso}kg` : '--'}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '11px' }}>
                      {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '--'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {pendDelete === p.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDelete(p.id)}
                            className="border border-error/40 px-2 py-1 text-error transition-colors hover:bg-error/10" style={lbl}>CONFIRMAR</button>
                          <button onClick={() => setPendDelete(null)}
                            className="border border-outline-variant/30 px-2 py-1 text-on-surface-variant transition-colors hover:bg-surface" style={lbl}>CANCELAR</button>
                        </div>
                      ) : (
                        <button onClick={() => setPendDelete(p.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex h-8 w-8 items-center justify-center border border-error/30 text-error hover:bg-error/10">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCadastro && (
        <ModalCadastrarPiloto onClose={() => setShowCadastro(false)} onCadastrado={handleCadastrado} />
      )}
    </div>
  );
}

// === classificação ===
const PONTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const medalhas = ['text-yellow-400', 'text-zinc-400', 'text-amber-600'];

function Classificacao() {
  const historico = historico_listar();
  const [filtro, setFiltro] = useState('geral');

  const mapa = {};
  historico.forEach(corrida => {
    (corrida.posicoes || []).forEach((p, i) => {
      const key = p.nome.trim().toLowerCase();
      if (!mapa[key]) mapa[key] = { nome: p.nome.trim(), corridas: 0, pontos: 0, vitorias: 0, melhorVolta: null };
      mapa[key].corridas++;
      mapa[key].pontos += PONTOS_F1[i] || 0;
      if (i === 0) mapa[key].vitorias++;
      if (p.melhorVolta) {
        const v = parseFloat(p.melhorVolta);
        if (!isNaN(v) && (mapa[key].melhorVolta === null || v < mapa[key].melhorVolta)) {
          mapa[key].melhorVolta = v;
        }
      }
    });
  });

  const ranking = Object.values(mapa)
    .sort((a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias)
    .map((p, i) => ({ ...p, pos: i + 1 }));

  const lbl = { fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-black italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '32px', lineHeight: '1.2' }}>Classificação</h1>
        <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>
          Ranking gerado automaticamente a partir do histórico de corridas.
        </p>
      </div>

      {ranking.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-outline-variant/20 bg-surface-container py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl">leaderboard</span>
          <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>Nenhuma corrida encerrada ainda</p>
          <p style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '12px', opacity: 0.6 }}>
            Inicie e encerre corridas pelo Painel para gerar o ranking.
          </p>
        </div>
      ) : (
        <div className="border border-outline-variant/20 bg-surface-container overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 bg-surface-container-high border-b border-outline-variant/20">
            {['#', 'PILOTO', 'VITÓRIAS', 'MELHOR VOLTA', 'CORRIDAS', 'PTS'].map(h => (
              <span key={h} className="text-on-surface-variant" style={lbl}>{h}</span>
            ))}
          </div>
          {ranking.map((p, i) => (
            <div key={p.nome}
              className={`grid grid-cols-[3rem_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-outline-variant/10 last:border-0 transition-colors hover:bg-surface-container-high ${i === 0 ? 'bg-primary-container/5' : ''}`}>
              <div className="flex items-center">
                {i < 3
                  ? <span className={`material-symbols-outlined text-xl ${medalhas[i]}`}>emoji_events</span>
                  : <span className="text-on-surface-variant" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>{p.pos}</span>
                }
              </div>
              <span className={`${i === 0 ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}
                style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '14px' }}>{p.nome}</span>
              <span className="text-on-surface-variant text-right" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>{p.vitorias}</span>
              <span className="text-secondary text-right" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>
                {p.melhorVolta !== null ? `${p.melhorVolta.toFixed(1)}s` : '--'}
              </span>
              <span className="text-on-surface-variant text-right" style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '13px' }}>{p.corridas}</span>
              <span className={`text-right font-bold ${i === 0 ? 'text-primary' : 'text-on-surface-variant'}`}
                style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '14px' }}>{p.pontos}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// === app ===
function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState('painel');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'painel': return <PainelPrincipal onTabChange={handleTabChange} />;
      case 'agenda': return <Agenda />;
      case 'clientes': return <Clientes />;
      case 'frota': return <Frota />;
      case 'financeiro': return <Financeiro />;
      case 'classificacao': return <Classificacao />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col lg:ml-56">
        <TopBar onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

// --- error boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Speed Park] Erro capturado:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const s = {
      page: { minHeight: '100vh', background: '#051424', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Hanken Grotesk, sans-serif' },
      card: { maxWidth: '480px', width: '100%', border: '1px solid rgba(170,136,140,0.2)', background: '#122131', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
      tag: { color: '#d91e5b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', margin: 0 },
      title: { fontFamily: 'Anybody, sans-serif', fontSize: '28px', fontWeight: '800', fontStyle: 'italic', color: '#d4e4fa', lineHeight: '1.2', margin: 0 },
      desc: { fontSize: '14px', color: '#e3bdc2', lineHeight: '1.6', margin: 0 },
      pre: { marginTop: '0.75rem', fontSize: '11px', color: '#ffb4ab', background: '#010f1f', padding: '0.75rem', overflowX: 'auto', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
      summary: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#aa888c', cursor: 'pointer', userSelect: 'none' },
      row: { display: 'flex', gap: '0.75rem' },
      btnPrimary: { flex: 1, background: '#d91e5b', color: '#fff', border: 'none', padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '0.1em' },
      btnSecondary: { flex: 1, background: 'transparent', color: '#9bccf6', border: '1px solid rgba(155,204,246,0.3)', padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '0.1em' },
    };
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={s.tag}>ERRO INESPERADO</p>
            <h1 style={s.title}>Algo deu errado</h1>
            <p style={s.desc}>Ocorreu um erro inesperado no painel administrativo.</p>
          </div>
          {this.state.error && (
            <details>
              <summary style={s.summary}>DETALHES DO ERRO</summary>
              <pre style={s.pre}>{this.state.error.toString()}</pre>
            </details>
          )}
          <div style={s.row}>
            <button style={s.btnPrimary} onClick={() => window.location.reload()}>RECARREGAR</button>
            <button style={s.btnSecondary} onClick={() => { window.location.href = 'index.html'; }}>IR PARA O INÍCIO</button>
          </div>
        </div>
      </div>
    );
  }
}

// --- mount ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <DashboardAdmin />
    </ErrorBoundary>
  </React.StrictMode>
);
