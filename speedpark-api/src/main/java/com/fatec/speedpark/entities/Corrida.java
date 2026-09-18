package com.fatec.speedpark.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
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

@Entity
@Table(name = "Corrida")
@Getter
@Setter
@NoArgsConstructor
public class Corrida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nr")
    private Integer nr;

    @Column(name = "preco", nullable = false, precision = 19, scale = 2)
    private BigDecimal preco;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "horario", nullable = false)
    private LocalTime horario;

    @ManyToOne
    @JoinColumn(name = "pista_nr", nullable = false)
    private Pista pista;

    @ManyToOne
    @JoinColumn(name = "funcionario_codigo", nullable = false)
    private Funcionario funcionario;

    public Corrida(BigDecimal preco, LocalDate data, LocalTime horario, Pista pista, Funcionario funcionario) {
        this.preco = preco;
        this.data = data;
        this.horario = horario;
        this.pista = pista;
        this.funcionario = funcionario;
    }
}
