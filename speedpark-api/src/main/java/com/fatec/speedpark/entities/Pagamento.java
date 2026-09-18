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
@Table(name = "Pagamento")
@Getter
@Setter
@NoArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo")
    private Integer codigo;

    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "forma_pagamento", nullable = false, length = 50)
    private String formaPagamento;

    @ManyToOne
    @JoinColumn(name = "cliente_codigo", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "corrida_nr", nullable = false)
    private Corrida corrida;

    public Pagamento(BigDecimal valor, String status, String formaPagamento, Cliente cliente, Corrida corrida) {
        this.valor = valor;
        this.status = status;
        this.formaPagamento = formaPagamento;
        this.cliente = cliente;
        this.corrida = corrida;
    }
}
