package com.fatec.speedpark.dto;

import java.math.BigDecimal;

public record PagamentoRequest(
        BigDecimal valor,
        String status,
        String formaPagamento,
        Integer clienteCodigo,
        Integer corridaNr) {
}
