package com.fatec.speedpark.services;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.CorridaRequest;
import com.fatec.speedpark.entities.Corrida;
import com.fatec.speedpark.entities.Funcionario;
import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.repositories.CorridaRepository;
import com.fatec.speedpark.repositories.FuncionarioRepository;
import com.fatec.speedpark.repositories.PistaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CorridaService {

    private final CorridaRepository repository;
    private final PistaRepository pistaRepository;
    private final FuncionarioRepository funcionarioRepository;

    public List<Corrida> listarTodas() {
        return repository.findAll();
    }

    public List<Corrida> listarPorData(LocalDate data) {
        return repository.findByData(data);
    }

    public Corrida buscarPorId(Integer nr) {
        return repository.findById(nr)
                .orElseThrow(() -> new NoSuchElementException("Corrida nao encontrada com o numero: " + nr));
    }

    public Corrida salvar(CorridaRequest request) {
        if (request.data().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Nao e possivel agendar uma corrida em uma data passada.");
        }
        Pista pista = buscarPista(request.pistaNr());
        Funcionario funcionario = buscarFuncionario(request.funcionarioCodigo());
        Corrida corrida = new Corrida(request.preco(), request.data(), request.horario(), pista, funcionario);
        return repository.save(corrida);
    }

    public Corrida atualizar(Integer nr, CorridaRequest request) {
        Corrida corridaExistente = buscarPorId(nr);
        corridaExistente.setPreco(request.preco());
        corridaExistente.setData(request.data());
        corridaExistente.setHorario(request.horario());
        corridaExistente.setPista(buscarPista(request.pistaNr()));
        corridaExistente.setFuncionario(buscarFuncionario(request.funcionarioCodigo()));
        return repository.save(corridaExistente);
    }

    public void deletar(Integer nr) {
        Corrida corrida = buscarPorId(nr);
        repository.delete(corrida);
    }

    private Pista buscarPista(Integer nr) {
        return pistaRepository.findById(nr)
                .orElseThrow(() -> new NoSuchElementException("Pista nao encontrada com o numero: " + nr));
    }

    private Funcionario buscarFuncionario(Integer codigo) {
        return funcionarioRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Funcionario nao encontrado com o codigo: " + codigo));
    }
}
