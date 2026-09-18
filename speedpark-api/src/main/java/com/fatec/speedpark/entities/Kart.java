package com.fatec.speedpark.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Kart")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Kart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo")
    private Integer codigo;

    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    @Column(name = "historico", length = 255)
    private String historico;
}
