package com.fatec.speedpark.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Uf")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Uf {

    @Id
    @Column(name = "sigla", length = 2)
    private String sigla;

    @Column(name = "nome", nullable = false, length = 50)
    private String nome;
}
