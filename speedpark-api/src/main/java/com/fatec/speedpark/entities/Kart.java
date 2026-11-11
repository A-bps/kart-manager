package com.fatec.speedpark.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Kart")
@Getter
@Setter
@NoArgsConstructor
public class Kart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo")
    private Integer codigo;

    // numero pintado no kart (aparece na frota do painel)
    @Column(name = "numero", unique = true)
    private Integer numero;

    @NotBlank
    @Size(max = 50)
    @Column(name = "estado", nullable = false, length = 50)
    private String estado;

    @Size(max = 255)
    @Column(name = "historico", length = 255)
    private String historico;
}
