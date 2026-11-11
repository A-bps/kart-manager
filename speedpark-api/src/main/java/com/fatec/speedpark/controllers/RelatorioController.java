package com.fatec.speedpark.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.services.RelatorioService;

import lombok.RequiredArgsConstructor;

/** Relatorios do admin: lidos da view, da function e do log da trigger do banco (so admin). */
@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService service;

    @GetMapping("/reservas")
    public ResponseEntity<List<Map<String, Object>>> reservas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate de,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ate) {
        return ResponseEntity.ok(service.reservas(de, ate));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Map<String, Object>>> ranking(
            @RequestParam(defaultValue = "1") int minimoCorridas,
            @RequestParam(required = false) String pista) {
        return ResponseEntity.ok(service.ranking(Math.max(1, minimoCorridas), pista));
    }

    @GetMapping("/auditoria/reservas")
    public ResponseEntity<List<Map<String, Object>>> auditoriaReservas() {
        return ResponseEntity.ok(service.auditoriaReservas());
    }

}
