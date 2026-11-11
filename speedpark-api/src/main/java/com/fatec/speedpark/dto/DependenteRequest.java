package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** A categoria e calculada no servidor pela data de nascimento; o campo enviado pelo front e ignorado. */
public record DependenteRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotNull @Past LocalDate nascimento,
        @Pattern(regexp = "kids|junior|open") String categoria,
        @Min(50) @Max(250) Integer altura,
        @DecimalMin("10") @DecimalMax("200") BigDecimal peso) {
}
