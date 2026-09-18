package com.fatec.speedpark.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Corrida;

public interface CorridaRepository extends JpaRepository<Corrida, Integer> {

    List<Corrida> findByData(LocalDate data);
}
