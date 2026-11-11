package com.fatec.speedpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PagamentoRequest(
        @NotNull @Positive BigDecimal valor,
        @NotBlank @Size(max = 50) String status,
        @NotBlank @Size(max = 50) String formaPagamento,
        @NotNull Integer clienteCodigo,
        @NotNull Integer corridaNr) {
}
