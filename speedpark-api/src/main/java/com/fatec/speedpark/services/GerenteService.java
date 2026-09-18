package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.GerenteRequest;
import com.fatec.speedpark.entities.Funcionario;
import com.fatec.speedpark.entities.Gerente;
import com.fatec.speedpark.repositories.FuncionarioRepository;
import com.fatec.speedpark.repositories.GerenteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GerenteService {

    private final GerenteRepository repository;
    private final FuncionarioRepository funcionarioRepository;

    public List<Gerente> listarTodos() {
        return repository.findAll();
    }

    public Gerente buscarPorId(Integer pessoaCodigo) {
        return repository.findById(pessoaCodigo)
                .orElseThrow(() -> new NoSuchElementException("Gerente nao encontrado com o codigo: " + pessoaCodigo));
    }

    public Gerente salvar(GerenteRequest request) {
        if (repository.existsById(request.funcionarioCodigo())) {
            throw new IllegalArgumentException(
                    "Funcionario " + request.funcionarioCodigo() + " ja esta cadastrado como gerente.");
        }
        Funcionario funcionario = buscarFuncionario(request.funcionarioCodigo());
        Gerente gerente = new Gerente(funcionario, request.salarioExtra());
        return repository.save(gerente);
    }

    public Gerente atualizar(Integer pessoaCodigo, GerenteRequest request) {
        Gerente gerenteExistente = buscarPorId(pessoaCodigo);
        gerenteExistente.setSalarioExtra(request.salarioExtra());
        return repository.save(gerenteExistente);
    }

    public void deletar(Integer pessoaCodigo) {
        Gerente gerente = buscarPorId(pessoaCodigo);
        repository.delete(gerente);
    }

    private Funcionario buscarFuncionario(Integer codigo) {
        return funcionarioRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Funcionario nao encontrado com o codigo: " + codigo));
    }
}
