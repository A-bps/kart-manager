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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.ManutencaoRequest;
import com.fatec.speedpark.entities.Manutencao;
import com.fatec.speedpark.services.ManutencaoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/manutencoes")
@RequiredArgsConstructor
public class ManutencaoController {

    private final ManutencaoService service;

    @GetMapping
    public ResponseEntity<List<Manutencao>> listar(@RequestParam(required = false) Integer kartCodigo) {
        return ResponseEntity.ok(kartCodigo != null ? service.listarPorKart(kartCodigo) : service.listarTodas());
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<Manutencao> buscarPorId(@PathVariable Integer codigo) {
        return ResponseEntity.ok(service.buscarPorId(codigo));
    }

    @PostMapping
    public ResponseEntity<Manutencao> criar(@RequestBody ManutencaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<Manutencao> atualizar(@PathVariable Integer codigo,
            @RequestBody ManutencaoRequest request) {
        return ResponseEntity.ok(service.atualizar(codigo, request));
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> deletar(@PathVariable Integer codigo) {
        service.deletar(codigo);
        return ResponseEntity.noContent().build();
    }
}
