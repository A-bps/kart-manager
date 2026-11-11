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

import com.fatec.speedpark.dto.PerfilRequest;
import com.fatec.speedpark.dto.PilotoRequest;
import com.fatec.speedpark.dto.PilotoView;
import com.fatec.speedpark.services.PilotoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** Lista, cadastro e exclusao: so admin. Ver e editar o perfil: o proprio piloto ou admin. */
@RestController
@RequestMapping("/api/pilotos")
@RequiredArgsConstructor
public class PilotoController {

    private final PilotoService service;

    @GetMapping
    public ResponseEntity<List<PilotoView>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PilotoView> buscar(@PathVariable Integer id, Authentication auth) {
        return ResponseEntity.ok(service.buscar(id, auth));
    }

    @PostMapping
    public ResponseEntity<PilotoView> cadastrar(@Valid @RequestBody PilotoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PilotoView> atualizar(@PathVariable Integer id, @Valid @RequestBody PerfilRequest request,
            Authentication auth) {
        return ResponseEntity.ok(service.atualizarPerfil(id, request, auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
