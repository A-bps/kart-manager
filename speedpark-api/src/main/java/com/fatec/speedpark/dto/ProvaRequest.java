package com.fatec.speedpark.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProvaRequest(
        @NotNull @Positive Integer numero,
        @NotBlank @Size(max = 20) String pistaId,
        @NotNull @Min(60) @Max(14400) Integer duracaoSec,
        @NotEmpty @Size(max = 40) List<@Valid PosicaoRequest> posicoes) {
}
