package com.fatec.speedpark.repositories;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.entities.Reserva;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    long countByPistaAndDataAndHorario(Pista pista, LocalDate data, LocalTime horario);

    @Modifying
    @Query("update Reserva r set r.cliente = null where r.cliente.pessoaCodigo = :id")
    void desvincularCliente(@Param("id") Integer id);
}
