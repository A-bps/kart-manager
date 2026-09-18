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

import com.fatec.speedpark.dto.CepRequest;
import com.fatec.speedpark.entities.Cep;
import com.fatec.speedpark.services.CepService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ceps")
@RequiredArgsConstructor
public class CepController {

    private final CepService service;

    @GetMapping
    public ResponseEntity<List<Cep>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{numero}")
    public ResponseEntity<Cep> buscarPorId(@PathVariable String numero) {
        return ResponseEntity.ok(service.buscarPorId(numero));
    }

    @PostMapping
    public ResponseEntity<Cep> criar(@RequestBody CepRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{numero}")
    public ResponseEntity<Cep> atualizar(@PathVariable String numero, @RequestBody CepRequest request) {
        return ResponseEntity.ok(service.atualizar(numero, request));
    }

    @DeleteMapping("/{numero}")
    public ResponseEntity<Void> deletar(@PathVariable String numero) {
        service.deletar(numero);
        return ResponseEntity.noContent().build();
    }
}
