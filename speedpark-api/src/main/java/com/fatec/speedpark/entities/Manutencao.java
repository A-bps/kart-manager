package com.fatec.speedpark.entities;

import java.math.BigDecimal;

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

@Entity
@Table(name = "Manutencao")
@Getter
@Setter
@NoArgsConstructor
public class Manutencao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo")
    private Integer codigo;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "forma_pagamento", length = 50)
    private String formaPagamento;

    @ManyToOne
    @JoinColumn(name = "kart_codigo", nullable = false)
    private Kart kart;

    public Manutencao(String status, BigDecimal valor, String formaPagamento, Kart kart) {
        this.status = status;
        this.valor = valor;
        this.formaPagamento = formaPagamento;
        this.kart = kart;
    }
}
