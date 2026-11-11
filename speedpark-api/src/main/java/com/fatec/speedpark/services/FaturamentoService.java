package com.fatec.speedpark.services;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.FaturamentoRequest;
import com.fatec.speedpark.dto.FaturamentoView;
import com.fatec.speedpark.entities.Faturamento;
import com.fatec.speedpark.repositories.FaturamentoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FaturamentoService {

    private final FaturamentoRepository repository;

    public List<FaturamentoView> listar() {
        return repository.findAll().stream().map(FaturamentoView::de).toList();
    }

    public FaturamentoView criar(FaturamentoRequest r) {
        if (r.valor() == null) {
            throw new IllegalArgumentException("Informe o valor.");
        }
        Faturamento f = new Faturamento();
        f.setValor(r.valor());
        f.setDescricao(r.descricao());
        f.setFormaPagamento(r.formaPagamento() == null ? "pix" : r.formaPagamento());
        f.setStatus(r.status() == null ? "pago" : r.status());
        f.setData(r.data() == null ? LocalDate.now() : r.data());
        return FaturamentoView.de(repository.save(f));
    }

    // so os campos enviados mudam
    public FaturamentoView atualizar(Integer id, FaturamentoRequest r) {
        Faturamento f = buscar(id);
        if (r.valor() != null) f.setValor(r.valor());
        if (r.descricao() != null) f.setDescricao(r.descricao());
        if (r.formaPagamento() != null) f.setFormaPagamento(r.formaPagamento());
        if (r.status() != null) f.setStatus(r.status());
        if (r.data() != null) f.setData(r.data());
        return FaturamentoView.de(repository.save(f));
    }

    public void deletar(Integer id) {
        repository.delete(buscar(id));
    }

    private Faturamento buscar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Lançamento não encontrado: " + id));
    }
}
