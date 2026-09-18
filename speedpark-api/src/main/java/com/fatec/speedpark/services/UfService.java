package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.entities.Uf;
import com.fatec.speedpark.repositories.UfRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UfService {

    private final UfRepository repository;

    public List<Uf> listarTodas() {
        return repository.findAll();
    }

    public Uf buscarPorSigla(String sigla) {
        return repository.findById(sigla)
                .orElseThrow(() -> new NoSuchElementException("UF nao encontrada com a sigla: " + sigla));
    }

    public Uf salvar(Uf uf) {
        if (repository.existsById(uf.getSigla())) {
            throw new IllegalArgumentException("Ja existe UF cadastrada com a sigla: " + uf.getSigla());
        }
        return repository.save(uf);
    }

    public Uf atualizar(String sigla, Uf dadosAtualizados) {
        Uf ufExistente = buscarPorSigla(sigla);
        ufExistente.setNome(dadosAtualizados.getNome());
        return repository.save(ufExistente);
    }

    public void deletar(String sigla) {
        Uf uf = buscarPorSigla(sigla);
        repository.delete(uf);
    }
}
