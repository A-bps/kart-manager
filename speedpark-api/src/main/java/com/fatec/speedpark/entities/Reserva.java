package com.fatec.speedpark.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

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

/** Vaga reservada por um piloto (ou lancada pelo admin) em uma pista, dia e horario. */
@Entity
@Table(name = "Reserva")
@Getter
@Setter
@NoArgsConstructor
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    // quem fez a reserva; nulo quando o admin lanca so um nome
    @ManyToOne
    @JoinColumn(name = "cliente_codigo")
    private Cliente cliente;

    // quem vai correr (o proprio piloto ou um dependente)
    @Column(name = "participante", nullable = false, length = 100)
    private String participante;

    @ManyToOne
    @JoinColumn(name = "pista_nr", nullable = false)
    private Pista pista;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "horario", nullable = false)
    private LocalTime horario;

    // "tempo" (minutos) ou "voltas"
    @Column(name = "formato", length = 10)
    private String formato;

    @Column(name = "qtd")
    private Integer qtd;

    @Column(name = "forma_pagamento", length = 30)
    private String formaPagamento;

    @Column(name = "valor", precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "criada_em", nullable = false)
    private LocalDateTime criadaEm = LocalDateTime.now();
}
