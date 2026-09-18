package com.fatec.speedpark.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fatec.speedpark.entities.Pagamento;

public interface PagamentoRepository extends JpaRepository<Pagamento, Integer> {

    List<Pagamento> findByCliente_PessoaCodigo(Integer clienteCodigo);

    List<Pagamento> findByCorrida_Nr(Integer corridaNr);
}
