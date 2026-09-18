package com.fatec.speedpark.entities;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Funcionario")
@Getter
@Setter
@NoArgsConstructor
public class Funcionario {

    @Id
    @Column(name = "pessoa_codigo")
    private Integer pessoaCodigo;

    @OneToOne
    @MapsId
    @JoinColumn(name = "pessoa_codigo")
    private Pessoa pessoa;

    @Column(name = "salario", nullable = false, precision = 19, scale = 2)
    private BigDecimal salario;

    public Funcionario(Pessoa pessoa, BigDecimal salario) {
        this.pessoa = pessoa;
        this.salario = salario;
    }
}
