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

import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.services.PistaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pistas")
@RequiredArgsConstructor
public class PistaController {

    private final PistaService service;

    @GetMapping
    public ResponseEntity<List<Pista>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{nr}")
    public ResponseEntity<Pista> buscarPorId(@PathVariable Integer nr) {
        return ResponseEntity.ok(service.buscarPorId(nr));
    }

    @PostMapping
    public ResponseEntity<Pista> criar(@RequestBody Pista pista) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(pista));
    }

    @PutMapping("/{nr}")
    public ResponseEntity<Pista> atualizar(@PathVariable Integer nr, @RequestBody Pista pista) {
        return ResponseEntity.ok(service.atualizar(nr, pista));
    }

    @DeleteMapping("/{nr}")
    public ResponseEntity<Void> deletar(@PathVariable Integer nr) {
        service.deletar(nr);
        return ResponseEntity.noContent().build();
    }
}
