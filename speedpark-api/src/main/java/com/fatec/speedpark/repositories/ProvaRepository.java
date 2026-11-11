package com.fatec.speedpark.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.entities.Prova;

public interface ProvaRepository extends JpaRepository<Prova, Integer> {
    boolean existsByPistaAndStatus(Pista pista, String status);

    List<Prova> findByStatusOrderByIdAsc(String status);

    // ponytail: o ranking le as 1000 provas mais recentes; paginar/agregar no banco se crescer
    List<Prova> findTop1000ByStatusOrderByEncerradaEmDesc(String status);
}
