package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.ClienteRequest;
import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.PessoaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;
    private final PessoaRepository pessoaRepository;

    public List<Cliente> listarTodos() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Integer pessoaCodigo) {
        return repository.findById(pessoaCodigo)
                .orElseThrow(() -> new NoSuchElementException("Cliente nao encontrado com o codigo: " + pessoaCodigo));
    }

    public Cliente salvar(ClienteRequest request) {
        if (repository.existsById(request.pessoaCodigo())) {
            throw new IllegalArgumentException("Pessoa " + request.pessoaCodigo() + " ja esta cadastrada como cliente.");
        }
        Pessoa pessoa = buscarPessoa(request.pessoaCodigo());
        Cliente cliente = new Cliente(pessoa, request.dataNascimento());
        return repository.save(cliente);
    }

    public Cliente atualizar(Integer pessoaCodigo, ClienteRequest request) {
        Cliente clienteExistente = buscarPorId(pessoaCodigo);
        clienteExistente.setDataNascimento(request.dataNascimento());
        return repository.save(clienteExistente);
    }

    public void deletar(Integer pessoaCodigo) {
        Cliente cliente = buscarPorId(pessoaCodigo);
        repository.delete(cliente);
    }

    private Pessoa buscarPessoa(Integer codigo) {
        return pessoaRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Pessoa nao encontrada com o codigo: " + codigo));
    }
}
