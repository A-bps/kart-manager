package com.fatec.speedpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Senha esquecida: quem sabe o e-mail e o CPF do cadastro define uma senha nova. */
public record RedefinirSenhaRequest(
        @NotBlank @Size(max = 100) String email,
        @NotBlank @Pattern(regexp = "\\d{11}", message = "CPF deve ter 11 dígitos") String cpf,
        @NotBlank @Size(min = 6, max = 72) String novaSenha) {

    public RedefinirSenhaRequest {
        cpf = cpf == null ? null : cpf.replaceAll("\\D", "");
    }
}
