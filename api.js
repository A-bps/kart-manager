// =========================================================
// api.js — camada de dados do Speed Park
// Fala com a API (Spring Boot) e guarda um cache em memoria.
// As telas leem do cache de forma sincrona (pilotos_listar(), frota_listar()...);
// toda escrita vai para a API e depois recarrega a colecao afetada.
// Login: a API devolve um token JWT, guardado em sessionStorage (some ao fechar a aba).
// =========================================================

const API_URL = 'http://localhost:8080/api';

const Api = (() => {
  const cache = { pilotos: [], frota: [], reservas: [], faturamento: [], ativas: [], historico: [], dependentes: [] };

  const token = () => sessionStorage.getItem('sp_token');

  class ApiError extends Error {
    constructor(status, mensagem, campos) { super(mensagem); this.status = status; this.campos = campos || {}; }
  }

  async function req(metodo, caminho, corpo) {
    const headers = {};
    if (corpo !== undefined) headers['Content-Type'] = 'application/json';
    if (token()) headers['Authorization'] = `Bearer ${token()}`;
    let res;
    try {
      res = await fetch(`${API_URL}${caminho}`, { method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
    } catch {
      throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    }
    // sessao expirada ou token invalido: volta para o login
    if (res.status === 401 && caminho !== '/auth/login') {
      sessionStorage.removeItem('sp_token'); sessionStorage.removeItem('sp_usuario');
      window.location.href = 'index.html';
      throw new ApiError(401, 'Sessão expirada. Entre novamente.');
    }
    if (res.status === 204) return null;
    let dados = null;
    try { dados = await res.json(); } catch { /* corpo vazio */ }
    if (!res.ok) throw new ApiError(res.status, (dados && dados.mensagem) || `Erro ${res.status}`, dados && dados.campos);
    return dados;
  }

  // --- adaptadores: formato da API -> formato que as telas ja usam ---
  const dePiloto = p => ({ ...p, nascimento: p.nascimento || '', altura: p.altura ?? '', peso: p.peso ?? '' });
  const deKart = k => ({ id: k.codigo, numero: k.numero, status: k.estado });
  const deLancamento = f => ({ ...f, valor: Number(f.valor) });

  async function carregarPilotos() { cache.pilotos = (await req('GET', '/pilotos')).map(dePiloto); }
  async function carregarFrota() { cache.frota = (await req('GET', '/karts')).filter(k => k.numero != null).map(deKart); }
  async function carregarReservas() { cache.reservas = await req('GET', '/reservas'); }
  async function carregarFaturamento() { cache.faturamento = (await req('GET', '/faturamento')).map(deLancamento); }
  async function carregarAtivas() { cache.ativas = await req('GET', '/provas/ativas'); }
  async function carregarHistorico() { cache.historico = await req('GET', '/provas/historico'); }
  async function carregarDependentes() { cache.dependentes = await req('GET', '/dependentes'); }

  return {
    ApiError, cache,

    // --- sessao ---
    async login(email, senha) {
      const r = await req('POST', '/auth/login', { email, senha });
      sessionStorage.setItem('sp_token', r.token);
      return dePiloto(r.usuario);
    },
    // senha esquecida: confirma por e-mail + CPF do cadastro
    async redefinirSenha(email, cpf, novaSenha) { await req('POST', '/auth/redefinir-senha', { email, cpf, novaSenha }); },
    async registrar(dados) { return dePiloto(await req('POST', '/auth/registro', dados)); },

    // --- carga inicial por perfil ---
    async carregar(role) {
      const tarefas = [carregarFrota(), carregarReservas(), carregarHistorico()];
      if (role === 'admin') tarefas.push(carregarPilotos(), carregarFaturamento(), carregarAtivas());
      else tarefas.push(carregarDependentes());
      await Promise.all(tarefas);
    },
    // ranking da pagina inicial (publico, sem login)
    async carregarRankingPublico() { await carregarHistorico(); },

    // --- pilotos (admin) ---
    async cadastrarPiloto(dados) { await req('POST', '/pilotos', dados); await carregarPilotos(); },
    async removerPiloto(id) { await req('DELETE', `/pilotos/${id}`); await Promise.all([carregarPilotos(), carregarReservas()]); },
    async atualizarPerfil(id, dados) {
      const p = dePiloto(await req('PUT', `/pilotos/${id}`, dados));
      return p;
    },

    // --- frota ---
    async adicionarKart(numero) { await req('POST', '/karts', { numero: Number(numero), estado: 'pronto' }); await carregarFrota(); },
    async statusKart(id, status) {
      const atual = cache.frota.find(k => k.id === id);
      // colocar em manutencao registra a manutencao (procedure do banco), que ja muda o estado do kart
      if (status === 'manutencao' && atual && atual.status !== 'manutencao') {
        await req('POST', '/manutencoes', { status: 'aberta', valor: 0, kartCodigo: id });
        return carregarFrota();
      }
      await req('PUT', `/karts/${id}`, { numero: atual && atual.numero, estado: status });
      await carregarFrota();
    },
    async removerKart(id) { await req('DELETE', `/karts/${id}`); await carregarFrota(); },

    // --- reservas ---
    async reservar(dados) {
      try {
        return await req('POST', '/reservas', dados);
      } finally {
        // sucesso ou "horario lotado": de qualquer forma, atualiza as vagas na tela
        await carregarReservas().catch(() => {});
      }
    },
    async remarcarReserva(id, data, hora) { await req('PUT', `/reservas/${id}`, { data, hora }); await carregarReservas(); },
    async cancelarReserva(id) { await req('DELETE', `/reservas/${id}`); await carregarReservas(); },

    // --- corridas (admin): iniciar, encerrar; o historico alimenta ranking e historico do piloto ---
    async iniciarProva(dados) { const p = await req('POST', '/provas', dados); await carregarAtivas(); return p; },
    async encerrarProva(id, posicoes) { await req('POST', `/provas/${id}/encerrar`, { posicoes }); await Promise.all([carregarAtivas(), carregarHistorico()]); },

    // --- dependentes (filhos) do piloto ---
    async adicionarDependente(dados) { await req('POST', '/dependentes', dados); await carregarDependentes(); },
    async editarDependente(id, dados) { await req('PUT', `/dependentes/${id}`, dados); await carregarDependentes(); },
    async removerDependente(id) { await req('DELETE', `/dependentes/${id}`); await carregarDependentes(); },

    // --- relatorios do admin (views, function e logs de triggers do banco) ---
    async relatorio(caminho) { return req('GET', `/relatorios/${caminho}`); },

    // --- cadastros gerais (admin): lista, cria, altera e apaga em qualquer tabela da API ---
    crud: {
      listar: (caminho) => req('GET', `/${caminho}`),
      criar: (caminho, corpo) => req('POST', `/${caminho}`, corpo),
      atualizar: (caminho, chave, corpo) => req('PUT', `/${caminho}/${chave}`, corpo),
      remover: (caminho, chave) => req('DELETE', `/${caminho}/${chave}`),
    },

    // --- financeiro (admin) ---
    async lancar(dados) { await req('POST', '/faturamento', dados); await carregarFaturamento(); },
    async editarLancamento(id, dados) { await req('PUT', `/faturamento/${id}`, dados); await carregarFaturamento(); },
    async removerLancamento(id) { await req('DELETE', `/faturamento/${id}`); await carregarFaturamento(); },
  };
})();

// avisa o usuario quando uma operacao falha (rede, regra de negocio, permissao)
function apiErro(e) {
  console.error(e);
  alert(e && e.message ? e.message : 'Erro inesperado.');
}

// Carrega os dados da API antes de montar o painel (as telas leem do cache de forma sincrona).
function Carregador({ role, children }) {
  const [estado, setEstado] = React.useState('carregando');
  React.useEffect(() => {
    Api.carregar(role).then(() => setEstado('pronto')).catch(e => { setEstado('erro'); apiErro(e); });
  }, []);
  const estilo = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#051424', color: '#d4e4fa', fontFamily: 'Hanken Grotesk, sans-serif', letterSpacing: '0.1em', textAlign: 'center', padding: '2rem' };
  if (estado === 'carregando') return React.createElement('div', { style: estilo }, 'CARREGANDO...');
  if (estado === 'erro') return React.createElement('div', { style: estilo }, 'Não foi possível carregar os dados. Verifique se a API está rodando e recarregue a página.');
  return children;
}
