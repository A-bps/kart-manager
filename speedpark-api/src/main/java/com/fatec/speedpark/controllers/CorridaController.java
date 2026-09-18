package com.fatec.speedpark.controllers;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.fatec.speedpark.dto.CorridaRequest;
import com.fatec.speedpark.entities.Corrida;
import com.fatec.speedpark.services.CorridaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/corridas")
@RequiredArgsConstructor
public class CorridaController {

    private final CorridaService service;

    @GetMapping
    public ResponseEntity<List<Corrida>> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(data != null ? service.listarPorData(data) : service.listarTodas());
    }

    @GetMapping("/{nr}")
    public ResponseEntity<Corrida> buscarPorId(@PathVariable Integer nr) {
        return ResponseEntity.ok(service.buscarPorId(nr));
    }

    @PostMapping
    public ResponseEntity<Corrida> criar(@RequestBody CorridaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{nr}")
    public ResponseEntity<Corrida> atualizar(@PathVariable Integer nr, @RequestBody CorridaRequest request) {
        return ResponseEntity.ok(service.atualizar(nr, request));
    }

    @DeleteMapping("/{nr}")
    public ResponseEntity<Void> deletar(@PathVariable Integer nr) {
        service.deletar(nr);
        return ResponseEntity.noContent().build();
    }
}
