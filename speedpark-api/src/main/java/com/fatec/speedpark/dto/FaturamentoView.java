package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fatec.speedpark.entities.Faturamento;

public record FaturamentoView(
        Integer id,
        LocalDate data,
        BigDecimal valor,
        String descricao,
        String formaPagamento,
        String status) {

    public static FaturamentoView de(Faturamento f) {
        return new FaturamentoView(f.getId(), f.getData(), f.getValor(), f.getDescricao(), f.getFormaPagamento(),
                f.getStatus());
    }
}
