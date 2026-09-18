package com.fatec.speedpark.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.ClienteCorrida;
import com.fatec.speedpark.entities.ClienteCorridaId;

public interface ClienteCorridaRepository extends JpaRepository<ClienteCorrida, ClienteCorridaId> {

    List<ClienteCorrida> findByCliente_PessoaCodigo(Integer clienteCodigo);

    List<ClienteCorrida> findByCorrida_Nr(Integer corridaNr);
}
