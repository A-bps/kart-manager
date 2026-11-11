package com.fatec.speedpark.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Lancamento financeiro: gerado por reservas ou digitado pelo admin. */
@Entity
@Table(name = "Faturamento")
@Getter
@Setter
@NoArgsConstructor
public class Faturamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "descricao", length = 200)
    private String descricao;

    @Column(name = "forma_pagamento", length = 30)
    private String formaPagamento;

    // "pago" ou "pendente"
    @Column(name = "status", nullable = false, length = 20)
    private String status;
}
