package com.fatec.speedpark.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Manutencao;

public interface ManutencaoRepository extends JpaRepository<Manutencao, Integer> {

    List<Manutencao> findByKart_Codigo(Integer kartCodigo);
}
