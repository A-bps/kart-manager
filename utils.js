// Utilities compartilhadas para Speed Park

// === Autenticação ===
function auth_getSession() {
  try { return JSON.parse(sessionStorage.getItem('sp_usuario') || 'null'); } catch { return null; }
}

function auth_setSession(u) {
  sessionStorage.setItem('sp_usuario', JSON.stringify(u));
}

function auth_updateSession(u) {
  sessionStorage.setItem('sp_usuario', JSON.stringify(u));
}

function auth_clearSession() {
  sessionStorage.removeItem('sp_usuario');
}

// === Categoria por idade ===
function calcCategoria(nascimento) {
  if (!nascimento) return 'open';
  const hoje = new Date();
  const nasc = new Date(nascimento + 'T12:00:00');
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje < new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())) idade--;
  return idade <= 13 ? 'junior' : 'open';
}

// === Pilotos ===
function pilotos_listar() {
  return JSON.parse(localStorage.getItem('sp_pilotos') || '[]');
}

function pilotos_salvar(lista) {
  localStorage.setItem('sp_pilotos', JSON.stringify(lista));
}

function pilotos_emailExiste(email) {
  return pilotos_listar().some(p => p.email === email);
}
