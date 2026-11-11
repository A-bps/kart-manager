package com.fatec.speedpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record FuncionarioRequest(@NotNull Integer pessoaCodigo, @NotNull @PositiveOrZero BigDecimal salario) {
}
