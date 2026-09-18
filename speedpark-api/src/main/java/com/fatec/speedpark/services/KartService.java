package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.entities.Kart;
import com.fatec.speedpark.repositories.KartRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KartService {

    private final KartRepository repository;

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
        kartExistente.setEstado(dadosAtualizados.getEstado());
        kartExistente.setHistorico(dadosAtualizados.getHistorico());
        return repository.save(kartExistente);
    }

    public void deletar(Integer codigo) {
        Kart kart = buscarPorId(codigo);
        repository.delete(kart);
    }
}
