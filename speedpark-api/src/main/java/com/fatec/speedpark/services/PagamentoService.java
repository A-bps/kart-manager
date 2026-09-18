package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.PagamentoRequest;
import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.Corrida;
import com.fatec.speedpark.entities.Pagamento;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.CorridaRepository;
import com.fatec.speedpark.repositories.PagamentoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository repository;
    private final ClienteRepository clienteRepository;
    private final CorridaRepository corridaRepository;

    public List<Pagamento> listarTodos() {
        return repository.findAll();
    }

    public List<Pagamento> listarPorCliente(Integer clienteCodigo) {
        return repository.findByCliente_PessoaCodigo(clienteCodigo);
    }

    public List<Pagamento> listarPorCorrida(Integer corridaNr) {
        return repository.findByCorrida_Nr(corridaNr);
    }

    public Pagamento buscarPorId(Integer codigo) {
        return repository.findById(codigo)
                .orElseThrow(() -> new NoSuchElementException("Pagamento nao encontrado com o codigo: " + codigo));
    }

    public Pagamento salvar(PagamentoRequest request) {
        Cliente cliente = buscarCliente(request.clienteCodigo());
        Corrida corrida = buscarCorrida(request.corridaNr());
        Pagamento pagamento = new Pagamento(request.valor(), request.status(), request.formaPagamento(), cliente,
                corrida);
        return repository.save(pagamento);
    }

    public Pagamento atualizar(Integer codigo, PagamentoRequest request) {
        Pagamento existente = buscarPorId(codigo);
        existente.setValor(request.valor());
        existente.setStatus(request.status());
        existente.setFormaPagamento(request.formaPagamento());
        existente.setCliente(buscarCliente(request.clienteCodigo()));
        existente.setCorrida(buscarCorrida(request.corridaNr()));
        return repository.save(existente);
    }

    public void deletar(Integer codigo) {
        Pagamento pagamento = buscarPorId(codigo);
        repository.delete(pagamento);
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
