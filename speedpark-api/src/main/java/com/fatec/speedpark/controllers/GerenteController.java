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

import com.fatec.speedpark.dto.GerenteRequest;
import com.fatec.speedpark.entities.Gerente;
import com.fatec.speedpark.services.GerenteService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/gerentes")
@RequiredArgsConstructor
public class GerenteController {

    private final GerenteService service;

    @GetMapping
    public ResponseEntity<List<Gerente>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{pessoaCodigo}")
    public ResponseEntity<Gerente> buscarPorId(@PathVariable Integer pessoaCodigo) {
        return ResponseEntity.ok(service.buscarPorId(pessoaCodigo));
    }

    @PostMapping
    public ResponseEntity<Gerente> criar(@RequestBody GerenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{pessoaCodigo}")
    public ResponseEntity<Gerente> atualizar(@PathVariable Integer pessoaCodigo, @RequestBody GerenteRequest request) {
        return ResponseEntity.ok(service.atualizar(pessoaCodigo, request));
    }

    @DeleteMapping("/{pessoaCodigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer pessoaCodigo) {
        service.deletar(pessoaCodigo);
        return ResponseEntity.noContent().build();
    }
}
