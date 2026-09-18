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
public class ClienteCorridaId implements Serializable {

    @Column(name = "cliente_codigo")
    private Integer clienteCodigo;

    @Column(name = "corrida_nr")
    private Integer corridaNr;
}
