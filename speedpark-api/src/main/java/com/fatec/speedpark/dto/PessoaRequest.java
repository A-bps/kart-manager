package com.fatec.speedpark.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PessoaRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Pattern(regexp = "\\d{11}", message = "deve ter 11 dígitos") String cpf,
        @Email @Size(max = 100) String email,
        @Size(max = 20) String fone,
        @Pattern(regexp = "\\d{8}", message = "deve ter 8 dígitos") String cepNumero) {
}
