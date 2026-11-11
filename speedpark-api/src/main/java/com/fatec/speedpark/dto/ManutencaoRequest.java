package com.fatec.speedpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ManutencaoRequest(
        @NotBlank @Size(max = 50) String status,
        @NotNull @PositiveOrZero BigDecimal valor,
        @Size(max = 50) String formaPagamento,
        @NotNull Integer kartCodigo) {
}
