package com.fatec.speedpark.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Cep")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cep {

    @Id
    @Column(name = "numero", length = 8)
    private String numero;

    @ManyToOne
    @JoinColumn(name = "cidade_codigo", nullable = false)
    private Cidade cidade;
}
