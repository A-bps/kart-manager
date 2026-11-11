package com.fatec.speedpark.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatec.speedpark.dto.PosicaoRequest;
import com.fatec.speedpark.dto.ProvaRequest;
import com.fatec.speedpark.dto.ProvaView;
import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.entities.Prova;
import com.fatec.speedpark.entities.Resultado;
import com.fatec.speedpark.exceptions.ConflitoException;
import com.fatec.speedpark.exceptions.ErrosBanco;
import com.fatec.speedpark.repositories.PistaRepository;
import com.fatec.speedpark.repositories.ProvaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProvaService {

    private final ProvaRepository repository;
    private final PistaRepository pistaRepository;
    private final JdbcTemplate jdbc;

    @Transactional(readOnly = true)
    public List<ProvaView> listarAtivas() {
        return repository.findByStatusOrderByIdAsc(Prova.ATIVA).stream().map(ProvaView::de).toList();
    }

    @Transactional(readOnly = true)
    public List<ProvaView> listarHistorico() {
        return repository.findTop1000ByStatusOrderByEncerradaEmDesc(Prova.ENCERRADA).stream().map(ProvaView::de).toList();
    }

    @Transactional
    public ProvaView iniciar(ProvaRequest r) {
        // trava a pista: dois admins não iniciam corrida na mesma pista ao mesmo tempo
        Pista pista = pistaRepository.buscarParaReserva(r.pistaId())
                .orElseThrow(() -> new NoSuchElementException("Pista não encontrada: " + r.pistaId()));
        if (repository.existsByPistaAndStatus(pista, Prova.ATIVA)) {
            throw new ConflitoException("Esta pista já tem uma corrida em andamento.");
        }
        Prova prova = new Prova();
        prova.setNumero(r.numero());
        prova.setPista(pista);
        prova.setDuracaoSeg(r.duracaoSec());
        prova.setIniciadaEm(LocalDateTime.now());
        prova.setStatus(Prova.ATIVA);
        preencher(prova, r.posicoes());
        return ProvaView.de(repository.save(prova));
    }

    // A transacao de encerrar (conferir status, trocar a lista de largada pelo resultado, fechar a corrida)
    // e feita pela stored procedure sp_EncerrarProva_SpeedPark; o resultado vai como JSON, na ordem de chegada.
    @Transactional
    public ProvaView encerrar(Integer id, List<PosicaoRequest> resultado) {
        try {
            jdbc.queryForObject("exec dbo.sp_EncerrarProva_SpeedPark ?, ?", Integer.class, id, paraJson(resultado));
        } catch (DataAccessException e) {
            throw ErrosBanco.traduzir(e);
        }
        return ProvaView.de(buscar(id));
    }

    private static String paraJson(List<PosicaoRequest> posicoes) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < posicoes.size(); i++) {
            PosicaoRequest p = posicoes.get(i);
            if (i > 0) {
                sb.append(',');
            }
            sb.append("{\"kart\":").append(texto(p.kart()))
              .append(",\"nome\":").append(texto(p.nome() == null ? null : p.nome().trim()))
              .append(",\"melhorVolta\":").append(texto(p.melhorVolta()))
              .append(",\"penalidades\":").append(texto(p.penalidades())).append('}');
        }
        return sb.append(']').toString();
    }

    // texto JSON com aspas e escapes (null vira null)
    private static String texto(String v) {
        if (v == null) {
            return "null";
        }
        StringBuilder sb = new StringBuilder("\"");
        for (char c : v.toCharArray()) {
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> sb.append(c < 0x20 ? String.format("\\u%04x", (int) c) : String.valueOf(c));
            }
        }
        return sb.append('"').toString();
    }

    @Transactional
    public void deletar(Integer id) {
        repository.delete(buscar(id));
    }

    private void preencher(Prova prova, List<PosicaoRequest> posicoes) {
        int pos = 1;
        for (PosicaoRequest p : posicoes) {
            Resultado res = new Resultado();
            res.setProva(prova);
            res.setPosicao(pos++);
            res.setKart(p.kart() == null || p.kart().isBlank() ? "?" : p.kart().trim());
            res.setPilotoNome(p.nome().trim());
            res.setMelhorVolta(p.melhorVolta() == null || p.melhorVolta().isBlank() ? null : p.melhorVolta().trim());
            res.setPenalidades(p.penalidades() == null || p.penalidades().isBlank() ? null : p.penalidades().trim());
            prova.getResultados().add(res);
        }
    }

    private Prova buscar(Integer id) {
        return repository.findById(id).orElseThrow(() -> new NoSuchElementException("Corrida não encontrada: " + id));
    }
}
