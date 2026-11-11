package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatec.speedpark.entities.Kart;
import com.fatec.speedpark.repositories.KartRepository;
import com.fatec.speedpark.repositories.ManutencaoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KartService {

    private final KartRepository repository;
    private final ManutencaoRepository manutencaoRepository;

    public List<Kart> listarTodos() {
        return repository.findAll();
    }

    public Kart buscarPorId(Integer codigo) {
        return repository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Kart nao encontrado com o codigo: " + codigo));
    }

    public Kart salvar(Kart kart) {
        return repository.save(kart);
    }

    public Kart atualizar(Integer codigo, Kart dadosAtualizados) {
        Kart kartExistente = buscarPorId(codigo);
        if (dadosAtualizados.getNumero() != null) {
            kartExistente.setNumero(dadosAtualizados.getNumero());
        }
        kartExistente.setEstado(dadosAtualizados.getEstado());
        kartExistente.setHistorico(dadosAtualizados.getHistorico());
        return repository.save(kartExistente);
    }

    // o historico de manutencoes do kart sai junto com ele
    @Transactional
    public void deletar(Integer codigo) {
        Kart kart = buscarPorId(codigo);
        manutencaoRepository.deleteAll(manutencaoRepository.findByKart_Codigo(codigo));
        repository.delete(kart);
    }
}
