package com.fatec.speedpark.dto;

import java.time.LocalTime;

public record ClienteCorridaRequest(
        Integer clienteCodigo,
        Integer corridaNr,
        LocalTime melhorVolta,
        String penalidade,
        LocalTime tempo,
        Integer posicao) {
}
