package com.fatec.speedpark.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @NotBlank
    @Size(min = 2, max = 2)
    @Column(name = "sigla", length = 2)
    private String sigla;

    @NotBlank
    @Size(max = 50)
    @Column(name = "nome", nullable = false, length = 50)
    private String nome;
}
