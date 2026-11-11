package com.fatec.speedpark.dto;

import jakarta.validation.constraints.NotNull;

public record CorridaKartRequest(@NotNull Integer corridaNr, @NotNull Integer kartCodigo) {
}
