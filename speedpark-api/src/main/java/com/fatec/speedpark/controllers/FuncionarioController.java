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

import com.fatec.speedpark.dto.FuncionarioRequest;
import com.fatec.speedpark.entities.Funcionario;
import com.fatec.speedpark.services.FuncionarioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/funcionarios")
@RequiredArgsConstructor
public class FuncionarioController {

    private final FuncionarioService service;

    @GetMapping
    public ResponseEntity<List<Funcionario>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{pessoaCodigo}")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Integer pessoaCodigo) {
        return ResponseEntity.ok(service.buscarPorId(pessoaCodigo));
    }

    @PostMapping
    public ResponseEntity<Funcionario> criar(@RequestBody FuncionarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{pessoaCodigo}")
    public ResponseEntity<Funcionario> atualizar(@PathVariable Integer pessoaCodigo,
            @RequestBody FuncionarioRequest request) {
        return ResponseEntity.ok(service.atualizar(pessoaCodigo, request));
    }

    @DeleteMapping("/{pessoaCodigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer pessoaCodigo) {
        service.deletar(pessoaCodigo);
        return ResponseEntity.noContent().build();
    }
}
