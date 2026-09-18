package com.fatec.speedpark.entities;

import java.time.LocalDate;

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
@Table(name = "Cliente")
@Getter
@Setter
@NoArgsConstructor
public class Cliente {

    @Id
    @Column(name = "pessoa_codigo")
    private Integer pessoaCodigo;

    @OneToOne
    @MapsId
    @JoinColumn(name = "pessoa_codigo")
    private Pessoa pessoa;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    public Cliente(Pessoa pessoa, LocalDate dataNascimento) {
        this.pessoa = pessoa;
        this.dataNascimento = dataNascimento;
    }
}
