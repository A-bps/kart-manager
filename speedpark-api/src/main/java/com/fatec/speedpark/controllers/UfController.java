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

import com.fatec.speedpark.entities.Uf;
import com.fatec.speedpark.services.UfService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ufs")
@RequiredArgsConstructor
public class UfController {

    private final UfService service;

    @GetMapping
    public ResponseEntity<List<Uf>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{sigla}")
    public ResponseEntity<Uf> buscarPorSigla(@PathVariable String sigla) {
        return ResponseEntity.ok(service.buscarPorSigla(sigla));
    }

    @PostMapping
    public ResponseEntity<Uf> criar(@RequestBody Uf uf) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(uf));
    }

    @PutMapping("/{sigla}")
    public ResponseEntity<Uf> atualizar(@PathVariable String sigla, @RequestBody Uf uf) {
        return ResponseEntity.ok(service.atualizar(sigla, uf));
    }

    @DeleteMapping("/{sigla}")
    public ResponseEntity<Void> deletar(@PathVariable String sigla) {
        service.deletar(sigla);
        return ResponseEntity.noContent().build();
    }
}
