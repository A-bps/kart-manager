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
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.FaturamentoRequest;
import com.fatec.speedpark.dto.FaturamentoView;
import com.fatec.speedpark.services.FaturamentoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Financeiro: so admin (regra no SecurityConfig). */
@RestController
@RequestMapping("/api/faturamento")
@RequiredArgsConstructor
public class FaturamentoController {

    private final FaturamentoService service;

    @GetMapping
    public ResponseEntity<List<FaturamentoView>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @PostMapping
    public ResponseEntity<FaturamentoView> criar(@Valid @RequestBody FaturamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FaturamentoView> atualizar(@PathVariable Integer id,
            @Valid @RequestBody FaturamentoRequest request) {
        return ResponseEntity.ok(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
