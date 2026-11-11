package com.fatec.speedpark.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatec.speedpark.dto.PosicaoRequest;
import com.fatec.speedpark.dto.ProvaRequest;
import com.fatec.speedpark.dto.ProvaView;
import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.entities.Prova;
import com.fatec.speedpark.entities.Resultado;
import com.fatec.speedpark.exceptions.ConflitoException;
import com.fatec.speedpark.repositories.PistaRepository;
import com.fatec.speedpark.repositories.ProvaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProvaService {

    private final ProvaRepository repository;
    private final PistaRepository pistaRepository;

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

    @Transactional
    public ProvaView encerrar(Integer id, List<PosicaoRequest> resultado) {
        Prova prova = buscar(id);
        if (!Prova.ATIVA.equals(prova.getStatus())) {
            throw new ConflitoException("Esta corrida já foi encerrada.");
        }
        prova.getResultados().clear();
        preencher(prova, resultado);
        prova.setStatus(Prova.ENCERRADA);
        prova.setEncerradaEm(LocalDateTime.now());
        return ProvaView.de(repository.save(prova));
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
