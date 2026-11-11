package com.fatec.speedpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record GerenteRequest(@NotNull Integer funcionarioCodigo, @NotNull @PositiveOrZero BigDecimal salarioExtra) {
}
