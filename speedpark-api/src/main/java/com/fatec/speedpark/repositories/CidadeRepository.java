package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Cidade;

public interface CidadeRepository extends JpaRepository<Cidade, Integer> {
}
