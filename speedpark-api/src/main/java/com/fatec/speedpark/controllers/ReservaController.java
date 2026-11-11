package com.fatec.speedpark.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.ReservaRequest;
import com.fatec.speedpark.dto.ReservaView;
import com.fatec.speedpark.services.ReservaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService service;

    @GetMapping
    public ResponseEntity<List<ReservaView>> listar(Authentication auth) {
        return ResponseEntity.ok(service.listar(auth));
    }

    @PostMapping
    public ResponseEntity<ReservaView> criar(@Valid @RequestBody ReservaRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request, auth));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Integer id, Authentication auth) {
        service.cancelar(id, auth);
        return ResponseEntity.noContent().build();
    }
}
