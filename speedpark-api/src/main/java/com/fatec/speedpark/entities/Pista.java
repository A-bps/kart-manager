package com.fatec.speedpark.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Pista")
@Getter
@Setter
@NoArgsConstructor
public class Pista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nr")
    private Integer nr;

    @NotBlank
    @Size(max = 100)
    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    // identificador usado pelo site (pista1, pista2...)
    @Column(name = "codigo", unique = true, length = 20)
    private String codigo;

    @Column(name = "capacidade")
    private Integer capacidade;

    @Column(name = "metros")
    private Integer metros;

    @Column(name = "preco_por_min", precision = 10, scale = 2)
    private BigDecimal precoPorMin;

    @Column(name = "preco_por_volta", precision = 10, scale = 2)
    private BigDecimal precoPorVolta;

    @Column(name = "categoria", length = 20)
    private String categoria;
}
