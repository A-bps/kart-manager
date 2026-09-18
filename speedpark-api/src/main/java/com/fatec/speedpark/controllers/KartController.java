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

import com.fatec.speedpark.entities.Kart;
import com.fatec.speedpark.services.KartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/karts")
@RequiredArgsConstructor
public class KartController {

    private final KartService service;

    @GetMapping
    public ResponseEntity<List<Kart>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<Kart> buscarPorId(@PathVariable Integer codigo) {
        return ResponseEntity.ok(service.buscarPorId(codigo));
    }

    @PostMapping
    public ResponseEntity<Kart> criar(@RequestBody Kart kart) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(kart));
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<Kart> atualizar(@PathVariable Integer codigo, @RequestBody Kart kart) {
        return ResponseEntity.ok(service.atualizar(codigo, kart));
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer codigo) {
        service.deletar(codigo);
        return ResponseEntity.noContent().build();
    }
}
