package com.fatec.speedpark.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Filho/dependente de um piloto: o responsavel agenda corridas em nome dele. */
@Entity
@Table(name = "Dependente")
@Getter
@Setter
@NoArgsConstructor
public class Dependente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "responsavel_codigo", nullable = false)
    private Cliente responsavel;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "nascimento", nullable = false)
    private LocalDate nascimento;

    // kids, junior ou open
    @Column(name = "categoria", nullable = false, length = 20)
    private String categoria;

    @Column(name = "altura")
    private Integer altura;

    @Column(name = "peso", precision = 5, scale = 1)
    private BigDecimal peso;
}
