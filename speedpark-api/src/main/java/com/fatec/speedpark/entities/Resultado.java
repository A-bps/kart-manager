package com.fatec.speedpark.entities;

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

/** Um piloto numa prova. O nome e livre (o admin pode lancar quem nao tem cadastro). */
@Entity
@Table(name = "Resultado")
@Getter
@Setter
@NoArgsConstructor
public class Resultado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prova_id", nullable = false)
    private Prova prova;

    @Column(name = "posicao", nullable = false)
    private Integer posicao;

    // numero do kart ("?" quando nao informado)
    @Column(name = "kart", length = 10)
    private String kart;

    @Column(name = "piloto_nome", nullable = false, length = 100)
    private String pilotoNome;

    @Column(name = "melhor_volta", length = 20)
    private String melhorVolta;

    @Column(name = "penalidades", length = 100)
    private String penalidades;
}
