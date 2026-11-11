package com.fatec.speedpark.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Corrida disputada na pista (iniciada e encerrada pelo admin). Fica "ativa" ate ser encerrada. */
@Entity
@Table(name = "Prova")
@Getter
@Setter
@NoArgsConstructor
public class Prova {

    public static final String ATIVA = "ativa";
    public static final String ENCERRADA = "encerrada";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    // numero que o admin da a corrida (ex.: 43)
    @Column(name = "numero", nullable = false)
    private Integer numero;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pista_nr", nullable = false)
    private Pista pista;

    @Column(name = "duracao_seg", nullable = false)
    private Integer duracaoSeg;

    @Column(name = "iniciada_em", nullable = false)
    private LocalDateTime iniciadaEm = LocalDateTime.now();

    @Column(name = "encerrada_em")
    private LocalDateTime encerradaEm;

    @Column(name = "status", nullable = false, length = 10)
    private String status = ATIVA;

    // ordem de largada na ativa; ordem de chegada depois de encerrada
    @OneToMany(mappedBy = "prova", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("posicao ASC")
    private List<Resultado> resultados = new ArrayList<>();
}
