package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.ClienteCorridaRequest;
import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.ClienteCorrida;
import com.fatec.speedpark.entities.ClienteCorridaId;
import com.fatec.speedpark.entities.Corrida;
import com.fatec.speedpark.repositories.ClienteCorridaRepository;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.CorridaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClienteCorridaService {

    private final ClienteCorridaRepository repository;
    private final ClienteRepository clienteRepository;
    private final CorridaRepository corridaRepository;

    public List<ClienteCorrida> listarTodas() {
        return repository.findAll();
    }

    public List<ClienteCorrida> listarPorCliente(Integer clienteCodigo) {
        return repository.findByCliente_PessoaCodigo(clienteCodigo);
    }

    public List<ClienteCorrida> listarPorCorrida(Integer corridaNr) {
        return repository.findByCorrida_Nr(corridaNr);
    }

    public ClienteCorrida buscarPorId(Integer clienteCodigo, Integer corridaNr) {
        ClienteCorridaId id = new ClienteCorridaId(clienteCodigo, corridaNr);
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Inscricao nao encontrada para cliente " + clienteCodigo + " na corrida " + corridaNr));
    }

    public ClienteCorrida salvar(ClienteCorridaRequest request) {
        ClienteCorridaId id = new ClienteCorridaId(request.clienteCodigo(), request.corridaNr());
        if (repository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Cliente " + request.clienteCodigo() + " ja esta inscrito na corrida " + request.corridaNr());
        }
        Cliente cliente = buscarCliente(request.clienteCodigo());
        Corrida corrida = buscarCorrida(request.corridaNr());
        ClienteCorrida clienteCorrida = new ClienteCorrida(cliente, corrida, request.melhorVolta(),
                request.penalidade(), request.tempo(), request.posicao());
        return repository.save(clienteCorrida);
    }

    public ClienteCorrida atualizar(Integer clienteCodigo, Integer corridaNr, ClienteCorridaRequest request) {
        ClienteCorrida existente = buscarPorId(clienteCodigo, corridaNr);
        existente.setMelhorVolta(request.melhorVolta());
        existente.setPenalidade(request.penalidade());
        existente.setTempo(request.tempo());
        existente.setPosicao(request.posicao());
        return repository.save(existente);
    }

    public void deletar(Integer clienteCodigo, Integer corridaNr) {
        ClienteCorrida clienteCorrida = buscarPorId(clienteCodigo, corridaNr);
        repository.delete(clienteCorrida);
    }

    private Cliente buscarCliente(Integer codigo) {
        return clienteRepository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Cliente nao encontrado com o codigo: " + codigo));
    }

    private Corrida buscarCorrida(Integer nr) {
        return corridaRepository.findById(nr)
                .orElseThrow(() -> new NoSuchElementException("Corrida nao encontrada com o numero: " + nr));
    }
}
