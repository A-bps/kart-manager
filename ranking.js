// ranking por categoria e por pista (pontos por posicao, estilo F1)
// a melhor volta so aparece com uma pista escolhida: tempo so compara na mesma pista

const RANKING_PONTOS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

function voltaEmSegundos(v) {
  if (!v) return null;
  const partes = String(v).trim().split(':');
  const n = partes.length === 2 ? Number(partes[0]) * 60 + parseFloat(partes[1]) : parseFloat(partes[0]);
  return isNaN(n) ? null : n;
}

// pistaId vazio = todas as pistas da categoria
function rankingPorFiltro(historico, pistas, categoria, pistaId) {
  const mapa = {};
  historico.forEach(corrida => {
    const pista = pistas.find(p => p.id === corrida.pistaId);
    if (!pista || pista.categoria !== categoria) return;
    if (pistaId && corrida.pistaId !== pistaId) return;
    (corrida.posicoes || []).forEach((p, i) => {
      const nome = p.nome.trim();
      const r = mapa[nome.toLowerCase()] = mapa[nome.toLowerCase()] || { nome, corridas: 0, pontos: 0, vitorias: 0, melhorVolta: null };
      r.corridas++;
      r.pontos += RANKING_PONTOS[i] || 0;
      if (i === 0) r.vitorias++;
      const v = voltaEmSegundos(p.melhorVolta);
      if (pistaId && v !== null && (r.melhorVolta === null || v < r.melhorVolta)) r.melhorVolta = v;
    });
  });
  return Object.values(mapa)
    .sort((a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias)
    .map((p, i) => ({ ...p, pos: i + 1 }));
}

function formatarVolta(v) {
  return v == null ? '--' : (typeof v === 'number' ? v.toFixed(1) : v) + 's';
}
