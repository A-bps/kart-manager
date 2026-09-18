package com.fatec.speedpark.entities;

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
@Table(name = "Corrida_Kart")
@Getter
@Setter
@NoArgsConstructor
public class CorridaKart {

    @EmbeddedId
    private CorridaKartId id = new CorridaKartId();

    @ManyToOne
    @MapsId("corridaNr")
    @JoinColumn(name = "corrida_nr")
    private Corrida corrida;

    @ManyToOne
    @MapsId("kartCodigo")
    @JoinColumn(name = "kart_codigo")
    private Kart kart;

    public CorridaKart(Corrida corrida, Kart kart) {
        this.corrida = corrida;
        this.kart = kart;
    }
}
