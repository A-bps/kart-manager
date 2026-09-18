package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
}
