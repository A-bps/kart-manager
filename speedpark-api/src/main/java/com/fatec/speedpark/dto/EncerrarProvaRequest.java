package com.fatec.speedpark.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

/** Resultado final, na ordem de chegada. */
public record EncerrarProvaRequest(@NotEmpty @Size(max = 40) List<@Valid PosicaoRequest> posicoes) {
}
