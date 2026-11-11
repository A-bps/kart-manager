package com.fatec.speedpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Campos que o piloto pode editar no proprio perfil. */
public record PerfilRequest(
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 20) String telefone,
        @Min(100) @Max(250) Integer altura,
        @DecimalMin("20") @DecimalMax("200") BigDecimal peso) {
}
