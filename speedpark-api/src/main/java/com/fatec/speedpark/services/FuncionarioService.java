package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.FuncionarioRequest;
import com.fatec.speedpark.entities.Funcionario;
import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.repositories.FuncionarioRepository;
import com.fatec.speedpark.repositories.PessoaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final PessoaRepository pessoaRepository;

    public List<Funcionario> listarTodos() {
        return repository.findAll();
    }

    public Funcionario buscarPorId(Integer pessoaCodigo) {
        return repository.findById(pessoaCodigo)
                .orElseThrow(() -> new NoSuchElementException("Funcionario nao encontrado com o codigo: " + pessoaCodigo));
    }

    public Funcionario salvar(FuncionarioRequest request) {
        if (repository.existsById(request.pessoaCodigo())) {
            throw new IllegalArgumentException("Pessoa " + request.pessoaCodigo() + " ja esta cadastrada como funcionario.");
        }
        Pessoa pessoa = buscarPessoa(request.pessoaCodigo());
        Funcionario funcionario = new Funcionario(pessoa, request.salario());
        return repository.save(funcionario);
    }

    public Funcionario atualizar(Integer pessoaCodigo, FuncionarioRequest request) {
        Funcionario funcionarioExistente = buscarPorId(pessoaCodigo);
        funcionarioExistente.setSalario(request.salario());
        return repository.save(funcionarioExistente);
    }

    public void deletar(Integer pessoaCodigo) {
        Funcionario funcionario = buscarPorId(pessoaCodigo);
        repository.delete(funcionario);
    }

    private Pessoa buscarPessoa(Integer codigo) {
        return pessoaRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Pessoa nao encontrada com o codigo: " + codigo));
    }
}
