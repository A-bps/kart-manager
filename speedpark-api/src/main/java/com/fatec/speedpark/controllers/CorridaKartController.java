package com.fatec.speedpark.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.CorridaKartRequest;
import com.fatec.speedpark.entities.CorridaKart;
import com.fatec.speedpark.services.CorridaKartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/corridas-karts")
@RequiredArgsConstructor
public class CorridaKartController {

    private final CorridaKartService service;

    @GetMapping
    public ResponseEntity<List<CorridaKart>> listar(
            @RequestParam(required = false) Integer corridaNr,
            @RequestParam(required = false) Integer kartCodigo) {
        if (corridaNr != null) {
            return ResponseEntity.ok(service.listarPorCorrida(corridaNr));
        }
        if (kartCodigo != null) {
            return ResponseEntity.ok(service.listarPorKart(kartCodigo));
        }
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{corridaNr}/{kartCodigo}")
    public ResponseEntity<CorridaKart> buscarPorId(@PathVariable Integer corridaNr,
            @PathVariable Integer kartCodigo) {
        return ResponseEntity.ok(service.buscarPorId(corridaNr, kartCodigo));
    }

    @PostMapping
    public ResponseEntity<CorridaKart> criar(@RequestBody CorridaKartRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @DeleteMapping("/{corridaNr}/{kartCodigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer corridaNr, @PathVariable Integer kartCodigo) {
        service.deletar(corridaNr, kartCodigo);
        return ResponseEntity.noContent().build();
    }
}
