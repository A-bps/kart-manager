package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.CepRequest;
import com.fatec.speedpark.entities.Cep;
import com.fatec.speedpark.entities.Cidade;
import com.fatec.speedpark.repositories.CepRepository;
import com.fatec.speedpark.repositories.CidadeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CepService {

    private final CepRepository repository;
    private final CidadeRepository cidadeRepository;

    public List<Cep> listarTodos() {
        return repository.findAll();
    }

    public Cep buscarPorId(String numero) {
        return repository.findById(numero)
                .orElseThrow(() -> new NoSuchElementException("CEP nao encontrado: " + numero));
    }

    public Cep salvar(CepRequest request) {
        if (repository.existsById(request.numero())) {
            throw new IllegalArgumentException("Ja existe CEP cadastrado com o numero: " + request.numero());
        }
        Cidade cidade = buscarCidade(request.cidadeCodigo());
        return repository.save(new Cep(request.numero(), cidade));
    }

    public Cep atualizar(String numero, CepRequest request) {
        Cep cepExistente = buscarPorId(numero);
        cepExistente.setCidade(buscarCidade(request.cidadeCodigo()));
        return repository.save(cepExistente);
    }

    public void deletar(String numero) {
        Cep cep = buscarPorId(numero);
        repository.delete(cep);
    }

    private Cidade buscarCidade(Integer codigo) {
        return cidadeRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Cidade nao encontrada com o codigo: " + codigo));
    }
}
