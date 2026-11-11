package com.fatec.speedpark.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.DependenteRequest;
import com.fatec.speedpark.dto.DependenteView;
import com.fatec.speedpark.services.DependenteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dependentes")
@RequiredArgsConstructor
public class DependenteController {

    private final DependenteService service;

    @GetMapping
    public ResponseEntity<List<DependenteView>> listar(Authentication auth) {
        return ResponseEntity.ok(service.listar(auth));
    }

    @PostMapping
    public ResponseEntity<DependenteView> criar(@Valid @RequestBody DependenteRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request, auth));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DependenteView> atualizar(@PathVariable Integer id, @Valid @RequestBody DependenteRequest request,
            Authentication auth) {
        return ResponseEntity.ok(service.atualizar(id, request, auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Integer id, Authentication auth) {
        service.remover(id, auth);
        return ResponseEntity.noContent().build();
    }
}
