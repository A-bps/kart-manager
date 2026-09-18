package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Cep;

public interface CepRepository extends JpaRepository<Cep, String> {
}
