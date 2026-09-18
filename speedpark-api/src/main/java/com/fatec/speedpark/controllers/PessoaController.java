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

import com.fatec.speedpark.dto.PessoaRequest;
import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.services.PessoaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pessoas")
@RequiredArgsConstructor
public class PessoaController {

    private final PessoaService service;

    @GetMapping
    public ResponseEntity<List<Pessoa>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<Pessoa> buscarPorId(@PathVariable Integer codigo) {
        return ResponseEntity.ok(service.buscarPorId(codigo));
    }

    @PostMapping
    public ResponseEntity<Pessoa> criar(@RequestBody PessoaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<Pessoa> atualizar(@PathVariable Integer codigo, @RequestBody PessoaRequest request) {
        return ResponseEntity.ok(service.atualizar(codigo, request));
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer codigo) {
        service.deletar(codigo);
        return ResponseEntity.noContent().build();
    }
}
