package com.fatec.speedpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Um piloto numa prova (largada ou resultado). */
public record PosicaoRequest(
        @Size(max = 10) String kart,
        @NotBlank @Size(max = 100) String nome,
        @Size(max = 20) String melhorVolta,
        @Size(max = 100) String penalidades) {
}
