package com.fatec.speedpark.entities;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CorridaKartId implements Serializable {

    @Column(name = "corrida_nr")
    private Integer corridaNr;

    @Column(name = "kart_codigo")
    private Integer kartCodigo;
}
