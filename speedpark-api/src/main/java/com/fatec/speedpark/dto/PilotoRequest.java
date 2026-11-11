package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Cadastro de piloto (site e painel admin). O CPF pode vir com mascara; so os dígitos sao guardados. */
public record PilotoRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Pattern(regexp = "\\d{11}", message = "CPF deve ter 11 dígitos") String cpf,
        @NotBlank @Email @Size(max = 100) String email,
        @NotBlank @Size(max = 20) String telefone,
        @NotNull @Past LocalDate nascimento,
        @Min(100) @Max(250) Integer altura,
        @DecimalMin("20") @DecimalMax("200") BigDecimal peso,
        @NotBlank @Size(min = 6, max = 72) String senha) {

    public PilotoRequest {
        cpf = cpf == null ? null : cpf.replaceAll("\\D", "");
        email = email == null ? null : email.trim().toLowerCase();
    }
}
