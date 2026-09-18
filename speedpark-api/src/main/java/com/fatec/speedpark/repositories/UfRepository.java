package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Uf;

public interface UfRepository extends JpaRepository<Uf, String> {
}
