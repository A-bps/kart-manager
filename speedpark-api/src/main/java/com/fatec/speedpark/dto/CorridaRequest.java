package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CorridaRequest(
        @NotNull @Positive BigDecimal preco,
        @NotNull LocalDate data,
        @NotNull LocalTime horario,
        @NotNull Integer pistaNr,
        @NotNull Integer funcionarioCodigo) {
}
