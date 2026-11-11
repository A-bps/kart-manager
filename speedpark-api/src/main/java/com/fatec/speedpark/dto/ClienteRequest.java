package com.fatec.speedpark.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

public record ClienteRequest(
        @NotNull Integer pessoaCodigo,
        @NotNull @Past LocalDate dataNascimento) {
}
