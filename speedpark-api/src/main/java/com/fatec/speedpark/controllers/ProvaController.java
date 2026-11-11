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
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.EncerrarProvaRequest;
import com.fatec.speedpark.dto.ProvaRequest;
import com.fatec.speedpark.dto.ProvaView;
import com.fatec.speedpark.services.ProvaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Corridas disputadas. Iniciar/encerrar/listar ativas: so admin.
 * O historico e publico (alimenta o ranking da pagina inicial) — regra no SecurityConfig.
 */
@RestController
@RequestMapping("/api/provas")
@RequiredArgsConstructor
public class ProvaController {

    private final ProvaService service;

    @GetMapping("/ativas")
    public ResponseEntity<List<ProvaView>> ativas() {
        return ResponseEntity.ok(service.listarAtivas());
    }

    @GetMapping("/historico")
    public ResponseEntity<List<ProvaView>> historico() {
        return ResponseEntity.ok(service.listarHistorico());
    }

    @PostMapping
    public ResponseEntity<ProvaView> iniciar(@Valid @RequestBody ProvaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.iniciar(request));
    }

    @PostMapping("/{id}/encerrar")
    public ResponseEntity<ProvaView> encerrar(@PathVariable Integer id, @Valid @RequestBody EncerrarProvaRequest request) {
        return ResponseEntity.ok(service.encerrar(id, request.posicoes()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
