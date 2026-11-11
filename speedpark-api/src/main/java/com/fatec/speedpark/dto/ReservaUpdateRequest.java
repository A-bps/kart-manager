package com.fatec.speedpark.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

/** Remarcar uma reserva: so a data e o horario mudam (pista, participante e cobranca continuam). */
public record ReservaUpdateRequest(@NotNull LocalDate data, @NotNull LocalTime hora) {
}
