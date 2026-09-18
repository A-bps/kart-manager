package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.ManutencaoRequest;
import com.fatec.speedpark.entities.Kart;
import com.fatec.speedpark.entities.Manutencao;
import com.fatec.speedpark.repositories.KartRepository;
import com.fatec.speedpark.repositories.ManutencaoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManutencaoService {

    private final ManutencaoRepository repository;
    private final KartRepository kartRepository;

    public List<Manutencao> listarTodas() {
        return repository.findAll();
    }

    public List<Manutencao> listarPorKart(Integer kartCodigo) {
        return repository.findByKart_Codigo(kartCodigo);
    }

    public Manutencao buscarPorId(Integer codigo) {
        return repository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Manutencao nao encontrada com o codigo: " + codigo));
    }

    public Manutencao salvar(ManutencaoRequest request) {
        Kart kart = buscarKart(request.kartCodigo());
        Manutencao manutencao = new Manutencao(request.status(), request.valor(), request.formaPagamento(), kart);
        return repository.save(manutencao);
    }

    public Manutencao atualizar(Integer codigo, ManutencaoRequest request) {
        Manutencao existente = buscarPorId(codigo);
        existente.setStatus(request.status());
        existente.setValor(request.valor());
        existente.setFormaPagamento(request.formaPagamento());
        existente.setKart(buscarKart(request.kartCodigo()));
        return repository.save(existente);
    }

    public void deletar(Integer codigo) {
        Manutencao manutencao = buscarPorId(codigo);
        repository.delete(manutencao);
    }

    private Kart buscarKart(Integer codigo) {
        return kartRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Kart nao encontrado com o codigo: " + codigo));
    }
}
