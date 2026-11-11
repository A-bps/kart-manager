package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Na criacao, valor e obrigatorio (checado no servico); na edicao, so os campos enviados mudam. */
public record FaturamentoRequest(
        @Positive BigDecimal valor,
        @Size(max = 200) String descricao,
        @Pattern(regexp = "pix|cartao_debito|cartao_credito|dinheiro") String formaPagamento,
        @Pattern(regexp = "pago|pendente") String status,
        LocalDate data) {
}
