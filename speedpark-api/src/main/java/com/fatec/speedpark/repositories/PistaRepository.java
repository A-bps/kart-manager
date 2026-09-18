package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Pista;

public interface PistaRepository extends JpaRepository<Pista, Integer> {
}
