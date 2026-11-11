package com.fatec.speedpark.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Dependente;

public interface DependenteRepository extends JpaRepository<Dependente, Integer> {
    List<Dependente> findByResponsavel_PessoaCodigoOrderByIdAsc(Integer pessoaCodigo);
}
