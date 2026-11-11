package com.fatec.speedpark.entities;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

@Entity
@Table(name = "Pessoa")
@Getter
@Setter
@NoArgsConstructor
public class Pessoa {

    public static final String ADMIN = "ADMIN";
    public static final String PILOTO = "PILOTO";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "codigo")
    private Integer codigo;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "cpf", nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "fone", length = 20)
    private String fone;

    // opcional: o cadastro do site nao pede endereco
    @ManyToOne
    @JoinColumn(name = "cep_numero")
    private Cep cep;

    // hash BCrypt; nunca sai nas respostas da API
    @JsonIgnore
    @Column(name = "senha_hash", length = 100)
    private String senhaHash;

    @JsonIgnore
    @Column(name = "perfil", nullable = false, length = 20, columnDefinition = "varchar(20) default 'PILOTO'")
    private String perfil = PILOTO;

    @JsonIgnore
    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();
}
