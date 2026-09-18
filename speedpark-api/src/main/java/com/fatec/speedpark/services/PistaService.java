package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.repositories.PistaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PistaService {

    private final PistaRepository repository;

    public List<Pista> listarTodas() {
        return repository.findAll();
    }

    public Pista buscarPorId(Integer nr) {
        return repository.findById(nr)
                .orElseThrow(() -> new NoSuchElementException("Pista nao encontrada com o numero: " + nr));
    }

    public Pista salvar(Pista pista) {
        return repository.save(pista);
    }

    public Pista atualizar(Integer nr, Pista dadosAtualizados) {
        Pista pistaExistente = buscarPorId(nr);
        pistaExistente.setNome(dadosAtualizados.getNome());
        return repository.save(pistaExistente);
    }

    public void deletar(Integer nr) {
        Pista pista = buscarPorId(nr);
        repository.delete(pista);
    }
}
