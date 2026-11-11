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

/** Relatorios do admin: lidos das views, das functions e dos logs das triggers do banco (so admin). */
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

    @GetMapping("/financeiro")
    public ResponseEntity<List<Map<String, Object>>> financeiro() {
        return ResponseEntity.ok(service.financeiro());
    }

    @GetMapping("/frota")
    public ResponseEntity<List<Map<String, Object>>> frota() {
        return ResponseEntity.ok(service.frota());
    }

    @GetMapping("/agenda")
    public ResponseEntity<List<Map<String, Object>>> agenda(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(service.agenda(data == null ? LocalDate.now() : data));
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


    @GetMapping("/auditoria/faturamento")
    public ResponseEntity<List<Map<String, Object>>> auditoriaFaturamento() {
        return ResponseEntity.ok(service.auditoriaFaturamento());
    }

    @GetMapping("/auditoria/karts")
    public ResponseEntity<List<Map<String, Object>>> auditoriaKarts() {
        return ResponseEntity.ok(service.auditoriaKarts());
    }
}
