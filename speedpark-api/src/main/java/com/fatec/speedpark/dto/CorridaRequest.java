package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record CorridaRequest(
        BigDecimal preco,
        LocalDate data,
        LocalTime horario,
        Integer pistaNr,
        Integer funcionarioCodigo) {
}
