package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.CidadeRequest;
import com.fatec.speedpark.entities.Cidade;
import com.fatec.speedpark.entities.Uf;
import com.fatec.speedpark.repositories.CidadeRepository;
import com.fatec.speedpark.repositories.UfRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CidadeService {

    private final CidadeRepository repository;
    private final UfRepository ufRepository;

    public List<Cidade> listarTodas() {
        return repository.findAll();
    }

    public Cidade buscarPorId(Integer codigo) {
        return repository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Cidade nao encontrada com o codigo: " + codigo));
    }

    public Cidade salvar(CidadeRequest request) {
        Uf uf = buscarUf(request.ufSigla());
        Cidade cidade = new Cidade(null, request.nome(), uf);
        return repository.save(cidade);
    }

    public Cidade atualizar(Integer codigo, CidadeRequest request) {
        Cidade cidadeExistente = buscarPorId(codigo);
        cidadeExistente.setNome(request.nome());
        cidadeExistente.setUf(buscarUf(request.ufSigla()));
        return repository.save(cidadeExistente);
    }

    public void deletar(Integer codigo) {
        Cidade cidade = buscarPorId(codigo);
        repository.delete(cidade);
    }

    private Uf buscarUf(String sigla) {
        return ufRepository.findById(sigla)
                .orElseThrow(() -> new NoSuchElementException("UF nao encontrada com a sigla: " + sigla));
    }
}
