package com.fatec.speedpark.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.PagamentoRequest;
import com.fatec.speedpark.entities.Pagamento;
import com.fatec.speedpark.services.PagamentoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService service;

    @GetMapping
    public ResponseEntity<List<Pagamento>> listar(
            @RequestParam(required = false) Integer clienteCodigo,
            @RequestParam(required = false) Integer corridaNr) {
        if (clienteCodigo != null) {
            return ResponseEntity.ok(service.listarPorCliente(clienteCodigo));
        }
        if (corridaNr != null) {
            return ResponseEntity.ok(service.listarPorCorrida(corridaNr));
        }
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<Pagamento> buscarPorId(@PathVariable Integer codigo) {
        return ResponseEntity.ok(service.buscarPorId(codigo));
    }

    @PostMapping
    public ResponseEntity<Pagamento> criar(@RequestBody PagamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<Pagamento> atualizar(@PathVariable Integer codigo, @RequestBody PagamentoRequest request) {
        return ResponseEntity.ok(service.atualizar(codigo, request));
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer codigo) {
        service.deletar(codigo);
        return ResponseEntity.noContent().build();
    }
}
