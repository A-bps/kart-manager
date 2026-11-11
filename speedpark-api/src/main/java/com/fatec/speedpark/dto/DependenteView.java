package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fatec.speedpark.entities.Dependente;

public record DependenteView(Integer id, String nome, LocalDate nascimento, String categoria, Integer altura,
        BigDecimal peso) {

    public static DependenteView de(Dependente d) {
        return new DependenteView(d.getId(), d.getNome(), d.getNascimento(), d.getCategoria(), d.getAltura(),
                d.getPeso());
    }
}
