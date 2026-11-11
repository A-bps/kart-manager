package com.fatec.speedpark.services;

import java.time.LocalDate;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Categoria do piloto pela idade (menos de 7 = kids, ate 13 = junior, acima = open); cada pista aceita uma categoria.
 * A regra fica na FUNCTION escalar fc_CategoriaPorIdade_SpeedPark do banco; aqui so a chamamos.
 */
@Component
@RequiredArgsConstructor
public class Categoria {

    private final JdbcTemplate jdbc;

    public String de(LocalDate nascimento) {
        return jdbc.queryForObject("select dbo.fc_CategoriaPorIdade_SpeedPark(?)", String.class, nascimento);
    }
}
