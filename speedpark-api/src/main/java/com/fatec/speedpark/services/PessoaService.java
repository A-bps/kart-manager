package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.PessoaRequest;
import com.fatec.speedpark.entities.Cep;
import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.repositories.CepRepository;
import com.fatec.speedpark.repositories.PessoaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PessoaService {

    private final PessoaRepository repository;
    private final CepRepository cepRepository;

    public List<Pessoa> listarTodas() {
        return repository.findAll();
    }

    public Pessoa buscarPorId(Integer codigo) {
        return repository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Pessoa nao encontrada com o codigo: " + codigo));
    }

    public Pessoa salvar(PessoaRequest request) {
        if (repository.existsByCpf(request.cpf())) {
            throw new IllegalArgumentException("Ja existe pessoa cadastrada com o CPF: " + request.cpf());
        }
        Cep cep = buscarCep(request.cepNumero());
        Pessoa pessoa = new Pessoa(null, request.nome(), request.cpf(), request.email(), request.fone(), cep);
        return repository.save(pessoa);
    }

    public Pessoa atualizar(Integer codigo, PessoaRequest request) {
        Pessoa pessoaExistente = buscarPorId(codigo);
        pessoaExistente.setNome(request.nome());
        pessoaExistente.setEmail(request.email());
        pessoaExistente.setFone(request.fone());
        pessoaExistente.setCep(buscarCep(request.cepNumero()));
        return repository.save(pessoaExistente);
    }

    public void deletar(Integer codigo) {
        Pessoa pessoa = buscarPorId(codigo);
        repository.delete(pessoa);
    }

    private Cep buscarCep(String numero) {
        return cepRepository.findById(numero)
                .orElseThrow(() -> new NoSuchElementException("CEP nao encontrado: " + numero));
    }
}
