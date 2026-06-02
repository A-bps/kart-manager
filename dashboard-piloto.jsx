const { useState, useEffect } = React;

// --- auth ---
function auth_getSession() {
  try { return JSON.parse(sessionStorage.getItem('sp_usuario') || 'null'); } catch { return null; }
}
function auth_clearSession() { sessionStorage.removeItem('sp_usuario'); }
function auth_updateSession(u) { sessionStorage.setItem('sp_usuario', JSON.stringify(u)); }

const usuario = auth_getSession();
if (!usuario || usuario.role !== 'piloto') { window.location.replace('index.html'); }

const HOJE = new Date().toISOString().split('T')[0];

// --- data access (substituir por chamadas api no futuro) ---
function pilotos_listar() { return JSON.parse(localStorage.getItem('sp_pilotos') || '[]'); }
function pilotos_salvar(lista) { localStorage.setItem('sp_pilotos', JSON.stringify(lista)); }
function pilotos_atualizar(id, dados) {
  const lista = pilotos_listar().map(p => p.id === id ? { ...p, ...dados } : p);
  pilotos_salvar(lista);
  auth_updateSession({ ...auth_getSession(), ...dados });
}

// === agenda fixa ===
const PISTAS = [
  { id: 'pista1', nome: 'Pista 1', capacidade: 15, metros: 550,  precoPorMin: 6,  precoPorVolta: 4,  categoria: 'junior' },
  { id: 'pista2', nome: 'Pista 2', capacidade: 20, metros: 800,  precoPorMin: 8,  precoPorVolta: 6,  categoria: 'open'   },
  { id: 'pista3', nome: 'Pista 3', capacidade: 30, metros: 1200, precoPorMin: 10, precoPorVolta: 8,  categoria: 'open'   },
];

function calcCategoria(nascimento) {
  if (!nascimento) return 'open';
  const hoje = new Date();
  const nasc = new Date(nascimento + 'T12:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
  return idade <= 13 ? 'junior' : 'open';
}
const HORARIOS_SEMANA = ['08:00','10:00','12:00','14:00','16:00','18:00'];
const HORARIOS_FDS    = ['08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
const QTD_TEMPO  = [10, 15, 20, 30];
const QTD_VOLTAS = [5, 10, 15, 20];

function getHorariosDia(data) {
  const dia = new Date(data + 'T12:00:00').getDay();
  return (dia === 5 || dia === 6) ? HORARIOS_FDS : HORARIOS_SEMANA;
}
function reservas_do_slot(data, hora, pistaId) {
  return reservas_listar().filter(r => r.data === data && r.hora === hora && r.pistaId === pistaId);
}
function calcPreco(pista, formato, qtd) {
  if (!pista || !formato || !qtd) return 0;
  return formato === 'tempo' ? pista.precoPorMin * qtd : pista.precoPorVolta * qtd;
}

function reservas_listar() { return JSON.parse(localStorage.getItem('sp_reservas') || '[]'); }
function reservas_salvar(l) { localStorage.setItem('sp_reservas', JSON.stringify(l)); }
function reservas_add(d) {
  const nova = { id: `r${Date.now()}`, ...d };
  reservas_salvar([...reservas_listar(), nova]);
  return nova.id;
}
function reservas_remover(id) { reservas_salvar(reservas_listar().filter(r => r.id !== id)); }
function reservas_do_horario(horarioId) { return reservas_listar().filter(r => r.horarioId === horarioId); }
function reservas_do_piloto(pilotoId) { return reservas_listar().filter(r => r.pilotoId === pilotoId); }

function fat_registrar(d) {
  const lista = JSON.parse(localStorage.getItem('sp_faturamento') || '[]');
  lista.push({ id: `f${Date.now()}`, data: new Date().toISOString().slice(0, 10), status: 'pendente', formaPagamento: 'pix', ...d });
  localStorage.setItem('sp_faturamento', JSON.stringify(lista));
}

function historico_listar() { return JSON.parse(localStorage.getItem('sp_historico') || '[]'); }
function historico_do_piloto(nome) {
  return historico_listar()
    .filter(c => (c.posicoes || []).some(p => p.nome === nome))
    .sort((a, b) => b.encerradaEm - a.encerradaEm);
}

// --- filhos / dependentes ---
function filhos_listar(pilotoId) {
  return JSON.parse(localStorage.getItem(`sp_filhos_${pilotoId}`) || '[]');
}
function filhos_salvar(pilotoId, lista) {
  localStorage.setItem(`sp_filhos_${pilotoId}`, JSON.stringify(lista));
}
function filhos_add(pilotoId, filho) {
  filhos_salvar(pilotoId, [...filhos_listar(pilotoId), { id: `f${Date.now()}`, ...filho }]);
}
function filhos_remover(pilotoId, filhoId) {
  filhos_salvar(pilotoId, filhos_listar(pilotoId).filter(f => f.id !== filhoId));
}

// --- navbar ---
function DashboardNav({ activeTab, onTabChange }) {
  const catLabel = { open: 'OPEN', junior: 'JUNIOR' };
  const tabs = [
    { id: 'agendar',   label: 'Agendar',         icon: 'add_circle'  },
    { id: 'minhas',    label: 'Minhas Corridas',  icon: 'event'       },
    { id: 'historico', label: 'Histórico',        icon: 'history'     },
    { id: 'perfil',    label: 'Perfil',           icon: 'person'      },
  ];
  return (
    <nav className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/95 backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-margin-edge py-4 max-w-6xl mx-auto">
        <a href="index.html" className="flex items-center gap-4">
          <img src="src/assets/images/LogoSpeedPark.png" alt="Speed Park" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-headline-md text-headline-md font-black text-primary italic tracking-tighter" style={{ fontSize: '28px' }}>SPEED PARK</span>
        </a>
        <div className="hidden md:flex items-center gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => onTabChange(t.id)}
              className={`flex items-center gap-2 px-4 py-2 font-label-caps text-xs transition-colors border-b-2 ${activeTab === t.id ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-body-sm text-body-sm text-on-surface leading-tight">{usuario.nome}</span>
            <span className="font-label-caps text-xs tracking-wider text-primary">
              PILOTO · {catLabel[calcCategoria(usuario.nascimento)]}
            </span>
          </div>
          <button onClick={() => { auth_clearSession(); window.location.href = 'index.html'; }}
            className="flex items-center gap-2 font-label-caps text-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 hover:border-primary px-4 py-2">
            <span className="material-symbols-outlined text-base">logout</span>
            <span className="hidden sm:inline">SAIR</span>
          </button>
        </div>
      </div>
      {/* tabs mobile */}
      <div className="md:hidden flex border-t border-outline-variant/20">
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTabChange(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${activeTab === t.id ? 'text-primary' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-lg">{t.icon}</span>
            <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em' }}>{t.label.split(' ')[0].toUpperCase()}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// --- tela confirmação ---
const FORMA_PAG_LABEL = {
  pix:            'PIX',
  cartao_debito:  'Cartão de Débito',
  cartao_credito: 'Cartão de Crédito',
  dinheiro:       'Dinheiro',
};

function Confirmado({ dados, horario, onNovo }) {
  const { data, horarioHora, reservaId, formaPagamento, pista, formato, qtd } = dados;
  const dataFmt  = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const bookingId = `#SPK-${String(reservaId).slice(-4).toUpperCase()}`;
  const preco    = pista && formato && qtd ? `R$ ${calcPreco(pista, formato, qtd)}` : null;

  return (
    <div className="flex-1 flex items-center justify-center px-margin-edge py-16">
      <div className="bg-surface-container-high border border-primary/50 p-10 flex flex-col items-center text-center gap-6 w-full max-w-md"
        style={{ boxShadow: '4px 4px 0px 0px rgba(217,30,91,0.2)' }}>
        <div className="w-16 h-16 bg-primary flex items-center justify-center" style={{ transform: 'skewX(-10deg)' }}>
          <span className="material-symbols-outlined text-3xl text-on-primary" style={{ transform: 'skewX(10deg)', fontVariationSettings: "'FILL' 1" }}>check</span>
        </div>
        <div>
          <p className="font-label-caps text-label-caps text-secondary tracking-widest mb-2 animate-pulse">INSCRIÇÃO CONFIRMADA</p>
          <h2 className="font-headline-md text-headline-md text-on-surface uppercase">Nos vemos na pista!</h2>
        </div>
        <div className="w-full flex flex-col gap-3 border-t border-outline-variant/30 pt-4">
          {[
            ['PILOTO',    dados.pilotoNome],
            ['PISTA',     pista ? `${pista.nome} · ${pista.metros}m` : '--'],
            ['DATA',      dataFmt],
            ['HORÁRIO',   horarioHora],
            ['FORMATO',   qtd ? `${qtd} ${formato === 'tempo' ? 'min' : 'voltas'}` : '--'],
            ['PAGAMENTO', FORMA_PAG_LABEL[formaPagamento] || '--'],
            ['ID',        bookingId],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center">
              <span className="font-label-caps text-label-caps text-on-surface-variant text-xs">{k}</span>
              <span className="font-label-data text-label-data text-on-surface text-sm">{v}</span>
            </div>
          ))}
          {preco && (
            <div className="flex justify-between items-end border-t border-outline-variant/30 pt-3 mt-1">
              <span className="font-headline-sm text-headline-sm text-on-surface">TOTAL</span>
              <span className="font-headline-lg text-headline-lg text-primary" style={{ fontSize: '32px' }}>{preco}</span>
            </div>
          )}
        </div>
        <button onClick={onNovo}
          className="w-full font-label-caps text-label-caps py-3 border border-secondary text-secondary hover:bg-secondary/10 transition-colors text-xs"
          style={{ transform: 'skewX(-10deg)' }}>
          <span style={{ display: 'inline-block', transform: 'skewX(10deg)' }}>FAZER OUTRO AGENDAMENTO</span>
        </button>
      </div>
    </div>
  );
}

// --- modal termos de responsabilidade ---
function ModalTermos({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto border border-outline-variant/20 bg-surface-container"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-6 py-5">
          <div>
            <p className="font-label-caps text-label-caps text-secondary mb-1 tracking-widest">SPEED PARK</p>
            <h3 className="font-headline-md text-headline-md text-on-surface italic uppercase leading-tight">
              Termo de Responsabilidade
            </h3>
          </div>
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary-container hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="flex flex-col gap-5 p-6 font-body-md text-body-md text-on-surface-variant leading-relaxed" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '13px' }}>
          <p>Ao participar das atividades do <strong className="text-on-surface">Speed Park Kartódromo</strong>, o piloto (ou seu responsável legal, nos casos de menores de 18 anos) declara estar ciente e de acordo com os seguintes termos:</p>
          <div>
            <p className="font-bold text-on-surface mb-1" style={{ fontSize: '13px' }}>1. Riscos da Atividade</p>
            <p>O karting é uma atividade motorizada que envolve riscos inerentes, incluindo colisões, tombamentos e contato com superfícies. O participante declara ciência desses riscos e assume plena responsabilidade por eventuais danos físicos decorrentes da prática.</p>
          </div>
          <div>
            <p className="font-bold text-on-surface mb-1" style={{ fontSize: '13px' }}>2. Uso de Equipamentos</p>
            <p>O uso de capacete, macacão e luvas é obrigatório durante toda a sessão. O Speed Park fornece os equipamentos, que deverão ser devolvidos em boas condições ao final da corrida.</p>
          </div>
          <div>
            <p className="font-bold text-on-surface mb-1" style={{ fontSize: '13px' }}>3. Condições de Saúde</p>
            <p>O participante declara estar em boas condições de saúde física e mental para praticar a atividade. Pessoas com problemas cardíacos, coluna, gravidez ou qualquer limitação médica devem consultar seu médico antes de participar.</p>
          </div>
          <div>
            <p className="font-bold text-on-surface mb-1" style={{ fontSize: '13px' }}>4. Regras de Conduta</p>
            <p>O participante compromete-se a respeitar as regras da pista, os fiscais de prova e demais pilotos. Comportamento agressivo ou desrespeito às instruções resultará em desqualificação imediata sem reembolso.</p>
          </div>
          <div>
            <p className="font-bold text-on-surface mb-1" style={{ fontSize: '13px' }}>5. Uso de Imagem</p>
            <p>O participante autoriza o Speed Park a utilizar imagens e vídeos captados durante as sessões para fins de divulgação nas redes sociais e materiais de marketing, sem ônus para a empresa.</p>
          </div>
          <div>
            <p className="font-bold text-on-surface mb-1" style={{ fontSize: '13px' }}>6. Cancelamentos e Reembolsos</p>
            <p>Cancelamentos com antecedência mínima de 24 horas terão reembolso integral. Cancelamentos com menos de 24 horas ou no dia estão sujeitos a taxa de 50% do valor pago.</p>
          </div>
          <p className="text-xs text-on-surface-variant/60">Speed Park Kartódromo — CNPJ XX.XXX.XXX/XXXX-XX — Rodovia Marechal Rondon Km 524</p>
        </div>
        <div className="border-t border-outline-variant/20 px-6 py-4">
          <button onClick={onClose}
            className="w-full font-label-caps text-label-caps bg-primary-container text-white py-3 skew-x-m10 brutalist-button hover:bg-primary transition-colors">
            <span className="inline-block skew-x-10">LI E ENTENDI</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- tela agendar ---
const FORMAS_PAG = [
  { id: 'pix',           label: 'PIX',     icon: 'qr_code_2'    },
  { id: 'cartao_debito', label: 'Débito',  icon: 'credit_card'  },
  { id: 'cartao_credito',label: 'Crédito', icon: 'credit_score' },
  { id: 'dinheiro',      label: 'Dinheiro',icon: 'payments'     },
];

function Agendar({ onConfirmado, onTabChange }) {
  const [data, setData]               = useState('');
  const [slotSel, setSlotSel]         = useState(null); // { hora, pistaId, pista }
  const [formato, setFormato]         = useState('tempo');
  const [qtd, setQtd]                 = useState(null);
  const [termos, setTermos]           = useState(false);
  const [showTermos, setShowTermos]   = useState(false);
  const [pilotoNome, setPilotoNome]   = useState(usuario.nome);
  const [dependenteSel, setDependenteSel] = useState(null); // null = eu mesmo, objeto = dependente
  const [formaPagamento, setFormaPagamento] = useState('');
  const [, forceUpdate]               = useState(0);

  const filhos  = filhos_listar(usuario.id);
  const horarios = data ? getHorariosDia(data) : [];
  const qtdOpts  = formato === 'tempo' ? QTD_TEMPO : QTD_VOLTAS;
  const preco    = slotSel ? calcPreco(slotSel.pista, formato, qtd) : 0;
  const nascPiloto = dependenteSel ? dependenteSel.nascimento : usuario.nascimento;
  const pistasDisponiveis = PISTAS.filter(p => p.categoria === calcCategoria(nascPiloto));
  const pode     = data && slotSel && qtd && termos && pilotoNome.trim() && formaPagamento;

  const mudarFormato = (f) => { setFormato(f); setQtd(null); };
  const mudarData    = (d) => { setData(d); setSlotSel(null); setQtd(null); forceUpdate(x => x + 1); };

  const confirmar = () => {
    if (!pode) return;
    const id = reservas_add({
      data,
      hora:          slotSel.hora,
      pistaId:       slotSel.pistaId,
      nome:          pilotoNome.trim(),
      pilotoId:      usuario.id,
      formato,
      qtd,
      formaPagamento,
      criadaEm:      new Date().toISOString(),
    });
    const valor = calcPreco(slotSel.pista, formato, qtd);
    const descFormato = formato === 'tempo' ? `${qtd} min` : `${qtd} voltas`;
    fat_registrar({
      valor,
      descricao:     `Agendamento ${slotSel.pista?.nome || ''} — ${pilotoNome.trim()} (${descFormato}) — ${data}`,
      formaPagamento,
      reservaId:     id,
      data,
    });
    onConfirmado({
      data,
      horarioHora:   slotSel.hora,
      pilotoNome:    pilotoNome.trim(),
      reservaId:     id,
      formaPagamento,
      pista:         slotSel.pista,
      formato,
      qtd,
    }, null);
  };

  const inputClass = "w-full bg-surface-dim border-b-2 border-secondary focus:border-primary text-on-surface font-body-md py-3 px-4 transition-colors outline-none";
  const StepNum = ({ n }) => (
    <div className="bg-primary text-on-primary w-8 h-8 flex items-center justify-center font-label-caps text-label-caps flex-shrink-0"
      style={{ transform: 'skewX(-10deg)' }}>
      <span style={{ transform: 'skewX(10deg)' }}>{n}</span>
    </div>
  );

  let step = 1;

  return (
    <>
    <main className="flex-grow py-12 px-margin-edge w-full max-w-6xl mx-auto">
      <div className="mb-12 border-l-4 border-primary pl-4">
        <div className="font-label-caps text-label-caps text-secondary mb-2 tracking-widest uppercase animate-pulse">
          Olá, {usuario.nome.split(' ')[0]}! Vamos para o grid.
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Agendar sua sessão</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Escolha a data, pista e horário. O formato (tempo ou voltas) é sua escolha.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-8">

          {/* quem vai correr */}
          <section className="bg-surface-container-low border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <StepNum n={step++} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">Quem vai correr?</h2>
              </div>
              {onTabChange && (
                <button onClick={() => onTabChange('perfil')}
                  className="flex items-center gap-1 font-label-caps text-xs text-secondary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Gerenciar dependentes
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => { setPilotoNome(usuario.nome); setDependenteSel(null); }}
                className={`px-4 py-2 border font-label-caps text-xs transition-colors ${!dependenteSel ? 'bg-primary-container text-white border-primary-container' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary'}`}>
                Eu ({usuario.nome.split(' ')[0]})
              </button>
              {filhos.map(f => (
                <button key={f.id} onClick={() => { setPilotoNome(f.nome); setDependenteSel(f); }}
                  className={`px-4 py-2 border font-label-caps text-xs transition-colors ${dependenteSel?.id === f.id ? 'bg-primary-container text-white border-primary-container' : 'border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary'}`}>
                  {f.nome.split(' ')[0]} <span className="opacity-60">(dependente)</span>
                </button>
              ))}
              {filhos.length === 0 && (
                <p className="text-on-surface-variant font-body-sm text-body-sm text-sm">
                  Nenhum dependente cadastrado.{' '}
                  {onTabChange && (
                    <button onClick={() => onTabChange('perfil')}
                      className="text-secondary hover:text-primary transition-colors underline underline-offset-2">
                      Adicionar no perfil
                    </button>
                  )}
                </p>
              )}
            </div>
          </section>

          {/* data */}
          <section className="bg-surface-container-low border border-outline-variant/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <StepNum n={step++} />
              <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">Data</h2>
            </div>
            <input type="date" min={HOJE} value={data} onChange={e => mudarData(e.target.value)}
              style={{ colorScheme: 'dark' }} className={inputClass} />
            {data && (
              <p className="font-label-caps text-on-surface-variant text-xs mt-2 capitalize">
                {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                {[5,6].includes(new Date(data + 'T12:00:00').getDay()) && ' — horários estendidos até 22h'}
              </p>
            )}
          </section>

          {/* pista e horário */}
          {data && (
            <section className="bg-surface-container-low border border-outline-variant/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <StepNum n={step++} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">Pista & Horário</h2>
              </div>
              <div className="flex flex-col gap-5">
                {horarios.map(hora => (
                  <div key={hora}>
                    <p className="font-label-caps text-on-surface-variant text-xs mb-2"
                      style={{ fontFamily: 'JetBrains Mono,monospace' }}>{hora}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {pistasDisponiveis.map(pista => {
                        const rs      = reservas_do_slot(data, hora, pista.id);
                        const cheio   = rs.length >= pista.capacidade;
                        const passado = data === HOJE && hora <= new Date().toTimeString().slice(0, 5);
                        const bloq    = cheio || passado;
                        const sel     = slotSel?.hora === hora && slotSel?.pistaId === pista.id;
                        const pct     = Math.round(rs.length / pista.capacidade * 100);
                        return (
                          <button key={pista.id} disabled={bloq}
                            onClick={() => setSlotSel(sel ? null : { hora, pistaId: pista.id, pista })}
                            className={`p-4 border text-left transition-all flex flex-col gap-2 ${
                              bloq ? 'border-outline-variant/10 opacity-40 cursor-not-allowed bg-surface-dim'
                              : sel ? 'border-primary bg-primary/10'
                              : 'border-outline-variant/30 bg-surface-container-high hover:border-primary/50'
                            }`}>
                            <div className="flex items-center justify-between">
                              <span className={`font-label-caps text-xs font-bold ${sel ? 'text-primary' : 'text-on-surface'}`}>
                                {pista.nome}
                              </span>
                              {sel && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
                            </div>
                            <span className="font-label-caps text-on-surface-variant text-xs">{pista.metros}m</span>
                            <div className="w-full bg-surface-container h-1">
                              <div className={`h-full ${passado ? 'bg-outline-variant/40' : cheio ? 'bg-error' : pct > 70 ? 'bg-yellow-400' : 'bg-green-400'}`}
                                style={{ width: passado ? '100%' : `${pct}%` }} />
                            </div>
                            <span className={`font-label-caps text-xs ${passado ? 'text-on-surface-variant/50' : cheio ? 'text-error' : 'text-on-surface-variant'}`}>
                              {passado ? 'ENCERRADO' : cheio ? 'LOTADA' : `${pista.capacidade - rs.length} vagas`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* formato e quantidade */}
          {slotSel && (
            <section className="bg-surface-container-low border border-outline-variant/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <StepNum n={step++} />
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">Formato da Sessão</h2>
              </div>

              {/* toggle tempo/voltas */}
              <div className="flex mb-5 bg-surface-dim p-1 border border-outline-variant/30 w-fit">
                {[['tempo','Por Tempo'],['voltas','Por Voltas']].map(([f, label]) => (
                  <button key={f} onClick={() => mudarFormato(f)}
                    className={`px-5 py-2 font-label-caps text-xs transition-colors ${formato === f ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* opções de quantidade */}
              <div className="grid grid-cols-4 gap-2">
                {qtdOpts.map(op => (
                  <button key={op} onClick={() => setQtd(op)}
                    className={`py-3 border font-label-caps text-sm transition-all ${
                      qtd === op
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-on-surface'
                    }`}>
                    {op}{formato === 'tempo' ? ' min' : ' vol'}
                    {slotSel && (
                      <span className="block font-body-sm text-xs mt-0.5 opacity-70">
                        R$ {calcPreco(slotSel.pista, formato, op)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* dados do piloto */}
          <section className="bg-surface-container-low border border-outline-variant/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <StepNum n={step++} />
              <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">Dados do Piloto</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">NOME COMPLETO</label>
                <input type="text" readOnly value={pilotoNome} className={inputClass + ' cursor-default opacity-80'} />
              </div>
              {dependenteSel ? (
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">RESPONSÁVEL</label>
                  <input type="text" readOnly value={usuario.nome} className={inputClass + ' cursor-default opacity-80'} />
                  <p className="mt-1 text-on-surface-variant" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>
                    CPF do responsável: {usuario.cpf || '--'}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">CPF</label>
                  <input type="text" readOnly value={usuario.cpf || '--'} className={inputClass + ' cursor-default opacity-80'} />
                </div>
              )}
            </div>
          </section>

          {/* termos */}
          <section className="bg-surface-container-low border border-outline-variant/30 p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1 flex-shrink-0" onClick={() => setTermos(v => !v)}>
                <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${termos ? 'border-primary bg-primary' : 'border-secondary'}`}>
                  {termos && <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>check</span>}
                </div>
              </div>
              <div>
                <span className="font-body-md text-body-md text-on-surface block mb-1 group-hover:text-primary transition-colors">
                  Li e concordo com o Termo de Responsabilidade e Segurança do Speed Park.
                </span>
                <button type="button" onClick={() => setShowTermos(true)}
                  className="font-label-caps text-label-caps text-secondary hover:underline text-left">LER TERMO COMPLETO</button>
              </div>
            </label>
          </section>
        </div>

        {/* resumo */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-high border border-primary/50 p-6 sticky top-24"
            style={{ boxShadow: '4px 4px 0px 0px rgba(217,30,91,0.2)' }}>
            <div className="border-b-2 border-outline-variant/30 pb-4 mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase mb-1">Resumo</h2>
            </div>
            <div className="flex flex-col gap-3 mb-6">
              {[
                ['PILOTO',   pilotoNome.split(' ')[0]],
                ['DATA',     data ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR') : '--'],
                ['HORÁRIO',  slotSel?.hora || '--'],
                ['PISTA',    slotSel ? `${slotSel.pista.nome} (${slotSel.pista.metros}m)` : '--'],
                ['FORMATO',  qtd ? `${qtd} ${formato === 'tempo' ? 'min' : 'voltas'}` : '--'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">{k}</span>
                  <span className="font-label-data text-label-data text-on-surface text-right">{v}</span>
                </div>
              ))}
              {preco > 0 && (
                <div className="flex justify-between items-end border-t border-outline-variant/30 pt-3">
                  <span className="font-headline-sm text-headline-sm text-on-surface">TOTAL</span>
                  <span className="font-headline-lg text-headline-lg text-primary" style={{ fontSize: '40px' }}>
                    R$ {preco}
                  </span>
                </div>
              )}
            </div>

            {/* forma de pagamento */}
            <div className="mb-5 flex flex-col gap-2">
              <p className="font-label-caps text-label-caps text-on-surface-variant text-xs">FORMA DE PAGAMENTO</p>
              <div className="grid grid-cols-2 gap-2">
                {FORMAS_PAG.map(fp => (
                  <button key={fp.id} onClick={() => setFormaPagamento(fp.id)}
                    className={`flex items-center gap-2 border px-3 py-2 transition-all ${
                      formaPagamento === fp.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface'
                    }`}>
                    <span className="material-symbols-outlined text-base">{fp.icon}</span>
                    <span className="font-label-caps text-xs">{fp.label}</span>
                  </button>
                ))}
              </div>
              {!formaPagamento && (
                <p className="text-on-surface-variant/60" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>
                  Selecione uma forma de pagamento.
                </p>
              )}
            </div>

            {(() => {
              if (!slotSel) return null;
              const frota = JSON.parse(localStorage.getItem('sp_frota') || '[]');
              const ativos = frota.filter(k => k.status === 'pronto' || k.status === 'stress').length;
              const corridas = JSON.parse(localStorage.getItem('sp_corridas_ativas') || '[]');
              const emUso = corridas.reduce((s, c) => s + (c.posicoes || []).length, 0);
              const livres = Math.max(0, ativos - emUso);
              const noPistaHoje = reservas_do_slot(data, slotSel.hora, slotSel.pistaId).length + 1;
              if (ativos === 0) return (
                <div className="flex items-center gap-2 border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 mb-4">
                  <span className="material-symbols-outlined text-yellow-400 text-base">warning</span>
                  <p className="text-yellow-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>Nenhum kart cadastrado. Confirme disponibilidade com o kartódromo.</p>
                </div>
              );
              if (livres < noPistaHoje) return (
                <div className="flex items-center gap-2 border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 mb-4">
                  <span className="material-symbols-outlined text-yellow-400 text-base">warning</span>
                  <p className="text-yellow-400" style={{ fontFamily: 'Hanken Grotesk,sans-serif', fontSize: '11px' }}>Pode haver karts limitados neste horário. Chegue cedo para garantir o seu.</p>
                </div>
              );
              return null;
            })()}
            <button disabled={!pode} onClick={confirmar}
              className={`w-full font-headline-sm text-headline-sm py-4 relative overflow-hidden group transition-all ${
                pode ? 'bg-primary text-on-primary hover:opacity-90 cursor-pointer' : 'bg-surface-container text-on-surface-variant border border-outline-variant/30 cursor-not-allowed'
              }`}
              style={pode ? { transform: 'skewX(-10deg)' } : {}}>
              {pode && <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />}
              <span className="block tracking-tight relative" style={pode ? { transform: 'skewX(10deg)' } : {}}>
                {pode ? 'CONFIRMAR INSCRIÇÃO' : 'PREENCHA OS DADOS'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
    {showTermos && <ModalTermos onClose={() => setShowTermos(false)} />}
    </>
  );
}

// --- minhas corridas (agendamentos futuros com cancelamento) ---
function MinhasCorridas() {
  const [reservas, setReservas] = useState([]);
  const [pendCancel, setPendCancel] = useState(null);

  const reload = () => {
    const minhas = reservas_do_piloto(usuario.id);
    const horariosTodos = JSON.parse(localStorage.getItem('sp_horarios') || '[]');
    const enriquecidas = minhas
      .map(r => {
        // reserva feita pelo fluxo Agendar: tem data/hora/pistaId direot, sem horarioId
        if (!r.horarioId && r.data && r.hora) {
          const pista = PISTAS.find(p => p.id === r.pistaId);
          return {
            ...r,
            horario: {
              data: r.data,
              hora: r.hora,
              tipo: pista ? pista.nome : 'Sessão',
              duracao: r.formato === 'tempo' ? r.qtd : null,
              valor: pista && r.formato && r.qtd ? calcPreco(pista, r.formato, r.qtd) : null,
            },
          };
        }
        // reserva antiga: lookup pelo horarioId
        return { ...r, horario: horariosTodos.find(h => h.id === r.horarioId) || null };
      })
      .filter(r => r.horario && r.horario.data >= HOJE)
      .sort((a, b) => (a.horario.data + 'T' + a.horario.hora).localeCompare(b.horario.data + 'T' + b.horario.hora));
    setReservas(enriquecidas);
  };

  useEffect(() => { reload(); }, []);

  const cancelar = (id) => { reservas_remover(id); setPendCancel(null); reload(); };

  return (
    <main className="flex-grow py-12 px-margin-edge w-full max-w-6xl mx-auto">
      <div className="mb-8 border-l-4 border-primary pl-4">
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Minhas Corridas</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Agendamentos futuros. Você pode cancelar até o dia da corrida.
        </p>
      </div>

      {reservas.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-outline-variant/20 bg-surface-container py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl">event_busy</span>
          <p className="font-body-md text-body-md">Nenhuma corrida agendada</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reservas.map(r => {
            const h = r.horario;
            const dataFmt = new Date(h.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
            const ehHoje = h.data === HOJE;
            return (
              <div key={r.id} className="bg-surface-container border border-outline-variant/20 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-label-caps text-secondary tracking-wider text-xs">{ehHoje ? 'HOJE' : dataFmt}</span>
                    {ehHoje && <span className="border border-primary/40 bg-primary-container/10 text-primary px-2 py-0.5 font-bold" style={{ fontSize: '10px' }}>HOJE</span>}
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface">{h.hora} — {h.tipo}</p>
                  <p className="font-body-sm text-on-surface-variant mt-1">
                    {h.duracao ? `${h.duracao} min` : ''}
                    {h.valor && Number(h.valor) > 0 ? ` · R$ ${Number(h.valor).toFixed(2)}` : ''}
                  </p>
                  {r.nome !== usuario.nome && (
                    <p className="font-label-caps text-xs text-tertiary mt-2">Agendado para: {r.nome}</p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {pendCancel === r.id ? (
                    <>
                      <button onClick={() => cancelar(r.id)}
                        className="font-label-caps text-xs text-error border border-error/40 px-3 py-2 hover:bg-error/10 transition-colors">
                        CONFIRMAR CANCELAMENTO
                      </button>
                      <button onClick={() => setPendCancel(null)}
                        className="font-label-caps text-xs text-on-surface-variant border border-outline-variant/30 px-3 py-2 hover:bg-surface transition-colors">
                        VOLTAR
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setPendCancel(r.id)}
                      className="font-label-caps text-xs text-error border border-error/30 px-3 py-2 hover:bg-error/10 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">cancel</span>
                      CANCELAR
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// --- histórico de corridas ---
function Historico() {
  const corridas = historico_do_piloto(usuario.nome);
  const total = corridas.length;
  const vitorias = corridas.filter(c => (c.posicoes || [])[0]?.nome === usuario.nome).length;
  const melhorPos = corridas.length > 0
    ? Math.min(...corridas.map(c => (c.posicoes || []).findIndex(p => p.nome === usuario.nome) + 1).filter(p => p > 0))
    : null;

  return (
    <main className="flex-grow py-12 px-margin-edge w-full max-w-6xl mx-auto">
      <div className="mb-8 border-l-4 border-primary pl-4">
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Histórico de Corridas</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Resultados de todas as suas corridas registradas.</p>
      </div>

      {corridas.length > 0 && (
        <div className="grid grid-cols-3 gap-gutter mb-8">
          {[
            { icon: 'flag',         label: 'Corridas',    valor: total },
            { icon: 'emoji_events', label: 'Vitórias',    valor: vitorias },
            { icon: 'leaderboard',  label: 'Melhor Posição', valor: melhorPos ? `P${melhorPos}` : '--' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container border border-secondary/20 p-5 flex flex-col gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">{s.icon}</span>
              <div className="font-display-hero text-on-surface italic leading-none" style={{ fontSize: '36px', fontFamily: 'Anybody,sans-serif' }}>{s.valor}</div>
              <div className="font-label-caps text-on-surface-variant text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {corridas.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-outline-variant/20 bg-surface-container py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl">flag</span>
          <p className="font-body-md text-body-md">Nenhuma corrida registrada ainda</p>
          <p className="font-body-sm text-body-sm text-center max-w-xs">
            Após sua primeira sessão, o admin registra os resultados e eles aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {corridas.map((c, i) => {
            const posicoes = c.posicoes || [];
            const posIdx = posicoes.findIndex(p => p.nome === usuario.nome);
            const posObj = posicoes[posIdx];
            const lugar = posIdx + 1;
            const dataFmt = c.encerradaEm ? new Date(c.encerradaEm).toLocaleDateString('pt-BR') : '--';
            const medalColor = lugar === 1 ? 'text-yellow-400 border-yellow-500/40' : lugar === 2 ? 'text-zinc-400 border-zinc-500/40' : lugar === 3 ? 'text-amber-600 border-amber-600/40' : 'text-on-surface-variant border-outline-variant/20';

            return (
              <div key={i} className={`bg-surface-container border p-6 ${lugar === 1 ? 'border-yellow-500/30' : 'border-outline-variant/20'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 border-2 bg-surface-container-high ${medalColor}`}>
                    <span className="font-black italic leading-none" style={{ fontSize: '26px', fontFamily: 'Anybody,sans-serif' }}>P{lugar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="font-label-caps text-secondary text-xs">{dataFmt}</span>
                      <span className="font-label-caps text-on-surface-variant text-xs">· Corrida #{c.numero}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="font-label-caps text-on-surface-variant text-xs mb-0.5">POSIÇÃO</p>
                        <p className="font-label-data text-on-surface">{lugar}º lugar de {posicoes.length}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-on-surface-variant text-xs mb-0.5">KART</p>
                        <p className="font-label-data text-on-surface">#{posObj?.kart || '--'}</p>
                      </div>
                      {posObj?.melhorVolta && (
                        <div>
                          <p className="font-label-caps text-on-surface-variant text-xs mb-0.5">MELHOR VOLTA</p>
                          <p className="font-label-data text-secondary">{posObj.melhorVolta}s</p>
                        </div>
                      )}
                      {posObj?.penalidades && (
                        <div>
                          <p className="font-label-caps text-on-surface-variant text-xs mb-0.5">PENALIDADES</p>
                          <p className="font-label-data text-error">{posObj.penalidades}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// --- perfil (com edição e filhos) ---
function Perfil() {
  const [usuarioAtual, setUsuarioAtual] = useState(auth_getSession());
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: usuarioAtual?.nome || '',
    telefone: usuarioAtual?.telefone || '',
    altura: usuarioAtual?.altura || '',
    peso: usuarioAtual?.peso || '',
  });
  const [erros, setErros] = useState({});
  const [salvo, setSalvo] = useState(false);
  const [filhos, setFilhos] = useState(() => filhos_listar(usuario.id));
  const [showAddFilho, setShowAddFilho] = useState(false);
  const [formFilho, setFormFilho] = useState({ nome: '', nascimento: '', peso: '', altura: '' });
  const [pendDelFilho, setPendDelFilho] = useState(null);

  const reloadFilhos = () => setFilhos(filhos_listar(usuario.id));

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const salvar = () => {
    const e = {};
    if (!form.nome.trim() || form.nome.trim().split(' ').length < 2) e.nome = 'Informe nome e sobrenome';
    if (form.altura && (Number(form.altura) < 100 || Number(form.altura) > 250)) e.altura = 'Altura inválida (100–250 cm)';
    if (form.peso && (Number(form.peso) < 20 || Number(form.peso) > 200)) e.peso = 'Peso inválido (20–200 kg)';
    if (Object.keys(e).length > 0) { setErros(e); return; }
    pilotos_atualizar(usuario.id, form);
    Object.assign(usuario, form);
    setUsuarioAtual({ ...usuarioAtual, ...form });
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
    setErros({});
  };

  const salvarFilho = () => {
    if (!formFilho.nome.trim() || !formFilho.nascimento) return;
    filhos_add(usuario.id, formFilho);
    setFormFilho({ nome: '', nascimento: '', peso: '', altura: '' });
    setShowAddFilho(false);
    reloadFilhos();
  };

  const removerFilho = (id) => { filhos_remover(usuario.id, id); setPendDelFilho(null); reloadFilhos(); };

  const inputClass = "w-full bg-surface-container border border-outline-variant/30 text-on-surface py-3 px-4 focus:border-primary focus:outline-none transition-colors font-body-md text-body-md";
  const labelClass = "block font-label-caps text-label-caps text-on-surface-variant text-xs mb-2";

  const perfil = [
    { label: 'E-mail',     valor: usuarioAtual?.email, icon: 'mail' },
    { label: 'Telefone',   valor: usuarioAtual?.telefone, icon: 'phone' },
    { label: 'Nascimento', valor: usuarioAtual?.nascimento ? new Date(usuarioAtual.nascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '--', icon: 'cake' },
    { label: 'CPF',        valor: usuarioAtual?.cpf ? usuarioAtual.cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, '$1.***.***-$2') : '--', icon: 'badge' },
    { label: 'Altura',     valor: usuarioAtual?.altura ? `${usuarioAtual.altura} cm` : '--', icon: 'height' },
    { label: 'Peso',       valor: usuarioAtual?.peso ? `${usuarioAtual.peso} kg` : '--', icon: 'monitor_weight' },
  ];

  return (
    <main className="flex-grow py-12 px-margin-edge w-full max-w-6xl mx-auto flex flex-col gap-8">
      <div className="border-l-4 border-primary pl-4">
        <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">Meu Perfil</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">Seus dados pessoais e dependentes cadastrados.</p>
      </div>

      {salvo && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/40 px-4 py-3">
          <span className="material-symbols-outlined text-base text-green-400">check_circle</span>
          <span className="font-body-sm text-body-sm text-green-400">Dados atualizados com sucesso!</span>
        </div>
      )}

      {/* dados pessoais */}
      <div className="bg-surface-container border border-secondary/20 p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
          <h2 className="font-headline-sm text-headline-sm text-on-surface italic uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">person</span>
            Dados Pessoais
          </h2>
          <button onClick={() => { setEditando(v => !v); setErros({}); }}
            className="flex items-center gap-2 font-label-caps text-xs border px-4 py-2 transition-colors border-secondary/40 text-secondary hover:bg-secondary/10">
            <span className="material-symbols-outlined text-base">{editando ? 'close' : 'edit'}</span>
            {editando ? 'CANCELAR' : 'EDITAR'}
          </button>
        </div>

        {editando ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>NOME COMPLETO *</label>
                <input type="text" value={form.nome} onChange={set('nome')} className={inputClass} />
                {erros.nome && <p className="text-xs text-error mt-1">{erros.nome}</p>}
              </div>
              <div>
                <label className={labelClass}>TELEFONE</label>
                <input type="tel" value={form.telefone} onChange={set('telefone')} className={inputClass} placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className={labelClass}>ALTURA (cm)</label>
                <input type="number" value={form.altura} onChange={set('altura')} className={inputClass} min="100" max="250" />
                {erros.altura && <p className="text-xs text-error mt-1">{erros.altura}</p>}
              </div>
              <div>
                <label className={labelClass}>PESO (kg)</label>
                <input type="number" value={form.peso} onChange={set('peso')} className={inputClass} min="20" max="200" />
                {erros.peso && <p className="text-xs text-error mt-1">{erros.peso}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={salvar} className="font-label-caps text-xs bg-primary-container text-white px-6 py-3 hover:bg-primary transition-colors">
                SALVAR ALTERAÇÕES
              </button>
              <button onClick={() => { setEditando(false); setErros({}); setForm({ nome: usuarioAtual?.nome||'', telefone: usuarioAtual?.telefone||'', altura: usuarioAtual?.altura||'', peso: usuarioAtual?.peso||'' }); }}
                className="font-label-caps text-xs border border-outline-variant/30 text-on-surface-variant px-6 py-3 hover:bg-surface transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {perfil.map(item => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-8 h-8 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-secondary text-sm">{item.icon}</span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-0.5">{item.label}</div>
                  <div className="font-body-md text-body-md text-on-surface">{item.valor || '--'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* dependentes */}
      <div className="bg-surface-container border border-secondary/20 p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
          <h2 className="font-headline-sm text-headline-sm text-on-surface italic uppercase flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">child_care</span>
            Dependentes
          </h2>
          <button onClick={() => setShowAddFilho(v => !v)}
            className="flex items-center gap-2 font-label-caps text-xs border px-4 py-2 transition-colors bg-primary-container text-white hover:bg-primary">
            <span className="material-symbols-outlined text-base">{showAddFilho ? 'close' : 'person_add'}</span>
            {showAddFilho ? 'CANCELAR' : 'ADICIONAR'}
          </button>
        </div>

        {showAddFilho && (
          <div className="bg-surface-container-low border border-outline-variant/20 p-5 mb-6 flex flex-col gap-4">
            <p className="font-bold italic text-on-surface" style={{ fontFamily: 'Anybody,sans-serif', fontSize: '16px' }}>Novo Dependente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>NOME COMPLETO *</label>
                <input type="text" value={formFilho.nome} onChange={e => setFormFilho(f => ({ ...f, nome: e.target.value }))} className={inputClass} placeholder="Nome completo" />
              </div>
              <div>
                <label className={labelClass}>DATA DE NASCIMENTO *</label>
                <input type="date" value={formFilho.nascimento} onChange={e => setFormFilho(f => ({ ...f, nascimento: e.target.value }))} className={inputClass} style={{ colorScheme: 'dark' }} />
              </div>
              <div>
                <label className={labelClass}>ALTURA (cm)</label>
                <input type="number" value={formFilho.altura} onChange={e => setFormFilho(f => ({ ...f, altura: e.target.value }))} className={inputClass} placeholder="Ex: 130" />
              </div>
              <div>
                <label className={labelClass}>PESO (kg)</label>
                <input type="number" value={formFilho.peso} onChange={e => setFormFilho(f => ({ ...f, peso: e.target.value }))} className={inputClass} placeholder="Ex: 35" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={salvarFilho} className="font-label-caps text-xs bg-primary-container text-white px-5 py-2 hover:bg-primary transition-colors">SALVAR</button>
              <button onClick={() => setShowAddFilho(false)} className="font-label-caps text-xs border border-outline-variant/30 text-on-surface-variant px-5 py-2 hover:bg-surface transition-colors">CANCELAR</button>
            </div>
          </div>
        )}

        {filhos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">child_care</span>
            <p className="font-body-sm text-body-sm">Nenhum dependente cadastrado ainda.</p>
            <p className="font-body-sm text-body-sm text-center max-w-sm">
              Adicione dependentes (filhos, sobrinhos, etc.) para agendá-los sem criar uma conta separada.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filhos.map(f => (
              <div key={f.id} className="flex items-center justify-between border border-outline-variant/20 bg-surface-container-low px-5 py-4">
                <div>
                  <p className="font-body-md text-on-surface">{f.nome}</p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {f.nascimento && <span className="font-label-caps text-on-surface-variant text-xs">Nasc. {new Date(f.nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
                    {f.nascimento && <span className="font-label-caps text-secondary text-xs border border-secondary/30 px-2 py-0.5">{calcCategoria(f.nascimento).toUpperCase()}</span>}
                    {f.altura && <span className="font-label-caps text-on-surface-variant text-xs">{f.altura} cm</span>}
                    {f.peso && <span className="font-label-caps text-on-surface-variant text-xs">{f.peso} kg</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {pendDelFilho === f.id ? (
                    <>
                      <button onClick={() => removerFilho(f.id)} className="font-label-caps text-xs text-error border border-error/40 px-2 py-1 hover:bg-error/10 transition-colors">CONFIRMAR</button>
                      <button onClick={() => setPendDelFilho(null)} className="font-label-caps text-xs text-on-surface-variant border border-outline-variant/30 px-2 py-1 transition-colors">CANCELAR</button>
                    </>
                  ) : (
                    <button onClick={() => setPendDelFilho(f.id)} className="w-8 h-8 border border-error/30 text-error flex items-center justify-center hover:bg-error/10 transition-colors">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// --- app principal ---
function PilotoDashboard() {
  const [activeTab, setActiveTab] = useState('agendar');
  const [confirmadoDados, setConfirmadoDados] = useState(null);
  const [confirmadoHorario, setConfirmadoHorario] = useState(null);

  const handleConfirmado = (dados, horario) => {
    setConfirmadoDados(dados);
    setConfirmadoHorario(horario);
  };

  const mudarTab = (tab) => { setActiveTab(tab); setConfirmadoDados(null); };

  const renderContent = () => {
    if (activeTab === 'agendar' && confirmadoDados) {
      return <Confirmado dados={confirmadoDados} horario={confirmadoHorario} onNovo={() => setConfirmadoDados(null)} />;
    }
    switch (activeTab) {
      case 'agendar':   return <Agendar onConfirmado={handleConfirmado} onTabChange={mudarTab} />;
      case 'minhas':    return <MinhasCorridas />;
      case 'historico': return <Historico />;
      case 'perfil':    return <Perfil />;
      default: return null;
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <DashboardNav activeTab={activeTab} onTabChange={mudarTab} />
      {renderContent()}
    </div>
  );
}

// --- error boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[Speed Park] Erro capturado:', error, info); }
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
      <div style={s.page}><div style={s.card}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={s.tag}>ERRO INESPERADO</p>
          <h1 style={s.title}>Algo deu errado</h1>
          <p style={s.desc}>Ocorreu um erro inesperado no cockpit do piloto.</p>
        </div>
        {this.state.error && <details><summary style={s.summary}>DETALHES DO ERRO</summary><pre style={s.pre}>{this.state.error.toString()}</pre></details>}
        <div style={s.row}>
          <button style={s.btnPrimary} onClick={() => window.location.reload()}>RECARREGAR</button>
          <button style={s.btnSecondary} onClick={() => { window.location.href = 'index.html'; }}>IR PARA O INÍCIO</button>
        </div>
      </div></div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><ErrorBoundary><PilotoDashboard /></ErrorBoundary></React.StrictMode>);
