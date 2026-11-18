package com.fatec.speedpark.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// o motivo e gravado em Kart.historico
public record ManutencaoRequest(
        @NotNull @Pattern(regexp = "aberta|concluida", message = "deve ser aberta ou concluida") String status,
        @NotNull @PositiveOrZero BigDecimal valor,
        @Pattern(regexp = "pix|cartao_debito|cartao_credito|dinheiro", message = "deve ser pix, cartao_debito, cartao_credito ou dinheiro") String formaPagamento,
        @NotNull Integer kartCodigo,
        @Size(max = 255) String motivo) {
}
