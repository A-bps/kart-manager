package com.fatec.speedpark.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatec.speedpark.entities.Pista;

import jakarta.persistence.LockModeType;

public interface PistaRepository extends JpaRepository<Pista, Integer> {
    Optional<Pista> findByCodigo(String codigo);

    // trava a linha ate o fim da transacao: serializa as reservas concorrentes da mesma pista
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pista p where p.codigo = :codigo")
    Optional<Pista> buscarParaReserva(@Param("codigo") String codigo);
}
