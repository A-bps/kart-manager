package com.fatec.speedpark.services;

import java.time.LocalDate;
import java.time.Period;

/** Categoria do piloto pela idade: menos de 7 = kids, ate 13 = junior, acima = open. Cada pista aceita uma categoria. */
public final class Categoria {

    private Categoria() {
    }

    public static String de(LocalDate nascimento) {
        int idade = Period.between(nascimento, LocalDate.now()).getYears();
        if (idade < 7) {
            return "kids";
        }
        return idade <= 13 ? "junior" : "open";
    }
}
