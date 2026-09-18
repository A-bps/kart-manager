package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Gerente;

public interface GerenteRepository extends JpaRepository<Gerente, Integer> {
}
