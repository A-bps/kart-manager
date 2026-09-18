package com.fatec.speedpark.dto;

import java.math.BigDecimal;

public record ManutencaoRequest(String status, BigDecimal valor, String formaPagamento, Integer kartCodigo) {
}
