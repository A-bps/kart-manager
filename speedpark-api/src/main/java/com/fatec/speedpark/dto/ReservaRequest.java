package com.fatec.speedpark.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Piloto: formato, qtd e formaPagamento sao obrigatorios (validado no servico). Quem corre e o proprio piloto
 * ou o dependente indicado em dependenteId; o nome e a categoria vem do cadastro, nao do que o front mandar.
 * Admin pode mandar so o nome.
 */
public record ReservaRequest(
        @NotNull LocalDate data,
        @NotNull LocalTime hora,
        @NotBlank @Size(max = 20) String pistaId,
        @NotBlank @Size(max = 100) String nome,
        Integer dependenteId,
        @Pattern(regexp = "tempo|voltas") String formato,
        @Positive Integer qtd,
        @Pattern(regexp = "pix|cartao_debito|cartao_credito|dinheiro") String formaPagamento) {
}
