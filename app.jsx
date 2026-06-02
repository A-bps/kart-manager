// =========================================================
// app.jsx — Speed Park
// lóigca react do projeto unificada pra execução no navegador.
// =========================================================

const { useState, useEffect, useRef, useCallback } = React;

// --- custom hooks ---
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-up').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

// --- auth utilities ---
// credenciais temporárias — substituir por autenticação via api quando o backend estiver pronto
const ADMIN_USER = { email: 'admin@speedpark.com', senha: 'admin123', role: 'admin', nome: 'Administrador Speed Park' };

function auth_salvarPiloto(piloto) {
  const lista = JSON.parse(localStorage.getItem('sp_pilotos') || '[]');
  lista.push({ ...piloto, role: 'piloto', id: Date.now(), criadoEm: new Date().toISOString() });
  localStorage.setItem('sp_pilotos', JSON.stringify(lista));
}
function auth_emailExiste(email) {
  return JSON.parse(localStorage.getItem('sp_pilotos') || '[]').some(p => p.email === email);
}
function auth_listarPilotos() {
  return JSON.parse(localStorage.getItem('sp_pilotos') || '[]');
}
function auth_deletarPiloto(id) {
  localStorage.setItem('sp_pilotos', JSON.stringify(auth_listarPilotos().filter(p => p.id !== id)));
}
function auth_login(email, senha) {
  if (email === ADMIN_USER.email && senha === ADMIN_USER.senha) return ADMIN_USER;
  return auth_listarPilotos().find(p => p.email === email && p.senha === senha) || null;
}
function calcCategoria(nascimento) {
  if (!nascimento) return 'open';
  const hoje = new Date();
  const nasc = new Date(nascimento + 'T12:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
  return idade <= 13 ? 'junior' : 'open';
}
function auth_getSession() {
  try { return JSON.parse(sessionStorage.getItem('sp_usuario') || 'null'); } catch { return null; }
}
function auth_setSession(u) { sessionStorage.setItem('sp_usuario', JSON.stringify(u)); }
function auth_clearSession() { sessionStorage.removeItem('sp_usuario'); }

// --- componentes ---

// modal login
function ModalLogin({ onClose, onLogin, onOpenCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('modal-open');
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !senha) { setErro('Preencha todos os campos'); return; }
    const user = auth_login(email.trim(), senha);
    if (!user) { setErro('E-mail ou senha incorretos'); return; }
    onLogin(user);
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-outline-variant/20">
          <div>
            <p className="font-label-caps text-label-caps text-secondary tracking-widest mb-1">SPEED PARK</p>
            <h2 className="font-headline-md text-headline-md text-on-surface italic uppercase">Entrar</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary-container hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 modal-field-group">
          <div>
            <label className="modal-label">E-mail</label>
            <input type="email" className="modal-input" placeholder="piloto@email.com"
              value={email} onChange={e => { setEmail(e.target.value); setErro(''); }} autoComplete="email" />
          </div>
          <div>
            <label className="modal-label">Senha</label>
            <div className="relative">
              <input type={mostrarSenha ? 'text' : 'password'} className="modal-input" placeholder="Sua senha"
                value={senha} onChange={e => { setSenha(e.target.value); setErro(''); }}
                autoComplete="current-password" style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setMostrarSenha(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">{mostrarSenha ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          {erro && (
            <div className="flex items-center gap-2 bg-error-container/20 border border-error/30 px-4 py-3">
              <span className="material-symbols-outlined text-base text-error">error</span>
              <span className="font-body-sm text-body-sm text-error">{erro}</span>
            </div>
          )}
          <button type="submit" className="w-full font-label-caps text-label-caps bg-primary-container text-white py-4 skew-x-m10 brutalist-button hover:bg-primary transition-colors">
            <span className="inline-block skew-x-10">ENTRAR</span>
          </button>

          <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
            Não tem conta?{' '}
            <button type="button" onClick={() => { onClose(); onOpenCadastro(); }}
              className="text-secondary hover:text-primary transition-colors underline underline-offset-2">
              Cadastrar-se
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

// (DashboardNav, DashboardPiloto e DashboardAdmin ficam em dashboard-piloto.jsx / dashboard-admin.jsx)

// navbar do dashboard — mantida aqui apenas pra não quebrar referências antigas
function DashboardNav({ usuario, onLogout }) {
  const catLabel = { open: 'OPEN', junior: 'JUNIOR' };
  return (
    <nav className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/95 backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-margin-edge py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-4">
          <img src="src/assets/images/LogoSpeedPark.png" alt="Speed Park" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-headline-md text-headline-md font-black text-primary italic tracking-tighter">SPEED PARK</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-body-sm text-body-sm text-on-surface leading-tight">{usuario.nome}</span>
            <span className={`font-label-caps text-xs tracking-wider ${usuario.role === 'admin' ? 'text-secondary' : 'text-primary'}`}>
              {usuario.role === 'admin' ? 'ADMINISTRADOR' : `PILOTO · ${catLabel[calcCategoria(usuario.nascimento)] || ''}`}
            </span>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-2 font-label-caps text-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/30 hover:border-primary px-4 py-2">
            <span className="material-symbols-outlined text-base">logout</span>
            <span className="hidden sm:inline">SAIR</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// dashboard piloto
function DashboardPiloto({ usuario, onLogout }) {
  const catLabel = { open: 'Open', junior: 'Junior' };
  const catColor = { open: 'border-secondary text-secondary', junior: 'border-tertiary text-tertiary' };

  const stats = [
    { icon: 'flag', label: 'Corridas', valor: '0', sub: 'Nenhuma ainda' },
    { icon: 'timer', label: 'Melhor Volta', valor: '--:--', sub: 'Faça sua 1ª sessão' },
    { icon: 'emoji_events', label: 'Pontos', valor: '0', sub: 'Ranking ' + (catLabel[calcCategoria(usuario.nascimento)] || '') },
    { icon: 'leaderboard', label: 'Posição', valor: '--', sub: 'No ranking global' },
  ];

  const perfil = [
    { label: 'E-mail', valor: usuario.email, icon: 'mail' },
    { label: 'Telefone', valor: usuario.telefone, icon: 'phone' },
    { label: 'Nascimento', valor: usuario.nascimento ? new Date(usuario.nascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '--', icon: 'cake' },
    { label: 'CPF', valor: usuario.cpf ? usuario.cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, '$1.***.***-$2') : '--', icon: 'badge' },
    { label: 'Altura', valor: usuario.altura ? `${usuario.altura} cm` : '--', icon: 'height' },
    { label: 'Peso', valor: usuario.peso ? `${usuario.peso} kg` : '--', icon: 'monitor_weight' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav usuario={usuario} onLogout={onLogout} />

      {/* hero */}
      <section className="bg-surface-container-low border-b border-outline-variant/20 py-12 px-margin-edge relative overflow-hidden">
        <div className="absolute inset-0 checkered-pattern opacity-10" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-container/5 blur-3xl rounded-full" aria-hidden="true" />
        <div className="max-w-container-max mx-auto relative z-10">
          <p className="font-label-caps text-label-caps text-secondary tracking-widest mb-2">BEM-VINDO DE VOLTA</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface italic uppercase mb-4 leading-tight">
            {usuario.nome.split(' ')[0]}{' '}
            <span className="text-primary-container">{usuario.nome.split(' ').slice(1).join(' ')}</span>
          </h1>
          <span className={`font-label-caps text-label-caps text-xs px-3 py-1 border skew-x-m10 inline-block ${catColor[calcCategoria(usuario.nascimento)] || 'border-secondary text-secondary'}`}>
            <span className="inline-block skew-x-10">CATEGORIA {(catLabel[calcCategoria(usuario.nascimento)] || '').toUpperCase()}</span>
          </span>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-edge py-10 flex flex-col gap-8">

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-container border border-secondary/20 p-6 flex flex-col gap-3 hover:border-primary-container/50 transition-colors">
              <span className="material-symbols-outlined text-secondary text-2xl">{s.icon}</span>
              <div className="font-display-hero text-on-surface leading-none" style={{ fontSize: '38px' }}>{s.valor}</div>
              <div>
                <div className="font-label-caps text-label-caps text-on-surface text-xs">{s.label}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant text-xs mt-0.5">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* perfil */}
          <div className="lg:col-span-2 bg-surface-container border border-secondary/20 p-8">
            <h2 className="font-headline-sm text-headline-sm text-on-surface italic uppercase mb-6 pb-4 border-b border-outline-variant/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">person</span>
              Meu Perfil
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {perfil.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-secondary text-sm">{item.icon}</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant text-xs mb-0.5">{item.label}</div>
                    <div className="font-body-md text-body-md text-on-surface">{item.valor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ações */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container border border-secondary/20 p-6 flex flex-col gap-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface italic uppercase text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">bolt</span>
                Ações Rápidas
              </h3>
              <button onClick={() => window.location.href = 'dashboard-piloto.html'}
                className="w-full font-label-caps text-label-caps bg-primary-container text-white py-3 skew-x-m10 brutalist-button cta-pulse hover:bg-primary transition-colors text-xs">
                <span className="inline-block skew-x-10">RESERVAR SESSÃO</span>
              </button>
              <button onClick={() => window.location.href = 'index.html'}
                className="w-full font-label-caps text-label-caps bg-surface border border-secondary text-secondary py-3 skew-x-m10 hover:bg-secondary/10 transition-colors text-xs">
                <span className="inline-block skew-x-10">VOLTAR AO SITE</span>
              </button>
            </div>
            <div className="bg-surface-container border border-outline-variant/20 p-5">
              <p className="font-label-caps text-label-caps text-secondary text-xs mb-2">DICA DO PÓDIO</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-xs leading-relaxed">
                Complete sua primeira sessão para aparecer no ranking e desbloquear estatísticas de desempenho.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// dashboard admin
function DashboardAdmin({ usuario, onLogout }) {
  const [pilotos, setPilotos] = useState(() => auth_listarPilotos());
  const [busca, setBusca] = useState('');
  const [pendDelete, setPendDelete] = useState(null);

  const reload = () => setPilotos(auth_listarPilotos());

  const catLabel = { open: 'Open', junior: 'Junior' };
  const catColor = {
    open: 'border-secondary/40 text-secondary',
    junior: 'border-tertiary/40 text-tertiary',
  };

  const stats = [
    { label: 'Total', valor: pilotos.length, icon: 'group', color: 'text-on-surface' },
    { label: 'Open', valor: pilotos.filter(p => calcCategoria(p.nascimento) === 'open').length, icon: 'directions_car', color: 'text-secondary' },
    { label: 'Junior', valor: pilotos.filter(p => calcCategoria(p.nascimento) === 'junior').length, icon: 'child_care', color: 'text-tertiary' },
  ];

  const filtrados = pilotos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.email.toLowerCase().includes(busca.toLowerCase())
  );

  const handleDelete = (id) => { auth_deletarPiloto(id); reload(); setPendDelete(null); };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav usuario={usuario} onLogout={onLogout} />

      {/* hero */}
      <section className="bg-surface-container-low border-b border-outline-variant/20 py-10 px-margin-edge relative overflow-hidden">
        <div className="absolute inset-0 checkered-pattern opacity-10" aria-hidden="true" />
        <div className="max-w-container-max mx-auto relative z-10">
          <p className="font-label-caps text-label-caps text-secondary tracking-widest mb-2">SPEED PARK</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface italic uppercase">
            Painel <span className="text-primary-container">Administrativo</span>
          </h1>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-edge py-10 flex flex-col gap-8">

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-container border border-secondary/20 p-6 flex flex-col gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">{s.icon}</span>
              <div className={`font-display-hero leading-none ${s.color}`} style={{ fontSize: '44px' }}>{s.valor}</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* tabela */}
        <div className="bg-surface-container border border-secondary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-outline-variant/20">
            <h2 className="font-headline-sm text-headline-sm text-on-surface italic uppercase text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base">manage_accounts</span>
              Pilotos Cadastrados
            </h2>
            <input type="text" className="modal-input" style={{ maxWidth: '280px' }}
              placeholder="Buscar nome ou e-mail…" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>

          {filtrados.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl">person_off</span>
              <p className="font-body-md text-body-md">{busca ? 'Nenhum resultado' : 'Nenhum piloto cadastrado ainda'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/20">
                    {['Nome', 'E-mail', 'Categoria', 'Altura', 'Peso', 'Cadastro', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-label-caps text-label-caps text-on-surface-variant text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-high transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-body-sm text-body-sm text-on-surface">{p.nome}</div>
                        <div className="font-label-data text-label-data text-on-surface-variant text-xs">{p.telefone}</div>
                      </td>
                      <td className="px-5 py-4 font-body-sm text-body-sm text-on-surface-variant">{p.email}</td>
                      <td className="px-5 py-4">
                        <span className={`font-label-caps text-xs px-2 py-0.5 border ${catColor[calcCategoria(p.nascimento)] || 'border-secondary/40 text-secondary'}`}>
                          {catLabel[calcCategoria(p.nascimento)]}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-label-data text-label-data text-on-surface-variant text-sm">{p.altura ? `${p.altura}cm` : '--'}</td>
                      <td className="px-5 py-4 font-label-data text-label-data text-on-surface-variant text-sm">{p.peso ? `${p.peso}kg` : '--'}</td>
                      <td className="px-5 py-4 font-label-data text-label-data text-on-surface-variant text-xs whitespace-nowrap">
                        {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '--'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {pendDelete === p.id ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => handleDelete(p.id)}
                              className="font-label-caps text-xs text-error border border-error/40 px-2 py-1 hover:bg-error/10 transition-colors">
                              CONFIRMAR
                            </button>
                            <button onClick={() => setPendDelete(null)}
                              className="font-label-caps text-xs text-on-surface-variant border border-outline-variant/30 px-2 py-1 hover:bg-surface transition-colors">
                              CANCELAR
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setPendDelete(p.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                            <span className="material-symbols-outlined text-base text-on-surface-variant hover:text-error transition-colors">delete</span>
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
      </div>
    </div>
  );
}

// 0. modal cadastro de piloto
function CadastroPiloto({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    nome: '', cpf: '', email: '', telefone: '',
    nascimento: '', altura: '', peso: '',
    senha: '', confirmarSenha: '',
  });
  const [errors, setErrors] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('modal-open');
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const formatCPF = (val) =>
    val.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

  const formatTel = (val) =>
    val.replace(/\D/g, '').slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');

  const validate = () => {
    const e = {};
    if (!form.nome.trim() || form.nome.trim().split(' ').length < 2)
      e.nome = 'Informe nome e sobrenome';
    if (form.cpf.replace(/\D/g, '').length !== 11)
      e.cpf = 'CPF inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'E-mail inválido';
    if (form.telefone.replace(/\D/g, '').length < 10)
      e.telefone = 'Telefone inválido';
    if (!form.nascimento)
      e.nascimento = 'Informe a data de nascimento';
    if (!form.altura || form.altura < 100 || form.altura > 250)
      e.altura = 'Altura inválida (100–250 cm)';
    if (!form.peso || form.peso < 20 || form.peso > 200)
      e.peso = 'Peso inválido (20–200 kg)';
    if (form.senha.length < 6)
      e.senha = 'Mínimo 6 caracteres';
    if (form.senha !== form.confirmarSenha)
      e.confirmarSenha = 'As senhas não coincidem';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (auth_emailExiste(form.email)) {
      setErrors({ email: 'Este e-mail já está cadastrado' });
      return;
    }
    auth_salvarPiloto(form);
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="modal-panel p-10 flex flex-col items-center text-center gap-6" onClick={e => e.stopPropagation()}>
          <div className="w-20 h-20 bg-primary-container/20 border-2 border-primary-container flex items-center justify-center skew-x-m10">
            <span className="material-symbols-outlined text-5xl text-primary-container skew-x-10">
              check_circle
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface italic uppercase">
            Cadastro Realizado!
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Bem-vindo ao Speed Park, <strong className="text-primary">{form.nome.split(' ')[0]}</strong>!
            Agora você pode fazer login e reservar suas sessões.
          </p>
          <button
            onClick={onSuccess || onClose}
            className="font-label-caps text-label-caps bg-primary-container text-white px-10 py-3 skew-x-m10 brutalist-button cta-pulse hover:bg-primary transition-colors mt-2"
          >
            <span className="inline-block skew-x-10">IR PARA O LOGIN</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-outline-variant/20">
          <div>
            <p className="font-label-caps text-label-caps text-secondary tracking-widest mb-1">
              SPEED PARK
            </p>
            <h2 className="font-headline-md text-headline-md text-on-surface italic uppercase leading-tight">
              Cadastro de Piloto
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary-container hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} noValidate className="px-8 py-6 modal-field-group">

          {/* nome */}
          <div>
            <label className="modal-label">Nome Completo *</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Ex: Carlos Mendonça"
              value={form.nome}
              onChange={set('nome')}
              autoComplete="name"
            />
            {errors.nome && <p className="text-xs text-error mt-1">{errors.nome}</p>}
          </div>

          {/* cpf + nascimento */}
          <div className="modal-row">
            <div>
              <label className="modal-label">CPF *</label>
              <input
                type="text"
                className="modal-input"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => {
                  setForm((p) => ({ ...p, cpf: formatCPF(e.target.value) }));
                  setErrors((p) => ({ ...p, cpf: '' }));
                }}
                inputMode="numeric"
              />
              {errors.cpf && <p className="text-xs text-error mt-1">{errors.cpf}</p>}
            </div>
            <div>
              <label className="modal-label">Data de Nascimento *</label>
              <input
                type="date"
                className="modal-input"
                value={form.nascimento}
                onChange={set('nascimento')}
                style={{ colorScheme: 'dark' }}
              />
              {errors.nascimento && <p className="text-xs text-error mt-1">{errors.nascimento}</p>}
            </div>
          </div>

          {/* email + telefone */}
          <div className="modal-row">
            <div>
              <label className="modal-label">E-mail *</label>
              <input
                type="email"
                className="modal-input"
                placeholder="piloto@email.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="modal-label">Telefone *</label>
              <input
                type="tel"
                className="modal-input"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => {
                  setForm((p) => ({ ...p, telefone: formatTel(e.target.value) }));
                  setErrors((p) => ({ ...p, telefone: '' }));
                }}
                inputMode="numeric"
              />
              {errors.telefone && <p className="text-xs text-error mt-1">{errors.telefone}</p>}
            </div>
          </div>


          {/* altura + peso */}
          <div className="modal-row">
            <div>
              <label className="modal-label">Altura (cm) *</label>
              <input
                type="number"
                className="modal-input"
                placeholder="Ex: 175"
                value={form.altura}
                onChange={set('altura')}
                min="100"
                max="250"
                inputMode="numeric"
              />
              {errors.altura && <p className="text-xs text-error mt-1">{errors.altura}</p>}
            </div>
            <div>
              <label className="modal-label">Peso (kg) *</label>
              <input
                type="number"
                className="modal-input"
                placeholder="Ex: 70"
                value={form.peso}
                onChange={set('peso')}
                min="20"
                max="200"
                inputMode="numeric"
              />
              {errors.peso && <p className="text-xs text-error mt-1">{errors.peso}</p>}
            </div>
          </div>

          {/* senha + confirmar */}
          <div className="modal-row">
            <div>
              <label className="modal-label">Senha *</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  className="modal-input"
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={set('senha')}
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setMostrarSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">{mostrarSenha ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.senha && <p className="text-xs text-error mt-1">{errors.senha}</p>}
            </div>
            <div>
              <label className="modal-label">Confirmar Senha *</label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? 'text' : 'password'}
                  className="modal-input"
                  placeholder="Repita a senha"
                  value={form.confirmarSenha}
                  onChange={set('confirmarSenha')}
                  autoComplete="new-password"
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setMostrarConfirmar(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">{mostrarConfirmar ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.confirmarSenha && <p className="text-xs text-error mt-1">{errors.confirmarSenha}</p>}
            </div>
          </div>

          {/* divider */}
          <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full font-label-caps text-label-caps bg-primary-container text-white py-4 skew-x-m10 brutalist-button hover:bg-primary transition-colors"
            >
              <span className="inline-block skew-x-10">CRIAR MINHA CONTA</span>
            </button>
            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
              Já tem conta?{' '}
              <button type="button" onClick={onClose} className="text-secondary hover:text-primary transition-colors underline underline-offset-2">
                Fazer login
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}

// modal reservar
function ModalReservar({ onClose, onLogin, onCadastro }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('modal-open');
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('modal-open'); window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={e => e.target === overlayRef.current && onClose()}>
      <div className="modal-panel p-8 flex flex-col gap-6" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between pb-6 border-b border-outline-variant/20">
          <div>
            <p className="font-label-caps text-label-caps text-secondary tracking-widest mb-1">SPEED PARK</p>
            <h2 className="font-headline-md text-headline-md text-on-surface italic uppercase">Reservar Sessão</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 text-on-surface-variant hover:border-primary-container hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="flex items-start gap-3 bg-secondary/10 border border-secondary/20 px-4 py-3">
          <span className="material-symbols-outlined text-secondary text-base mt-0.5">info</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Para reservar uma sessão você precisa estar logado. Já tem uma conta no Speed Park?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full font-label-caps text-label-caps bg-primary-container text-white py-4 skew-x-m10 brutalist-button cta-pulse hover:bg-primary transition-colors"
          >
            <span className="inline-block skew-x-10">SIM, JÁ TENHO CONTA</span>
          </button>
          <button
            onClick={onCadastro}
            className="w-full font-label-caps text-label-caps bg-surface border border-secondary text-secondary py-4 skew-x-m10 hover:bg-secondary/10 transition-colors"
          >
            <span className="inline-block skew-x-10">NÃO, QUERO ME CADASTRAR</span>
          </button>
        </div>

      </div>
    </div>
  );
}

// 1. navbar
function Navbar({ onOpenCadastro, onOpenLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'HOME', href: '#hero-section' },
    { label: 'SESSÕES', href: '#sessoes' },
    { label: 'RANKINGS', href: '#ranking' },
    { label: 'PREÇOS', href: '#precos' },
    { label: 'SOBRE', href: '#sobre' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-outline-variant/30 bg-surface/95 backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-margin-edge py-4 max-w-container-max mx-auto">

        {/* logo */}
        <a href="#hero-section" className="flex items-center gap-4 reveal-up">
          <img
            src="src/assets/images/LogoSpeedPark.png"
            alt="Speed Park Logo"
            className="h-14 w-14 rounded-full object-cover"
          />
          <span className="font-headline-md text-headline-md font-black text-primary italic tracking-tighter">
            SPEED PARK
          </span>
        </a>

        {/* links desktop */}
        <div className="hidden md:flex items-center gap-8 reveal-up stagger-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-on-surface-variant hover:text-primary transition-all font-label-caps text-label-caps nav-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ctas desktop */}
        <div className="hidden md:flex items-center gap-4 reveal-up stagger-2">
          <button
            onClick={onOpenLogin}
            className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors"
          >
            LOGIN
          </button>
          <button
            onClick={onOpenCadastro}
            className="font-label-caps text-label-caps bg-primary-container text-white px-6 py-2 skew-x-m10 brutalist-button hover:bg-primary transition-colors"
          >
            <span className="inline-block skew-x-10">CADASTRAR</span>
          </button>
        </div>

        {/* hamburguer mobile */}
        <button
          className="md:hidden text-primary p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* menu mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container border-t border-outline-variant/30 px-margin-edge py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-label-caps py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
            <button
              className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors"
              onClick={() => { setMobileOpen(false); onOpenLogin(); }}
            >
              LOGIN
            </button>
            <button
              className="font-label-caps text-label-caps bg-primary-container text-white px-6 py-2 skew-x-m10 brutalist-button"
              onClick={() => { setMobileOpen(false); onOpenCadastro(); }}
            >
              <span className="inline-block skew-x-10">CADASTRAR</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// 2. hero
function Hero({ onReservar }) {
  const heroBgRef = useRef(null);
  const heroSectionRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const section = heroSectionRef.current;
    const bg = heroBgRef.current;
    if (!section || !bg) return;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      bg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    };

    const handleMouseLeave = () => {
      bg.style.transform = 'translate(0px, 0px) scale(1.05)';
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <header
      id="hero-section"
      ref={heroSectionRef}
      className="relative min-h-[90vh] flex items-center justify-center speed-shear bg-surface-container-low overflow-hidden"
    >
      <div
        className="absolute inset-0 checkered-pattern opacity-20 z-10"
        aria-hidden="true"
      />

      <div
        id="hero-bg"
        ref={heroBgRef}
        className="absolute -inset-10 z-0 scale-105 hero-bg-image"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      </div>

      <div className="relative z-20 w-full max-w-container-max mx-auto px-margin-edge grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col justify-center">
          <h1 className="font-display-hero text-display-hero text-on-surface italic mb-6 leading-tight animate-float reveal-up">
            SINTA A <br />
            <span className="text-primary-container">ADRENALINA</span> <br />
            NO SPEED PARK
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-6 sm:mb-10 border-l-4 border-secondary pl-6 py-2 bg-surface/40 backdrop-blur-sm reveal-up stagger-1">
            A pista de kart mais rápida e tecnológica da região. Venha testar seus limites
            com frota renovada e telemetria profissional.
          </p>

          <div className="flex flex-wrap gap-6 reveal-up stagger-2">
            <button onClick={onReservar} className="font-label-caps text-label-caps bg-primary-container text-white px-8 py-4 skew-x-m10 brutalist-button cta-pulse text-lg">
              <span className="inline-block skew-x-10">RESERVAR AGORA</span>
            </button>

            <a
              href="#ranking"
              className="font-label-caps text-label-caps bg-surface border-2 border-secondary text-secondary px-8 py-4 skew-x-m10 hover:bg-secondary/10 transition-colors text-lg"
            >
              <span className="inline-block skew-x-10">VER RANKINGS</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

// 3. sessoes
function Sessoes() {
  const categories = [
    {
      id: 'open',
      tag: 'INICIANTES & AMADORES',
      title: 'SESSÕES OPEN',
      description: 'Perfeito para grupos de amigos e pilotos casuais. Karts de 6.5hp com velocidade limitada, mas diversão garantida.',
      info: '15 MINUTOS • R$ 85,00',
      colSpan: 'md:col-span-8',
      statusType: 'left',
      featured: false,
      stagger: 'stagger-1',
    },
    {
      id: 'pro',
      tag: 'ALTA PERFORMANCE',
      title: 'SESSÕES PRO',
      description: 'Karts de 13hp preparados para competição. Requer tempo de qualificação prévio.',
      info: '20 MINUTOS • R$ 120,00',
      colSpan: 'md:col-span-4',
      statusType: 'top',
      featured: true,
      stagger: 'stagger-2',
    },
  ];

  return (
    <section
      id="sessoes"
      className="py-24 px-margin-edge bg-surface relative overflow-hidden"
    >
      <div
        className="absolute top-0 left-0 w-1/4 h-full bg-primary-container/5 blur-3xl rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">

        <div className="md:col-span-12 flex items-end justify-between mb-12 reveal-up">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface italic uppercase">
              Nossas Sessões
            </h2>
            <div className="h-1 w-24 bg-primary-container mt-4 skew-x-m10" aria-hidden="true" />
          </div>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`${cat.colSpan} bg-surface-container border relative overflow-hidden flex flex-col justify-between p-8 sessao-card reveal-up ${cat.stagger} group ${cat.featured ? 'border-primary-container' : 'border-secondary/20 hover:border-primary-container/80'
              }`}
          >
            {cat.featured && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary-container" aria-hidden="true" />
            )}

            <div>
              <span className="font-label-caps text-label-caps text-secondary mb-2 block">
                {cat.tag}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface italic mb-4">
                {cat.title}
              </h3>
            </div>

            <div className={`flex flex-col ${cat.featured ? 'gap-6' : 'md:flex-row md:items-end justify-between gap-6'}`}>
              <div className="flex-1">
                <p className={`text-on-surface-variant ${cat.featured ? 'font-body-sm text-body-sm' : 'font-body-md text-body-md max-w-md'}`}>
                  {cat.description}
                </p>
              </div>

              {cat.featured ? (
                <div className="font-label-data text-label-data text-primary shimmer-text">
                  {cat.info}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="font-label-data text-label-data text-on-surface bg-surface-container-high px-4 py-2 border border-outline-variant/30 shimmer-text">
                    {cat.info}
                  </div>
                  <span className="material-symbols-outlined text-secondary text-3xl group-hover:text-primary-container transition-all group-hover:translate-x-2">
                    arrow_forward
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="md:col-span-12 bg-surface-container border border-secondary/20 relative overflow-hidden flex flex-col md:flex-row sessao-card reveal-up stagger-3 group hover:border-primary-container/80">
          <div className="w-full md:w-1/3 bg-surface-container-high flex items-center justify-center p-8 border-b border-secondary/20 md:border-b-0 md:border-r relative min-h-[90px]">
            <span
              className="font-headline-lg text-headline-lg text-surface-variant absolute -rotate-90 origin-center tracking-widest uppercase opacity-50 group-hover:text-primary-container/50 transition-colors"
              aria-hidden="true"
            >
              KIDS
            </span>
          </div>

          <div className="p-8 flex-1 flex flex-col justify-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface italic mb-4">
              KART JUNIOR
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Para futuros campeões entre 7 e 12 anos. Pista adaptada e karts com limitador
              de velocidade, garantindo total segurança para a primeira experiência.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-surface-bright border border-outline-variant/30 font-label-data text-label-data shimmer-text">
                10 MINUTOS
              </div>
              <div className="px-4 py-2 bg-surface-bright border border-outline-variant/30 font-label-data text-label-data shimmer-text">
                R$ 60,00
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// 4. features
function Features() {
  const features = [
    {
      id: 'fleet',
      icon: 'speed',
      title: 'Frota Moderna',
      body: 'Nossos karts são renovados anualmente, garantindo equidade de equipamento e performance máxima em cada sessão.',
      stagger: 'stagger-1',
    },
    {
      id: 'telemetry',
      icon: 'monitoring',
      title: 'Telemetria Profissional',
      body: 'Acompanhe seus tempos de volta ao vivo. Análise de parciais e ranking global integrado ao nosso aplicativo.',
      stagger: 'stagger-2',
    },
    {
      id: 'safety',
      icon: 'health_and_safety',
      title: 'Segurança Máxima',
      body: 'Barreiras de absorção de impacto certificadas, controle remoto de velocidade da frota e fiscais treinados em toda a pista.',
      stagger: 'stagger-3',
    },
  ];

  return (
    <section
      id="diferenciais"
      className="bg-surface-container-low py-24 border-y border-outline-variant/20 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 blur-3xl rounded-full mix-blend-screen"
        aria-hidden="true"
      />

      <div className="max-w-container-max mx-auto px-margin-edge relative z-10">
        <h2 className="font-headline-lg text-headline-lg text-on-surface italic uppercase text-center mb-16 reveal-up">
          O Padrão <span className="text-secondary">Speed Park</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feat) => (
            <div
              key={feat.id}
              className={`reveal-up ${feat.stagger}`}
            >
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-surface-container border-2 border-secondary/30 flex items-center justify-center skew-x-m10 mb-6 group-hover:border-primary transition-all duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-4xl text-secondary group-hover:text-primary skew-x-10 transition-transform duration-300 group-hover:rotate-12">
                    {feat.icon}
                  </span>
                </div>

                <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                  {feat.title}
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant transition-transform duration-300 group-hover:-translate-y-1">
                  {feat.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 5. precos
function Precos({ onReservar }) {
  const planos = [
    {
      id: 'avulso',
      nome: 'AVULSO',
      subtitulo: 'Para quem quer experimentar',
      preco: null,
      destaque: false,
      itens: [
        { label: 'Sessão Open (15 min)', valor: 'R$ 85,00' },
        { label: 'Sessão Pro (20 min)', valor: 'R$ 120,00' },
        { label: 'Sessão Junior (10 min)', valor: 'R$ 60,00' },
        { label: 'Equipamento incluso', valor: '✓' },
        { label: 'Seguro de corrida', valor: '✓' },
      ],
      cta: 'RESERVAR',
    },
    {
      id: 'mensal',
      nome: 'PILOTO MENSAL',
      subtitulo: 'Para quem corre todo mês',
      preco: 'R$ 299',
      periodo: '/mês',
      destaque: true,
      itens: [
        { label: '4 sessões Open/mês', valor: '✓' },
        { label: '2 sessões Pro/mês', valor: '✓' },
        { label: 'Prioridade na reserva', valor: '✓' },
        { label: 'Acesso ao app telemetria', valor: '✓' },
        { label: 'Desconto em eventos', valor: '10%' },
      ],
      cta: 'ASSINAR',
    },
    {
      id: 'elite',
      nome: 'ELITE',
      subtitulo: 'Para competidores sérios',
      preco: 'R$ 599',
      periodo: '/mês',
      destaque: false,
      itens: [
        { label: 'Sessões ilimitadas', valor: '✓' },
        { label: 'Kart reservado', valor: '✓' },
        { label: 'Telemetria avançada', valor: '✓' },
        { label: 'Treinos com instrutor', valor: '2x/mês' },
        { label: 'Desconto em eventos', valor: '20%' },
      ],
      cta: 'ASSINAR',
    },
  ];

  return (
    <section
      id="precos"
      className="py-24 px-margin-edge bg-surface relative overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-primary-container/5 blur-3xl rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="text-center mb-16 reveal-up">
          <h2 className="font-headline-lg text-headline-lg text-on-surface italic uppercase mb-4">
            Planos & <span className="text-primary-container">Preços</span>
          </h2>
          <div className="h-1 w-24 bg-primary-container mx-auto skew-x-m10" aria-hidden="true" />
          <p className="font-body-md text-body-md text-on-surface-variant mt-6 max-w-xl mx-auto">
            Escolha o plano ideal para o seu ritmo. Todos incluem equipamento de segurança e acesso à pista.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`relative flex flex-col border reveal-up ${plano.destaque
                ? 'border-primary-container bg-surface-container-high'
                : 'border-secondary/20 bg-surface-container'
                }`}
            >
              {plano.destaque && (
                <>
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary-container" aria-hidden="true" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-label-caps text-label-caps text-white bg-primary-container px-4 py-1 skew-x-m10 inline-block">
                      <span className="inline-block skew-x-10">MAIS POPULAR</span>
                    </span>
                  </div>
                </>
              )}

              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6">
                  <h3 className={`font-headline-sm text-headline-sm italic mb-1 ${plano.destaque ? 'text-primary' : 'text-on-surface'}`}>
                    {plano.nome}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {plano.subtitulo}
                  </p>
                </div>

                <div className="mb-8 pb-8 border-b border-outline-variant/30">
                  {plano.preco ? (
                    <div className="flex items-end gap-1">
                      <span className="font-display-hero text-display-hero text-on-surface leading-none">
                        {plano.preco}
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant mb-2">
                        {plano.periodo}
                      </span>
                    </div>
                  ) : (
                    <span className="font-headline-md text-headline-md text-on-surface-variant italic">
                      Por Sessão
                    </span>
                  )}
                </div>

                <ul className="flex flex-col gap-4 flex-1 mb-8">
                  {plano.itens.map((item) => (
                    <li key={item.label} className="flex items-center justify-between">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {item.label}
                      </span>
                      <span className={`font-label-data text-label-data ml-4 ${item.valor === '✓' ? 'text-secondary' : 'text-primary shimmer-text'
                        }`}>
                        {item.valor}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onReservar}
                  className={`w-full font-label-caps text-label-caps py-4 skew-x-m10 brutalist-button transition-colors ${plano.destaque
                    ? 'bg-primary-container text-white cta-pulse hover:bg-primary'
                    : 'bg-surface border border-secondary text-secondary hover:bg-secondary/10'
                    }`}
                >
                  <span className="inline-block skew-x-10">{plano.cta}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-10 reveal-up">
          Todos os preços incluem equipamento de segurança (capacete, macacão e luvas).
          Pagamento via PIX, cartão de crédito ou débito.
        </p>
      </div>
    </section>
  );
}

// 6. rankings
const MOCK_RANKINGS = {
  open: [
    { pos: 1, nome: 'Carlos Mendonça', melhorVolta: '58.234', corridas: 42, pontos: 1840 },
    { pos: 2, nome: 'Ana Ribeiro', melhorVolta: '58.891', corridas: 38, pontos: 1720 },
    { pos: 3, nome: 'Felipe Torres', melhorVolta: '59.102', corridas: 35, pontos: 1610 },
    { pos: 4, nome: 'Mariana Costa', melhorVolta: '59.445', corridas: 31, pontos: 1480 },
    { pos: 5, nome: 'Bruno Almeida', melhorVolta: '59.780', corridas: 28, pontos: 1350 },
    { pos: 6, nome: 'Juliana Ferreira', melhorVolta: '1:00.12', corridas: 25, pontos: 1200 },
    { pos: 7, nome: 'Rafael Gomes', melhorVolta: '1:00.45', corridas: 22, pontos: 1080 },
    { pos: 8, nome: 'Patrícia Lima', melhorVolta: '1:00.78', corridas: 19, pontos: 940 },
    { pos: 9, nome: 'Diego Souza', melhorVolta: '1:01.23', corridas: 16, pontos: 820 },
    { pos: 10, nome: 'Camila Rodrigues', melhorVolta: '1:01.56', corridas: 14, pontos: 700 },
  ],
  pro: [
    { pos: 1, nome: 'Lucas Pereira', melhorVolta: '52.100', corridas: 55, pontos: 2400 },
    { pos: 2, nome: 'Thiago Nascimento', melhorVolta: '52.445', corridas: 50, pontos: 2250 },
    { pos: 3, nome: 'Fernanda Oliveira', melhorVolta: '52.890', corridas: 47, pontos: 2100 },
    { pos: 4, nome: 'André Santos', melhorVolta: '53.234', corridas: 43, pontos: 1950 },
    { pos: 5, nome: 'Isabela Martins', melhorVolta: '53.560', corridas: 40, pontos: 1800 },
    { pos: 6, nome: 'Renato Carvalho', melhorVolta: '53.890', corridas: 36, pontos: 1650 },
    { pos: 7, nome: 'Vanessa Rocha', melhorVolta: '54.120', corridas: 32, pontos: 1500 },
    { pos: 8, nome: 'Gustavo Barbosa', melhorVolta: '54.450', corridas: 29, pontos: 1350 },
    { pos: 9, nome: 'Larissa Campos', melhorVolta: '54.780', corridas: 25, pontos: 1200 },
    { pos: 10, nome: 'Marcelo Araújo', melhorVolta: '55.010', corridas: 22, pontos: 1050 },
  ],
  junior: [
    { pos: 1, nome: 'Matheus Silva', melhorVolta: '1:08.45', corridas: 30, pontos: 1200 },
    { pos: 2, nome: 'Sofia Andrade', melhorVolta: '1:09.10', corridas: 28, pontos: 1100 },
    { pos: 3, nome: 'Pedro Henrique', melhorVolta: '1:09.78', corridas: 25, pontos: 1000 },
    { pos: 4, nome: 'Beatriz Moreira', melhorVolta: '1:10.23', corridas: 22, pontos: 900 },
    { pos: 5, nome: 'Gabriel Fonseca', melhorVolta: '1:10.67', corridas: 19, pontos: 800 },
  ],
};

const CATEGORIAS = [
  { id: 'open', label: 'OPEN' },
  { id: 'pro', label: 'PRO' },
  { id: 'junior', label: 'JUNIOR' },
];

const medalhas = ['text-yellow-400', 'text-zinc-400', 'text-amber-600'];
const PONTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function buildRanking() {
  const historico = JSON.parse(localStorage.getItem('sp_historico') || '[]');
  if (historico.length === 0) return [];
  const mapa = {};
  historico.forEach(corrida => {
    (corrida.posicoes || []).forEach((p, i) => {
      const key = p.nome.trim().toLowerCase();
      if (!mapa[key]) mapa[key] = { nome: p.nome.trim(), corridas: 0, pontos: 0, vitorias: 0 };
      mapa[key].corridas++;
      mapa[key].pontos += PONTOS_F1[i] || 0;
      if (i === 0) mapa[key].vitorias++;
    });
  });
  return Object.values(mapa)
    .sort((a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias)
    .map((p, i) => ({ ...p, pos: i + 1, melhorVolta: '--' }));
}

function Rankings() {
  const [categoria, setCategoria] = useState('open');
  const rankingReal = buildRanking();
  const temDados = rankingReal.length > 0;
  const pilotos = temDados ? rankingReal : MOCK_RANKINGS[categoria];

  return (
    <section
      id="ranking"
      className="py-24 px-margin-edge bg-surface relative overflow-hidden"
    >
      <div
        className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-primary-container/5 blur-3xl rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 reveal-up">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface italic uppercase mb-4">
              Rankings <span className="text-secondary">Globais</span>
            </h2>
            <div className="h-1 w-24 bg-primary-container skew-x-m10" aria-hidden="true" />
          </div>

          {temDados ? (
            <span className="flex items-center gap-2 font-label-caps text-label-caps text-secondary text-xs">
              <span className="material-symbols-outlined text-sm">verified</span>
              DADOS REAIS · {rankingReal.length} PILOTOS
            </span>
          ) : (
            <div className="flex gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoria(cat.id)}
                  className={`font-label-caps text-label-caps px-5 py-2 skew-x-m10 transition-colors border ${categoria === cat.id
                    ? 'bg-primary-container text-white border-primary-container'
                    : 'bg-surface-container text-on-surface-variant border-secondary/20 hover:border-secondary'
                    }`}
                >
                  <span className="inline-block skew-x-10">{cat.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container border border-secondary/20 overflow-hidden reveal-up stagger-1">
          {/* cabeçalho */}
          <div className="grid grid-cols-[2.5rem_1fr_4rem] sm:grid-cols-[2.5rem_1fr_8rem_4rem] md:grid-cols-[2.5rem_1fr_8rem_5.5rem_4.5rem] gap-x-4 px-4 sm:px-6 py-4 bg-surface-container-high border-b border-secondary/20">
            <span className="font-label-caps text-label-caps text-on-surface-variant">#</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant">PILOTO</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant text-right hidden sm:block">MELHOR VOLTA</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant text-right hidden md:block">CORRIDAS</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant text-right">PTS</span>
          </div>

          {pilotos.map((piloto, i) => (
            <div
              key={piloto.pos}
              className={`grid grid-cols-[2.5rem_1fr_4rem] sm:grid-cols-[2.5rem_1fr_8rem_4rem] md:grid-cols-[2.5rem_1fr_8rem_5.5rem_4.5rem] gap-x-4 items-center px-4 sm:px-6 py-4 border-b border-outline-variant/10 last:border-0 transition-colors hover:bg-surface-container-high group ${i === 0 ? 'bg-primary-container/5' : ''}`}
            >
              <div className="flex items-center">
                {i < 3 ? (
                  <span className={`material-symbols-outlined text-xl ${medalhas[i]}`}>
                    emoji_events
                  </span>
                ) : (
                  <span className="font-label-data text-label-data text-on-surface-variant">
                    {piloto.pos}
                  </span>
                )}
              </div>

              <span className={`font-body-md text-body-md group-hover:text-primary transition-colors ${i === 0 ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                {piloto.nome}
              </span>

              <span className="font-label-data text-label-data text-secondary shimmer-text text-right hidden sm:block">
                {piloto.melhorVolta}s
              </span>

              <span className="font-label-data text-label-data text-on-surface-variant text-right hidden md:block">
                {piloto.corridas}
              </span>

              <span className={`font-label-data text-label-data text-right ${i === 0 ? 'text-primary shimmer-text' : 'text-on-surface-variant'}`}>
                {piloto.pontos}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant/50 mt-6 reveal-up">
          {temDados
            ? 'Ranking gerado a partir das corridas registradas no sistema.'
            : 'Dados ilustrativos. O ranking real será gerado após as primeiras corridas.'}
        </p>
      </div>
    </section>
  );
}

// 7. sobre
function Sobre() {
  const stats = [
    { valor: '2018', label: 'Fundado em' },
    { valor: '1,2km', label: 'De pista' },
    { valor: '30+', label: 'Karts na frota' },
    { valor: '50k+', label: 'Pilotos atendidos' },
  ];

  const valores = [
    {
      icon: 'emoji_events',
      title: 'Competitividade',
      body: 'Promovemos corridas justas com equipamentos equiparados e telemetria transparente para todos.',
    },
    {
      icon: 'diversity_3',
      title: 'Inclusão',
      body: 'Da primeira corrida ao campeonato regional — temos categorias para todas as idades e níveis.',
    },
    {
      icon: 'engineering',
      title: 'Tecnologia',
      body: 'Frota renovada anualmente e sistema de telemetria próprio com dados ao vivo para cada piloto.',
    },
  ];

  return (
    <section
      id="sobre"
      className="py-24 bg-surface-container-low border-y border-outline-variant/20 relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-1/4 h-full bg-secondary/5 blur-3xl rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-container-max mx-auto px-margin-edge relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 sm:mb-24">
          <div className="reveal-up">
            <p className="font-label-caps text-label-caps text-secondary mb-4 tracking-widest">
              NOSSA HISTÓRIA
            </p>
            <h2 className="font-headline-lg text-headline-lg text-on-surface italic uppercase mb-6">
              Nascemos para <br />
              <span className="text-primary-container">acelerar</span> você
            </h2>
            <div className="h-1 w-24 bg-primary-container mb-8 skew-x-m10" aria-hidden="true" />
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 border-l-4 border-secondary pl-6 py-2 bg-surface/40">
              O Speed Park nasceu em 2018 com uma missão clara: trazer a experiência do
              automobilismo profissional para qualquer pessoa, com segurança e tecnologia
              de ponta.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Em poucos anos nos tornamos o kartódromo de referência da região, com a maior
              pista coberta e o único sistema de telemetria em tempo real disponível para
              todos os pilotos — do iniciante ao competidor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-gutter reveal-up stagger-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container border border-secondary/20 p-5 sm:p-8 flex flex-col justify-between group hover:border-primary-container/60 transition-colors"
              >
                <div className="font-display-hero text-display-hero text-primary-container italic leading-none shimmer-text">
                  {stat.valor}
                </div>
                <div className="font-label-caps text-label-caps text-on-surface-variant mt-4">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal-up stagger-2">
          <h3 className="font-headline-md text-headline-md text-on-surface italic uppercase text-center mb-12">
            Nossos Valores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {valores.map((v, i) => (
              <div
                key={v.title}
                className={`flex flex-col items-center text-center group reveal-up stagger-${i + 1}`}
              >
                <div className="w-16 h-16 bg-surface-container border-2 border-secondary/30 flex items-center justify-center skew-x-m10 mb-6 group-hover:border-primary transition-all duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-primary skew-x-10 transition-colors duration-300">
                    {v.icon}
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface uppercase mb-3">
                  {v.title}
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 8. footer
function Footer() {
  const sociais = [
    { icon: 'chat',         label: 'WhatsApp',  href: 'https://api.whatsapp.com/send?phone=551836383050&text=Ol%C3%A1,%20estou%20precisando%20de%20informa%C3%A7%C3%B5es' },
    { icon: 'photo_camera', label: 'Instagram', href: 'https://www.instagram.com/speedpark.oficial/?hl=pt' },
  ];

  return (
    <footer className="bg-surface-container-lowest border-t-4 border-primary">

      {/* corpo principal */}
      <div className="max-w-container-max mx-auto px-margin-edge py-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-0 reveal-up">

        {/* logo */}
        <div className="flex items-center gap-4 md:w-56 flex-shrink-0">
          <img
            src="src/assets/images/LogoSpeedPark.png"
            alt="Speed Park"
            className="h-16 w-16 rounded-full object-cover"
          />
          <span className="font-headline-md text-headline-md font-black text-primary italic tracking-tighter leading-none">
            SPEED<br />PARK
          </span>
        </div>

        {/* divisor vertical */}
        <div className="hidden md:block w-px self-stretch bg-outline-variant/30 mx-10" aria-hidden="true" />

        {/* endereço + redes */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            {/* endereço */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">location_on</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Rodovia Marechal Rondon Km 524
              </span>
            </div>
            {/* telefone */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">phone</span>
              <a href="tel:1836383050" className="font-label-data text-label-data text-on-surface hover:text-primary transition-colors">
                18 3638.3050
              </a>
            </div>
          </div>

          {/* ícones sociais */}
          <div className="flex items-center gap-3">
            {sociais.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-base">{s.icon}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* faixa de copyright */}
      <div className="border-t border-outline-variant/20 px-margin-edge py-4">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="font-body-sm text-body-sm text-on-surface-variant/60">
            © Copyright Speed Park. Todos os direitos reservados.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/40">
            Desenvolvido por Ritmo Propaganda.
          </p>
        </div>
      </div>

    </footer>
  );
}

// 9. home page (combinação)
function Home({ onReservar }) {
  useScrollReveal();

  return (
    <main>
      <Hero onReservar={onReservar} />
      <Sessoes />
      <Features />
      <Precos onReservar={onReservar} />
      <Rankings />
      <Sobre />
    </main>
  );
}

// --- core app ---
function App() {
  const [cadastroOpen, setCadastroOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [reservarOpen, setReservarOpen] = useState(false);

  const openCadastro = useCallback(() => { setLoginOpen(false); setReservarOpen(false); setCadastroOpen(true); }, []);
  const openLogin    = useCallback(() => { setCadastroOpen(false); setReservarOpen(false); setLoginOpen(true); }, []);
  const openReservar = useCallback(() => { setCadastroOpen(false); setLoginOpen(false); setReservarOpen(true); }, []);

  const handleLogin = useCallback((user) => {
    auth_setSession(user);
    window.location.href = user.role === 'admin' ? 'dashboard-admin.html' : 'dashboard-piloto.html';
  }, []);

  const handleCadastroSuccess = useCallback(() => {
    setCadastroOpen(false);
    setLoginOpen(true);
  }, []);

  return (
    <>
      <Navbar onOpenCadastro={openCadastro} onOpenLogin={openLogin} />
      <Home onReservar={openReservar} />
      <Footer />
      {reservarOpen  && <ModalReservar onClose={() => setReservarOpen(false)} onLogin={openLogin} onCadastro={openCadastro} />}
      {cadastroOpen  && <CadastroPiloto onClose={() => setCadastroOpen(false)} onSuccess={handleCadastroSuccess} />}
      {loginOpen     && <ModalLogin onClose={() => setLoginOpen(false)} onLogin={handleLogin} onOpenCadastro={openCadastro} />}
    </>
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
      page:    { minHeight: '100vh', background: '#051424', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Hanken Grotesk, sans-serif' },
      card:    { maxWidth: '480px', width: '100%', border: '1px solid rgba(170,136,140,0.2)', background: '#122131', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
      tag:     { color: '#d91e5b', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', margin: 0 },
      title:   { fontFamily: 'Anybody, sans-serif', fontSize: '28px', fontWeight: '800', fontStyle: 'italic', color: '#d4e4fa', lineHeight: '1.2', margin: 0 },
      desc:    { fontSize: '14px', color: '#e3bdc2', lineHeight: '1.6', margin: 0 },
      pre:     { marginTop: '0.75rem', fontSize: '11px', color: '#ffb4ab', background: '#010f1f', padding: '0.75rem', overflowX: 'auto', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
      summary: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#aa888c', cursor: 'pointer', userSelect: 'none' },
      row:     { display: 'flex', gap: '0.75rem' },
      btnPrimary:   { flex: 1, background: '#d91e5b', color: '#fff', border: 'none', padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '0.1em' },
      btnSecondary: { flex: 1, background: 'transparent', color: '#9bccf6', border: '1px solid rgba(155,204,246,0.3)', padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '0.1em' },
    };
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={s.tag}>ERRO INESPERADO</p>
            <h1 style={s.title}>Algo deu errado</h1>
            <p style={s.desc}>Ocorreu um erro inesperado. Tente recarregar a página.</p>
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
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
