package com.fatec.speedpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CepRequest(
        @NotBlank @Pattern(regexp = "\\d{8}", message = "deve ter 8 dígitos") String numero,
        @NotNull Integer cidadeCodigo) {
}
