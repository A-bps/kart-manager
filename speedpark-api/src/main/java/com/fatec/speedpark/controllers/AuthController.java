package com.fatec.speedpark.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fatec.speedpark.dto.LoginRequest;
import com.fatec.speedpark.dto.LoginResponse;
import com.fatec.speedpark.dto.PilotoRequest;
import com.fatec.speedpark.dto.PilotoView;
import com.fatec.speedpark.dto.RedefinirSenhaRequest;
import com.fatec.speedpark.security.TokenService;
import com.fatec.speedpark.services.AuthService;
import com.fatec.speedpark.services.PilotoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PilotoService pilotoService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/registro")
    public ResponseEntity<PilotoView> registro(@Valid @RequestBody PilotoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pilotoService.registrar(request));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<PilotoView> me(Authentication auth) {
        return ResponseEntity.ok(pilotoService.buscar(TokenService.codigo(auth), auth));
    }
}
