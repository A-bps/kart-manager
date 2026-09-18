package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.CorridaKartRequest;
import com.fatec.speedpark.entities.Corrida;
import com.fatec.speedpark.entities.CorridaKart;
import com.fatec.speedpark.entities.CorridaKartId;
import com.fatec.speedpark.entities.Kart;
import com.fatec.speedpark.repositories.CorridaKartRepository;
import com.fatec.speedpark.repositories.CorridaRepository;
import com.fatec.speedpark.repositories.KartRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CorridaKartService {

    private final CorridaKartRepository repository;
    private final CorridaRepository corridaRepository;
    private final KartRepository kartRepository;

    public List<CorridaKart> listarTodos() {
        return repository.findAll();
    }

    public List<CorridaKart> listarPorCorrida(Integer corridaNr) {
        return repository.findByCorrida_Nr(corridaNr);
    }

    public List<CorridaKart> listarPorKart(Integer kartCodigo) {
        return repository.findByKart_Codigo(kartCodigo);
    }

    public CorridaKart buscarPorId(Integer corridaNr, Integer kartCodigo) {
        CorridaKartId id = new CorridaKartId(corridaNr, kartCodigo);
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Vinculo nao encontrado para corrida " + corridaNr + " e kart " + kartCodigo));
    }

    public CorridaKart salvar(CorridaKartRequest request) {
        CorridaKartId id = new CorridaKartId(request.corridaNr(), request.kartCodigo());
        if (repository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Kart " + request.kartCodigo() + " ja esta vinculado a corrida " + request.corridaNr());
        }
        Corrida corrida = buscarCorrida(request.corridaNr());
        Kart kart = buscarKart(request.kartCodigo());
        return repository.save(new CorridaKart(corrida, kart));
    }

    public void deletar(Integer corridaNr, Integer kartCodigo) {
        CorridaKart corridaKart = buscarPorId(corridaNr, kartCodigo);
        repository.delete(corridaKart);
    }

    private Corrida buscarCorrida(Integer nr) {
        return corridaRepository.findById(nr)
                .orElseThrow(() -> new NoSuchElementException("Corrida nao encontrada com o numero: " + nr));
    }

    private Kart buscarKart(Integer codigo) {
        return kartRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Kart nao encontrado com o codigo: " + codigo));
    }
}
