package com.fatec.speedpark.dto;

import java.time.LocalDate;

public record ClienteRequest(Integer pessoaCodigo, LocalDate dataNascimento) {
}
