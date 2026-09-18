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

import com.fatec.speedpark.dto.ClienteCorridaRequest;
import com.fatec.speedpark.entities.ClienteCorrida;
import com.fatec.speedpark.services.ClienteCorridaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/clientes-corridas")
@RequiredArgsConstructor
public class ClienteCorridaController {

    private final ClienteCorridaService service;

    @GetMapping
    public ResponseEntity<List<ClienteCorrida>> listar(
            @RequestParam(required = false) Integer clienteCodigo,
            @RequestParam(required = false) Integer corridaNr) {
        if (clienteCodigo != null) {
            return ResponseEntity.ok(service.listarPorCliente(clienteCodigo));
        }
        if (corridaNr != null) {
            return ResponseEntity.ok(service.listarPorCorrida(corridaNr));
        }
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{clienteCodigo}/{corridaNr}")
    public ResponseEntity<ClienteCorrida> buscarPorId(@PathVariable Integer clienteCodigo,
            @PathVariable Integer corridaNr) {
        return ResponseEntity.ok(service.buscarPorId(clienteCodigo, corridaNr));
    }

    @PostMapping
    public ResponseEntity<ClienteCorrida> criar(@RequestBody ClienteCorridaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(request));
    }

    @PutMapping("/{clienteCodigo}/{corridaNr}")
    public ResponseEntity<ClienteCorrida> atualizar(@PathVariable Integer clienteCodigo,
            @PathVariable Integer corridaNr, @RequestBody ClienteCorridaRequest request) {
        return ResponseEntity.ok(service.atualizar(clienteCodigo, corridaNr, request));
    }

    @DeleteMapping("/{clienteCodigo}/{corridaNr}")
    public ResponseEntity<Void> deletar(@PathVariable Integer clienteCodigo, @PathVariable Integer corridaNr) {
        service.deletar(clienteCodigo, corridaNr);
        return ResponseEntity.noContent().build();
    }
}
