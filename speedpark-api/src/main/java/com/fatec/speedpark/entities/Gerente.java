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
@Table(name = "Gerente")
@Getter
@Setter
@NoArgsConstructor
public class Gerente {

    @Id
    @Column(name = "pessoa_codigo")
    private Integer pessoaCodigo;

    @OneToOne
    @MapsId
    @JoinColumn(name = "pessoa_codigo")
    private Funcionario funcionario;

    @Column(name = "salario_extra", nullable = false, precision = 19, scale = 2)
    private BigDecimal salarioExtra;

    public Gerente(Funcionario funcionario, BigDecimal salarioExtra) {
        this.funcionario = funcionario;
        this.salarioExtra = salarioExtra;
    }
}
