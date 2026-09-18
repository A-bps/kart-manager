package com.fatec.speedpark.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.CorridaKart;
import com.fatec.speedpark.entities.CorridaKartId;

public interface CorridaKartRepository extends JpaRepository<CorridaKart, CorridaKartId> {

    List<CorridaKart> findByCorrida_Nr(Integer corridaNr);

    List<CorridaKart> findByKart_Codigo(Integer kartCodigo);
}
