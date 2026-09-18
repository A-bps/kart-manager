package com.fatec.speedpark.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Funcionario;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Integer> {
}
