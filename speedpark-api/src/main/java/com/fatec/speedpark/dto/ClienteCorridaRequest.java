package com.fatec.speedpark.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ClienteCorridaRequest(
        @NotNull Integer clienteCodigo,
        @NotNull Integer corridaNr,
        LocalTime melhorVolta,
        @Size(max = 100) String penalidade,
        LocalTime tempo,
        @Positive Integer posicao) {
}
