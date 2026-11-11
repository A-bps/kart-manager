package com.fatec.speedpark.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CidadeRequest(
        @NotBlank @Size(max = 100) String nome,
        @NotBlank @Size(min = 2, max = 2) String ufSigla) {
}
