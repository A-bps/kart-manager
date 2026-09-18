package com.fatec.speedpark.entities;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Cliente_Corrida")
@Getter
@Setter
@NoArgsConstructor
public class ClienteCorrida {

    @EmbeddedId
    private ClienteCorridaId id = new ClienteCorridaId();

    @ManyToOne
    @MapsId("clienteCodigo")
    @JoinColumn(name = "cliente_codigo")
    private Cliente cliente;

    @ManyToOne
    @MapsId("corridaNr")
    @JoinColumn(name = "corrida_nr")
    private Corrida corrida;

    @Column(name = "melhor_volta")
    private LocalTime melhorVolta;

    @Column(name = "penalidade", length = 100)
    private String penalidade;

    @Column(name = "tempo")
    private LocalTime tempo;

    @Column(name = "posicao")
    private Integer posicao;

    public ClienteCorrida(Cliente cliente, Corrida corrida, LocalTime melhorVolta, String penalidade,
            LocalTime tempo, Integer posicao) {
        this.cliente = cliente;
        this.corrida = corrida;
        this.melhorVolta = melhorVolta;
        this.penalidade = penalidade;
        this.tempo = tempo;
        this.posicao = posicao;
    }
}
