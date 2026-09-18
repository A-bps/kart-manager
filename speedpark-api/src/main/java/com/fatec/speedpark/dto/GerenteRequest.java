package com.fatec.speedpark.dto;

import java.math.BigDecimal;

public record GerenteRequest(Integer funcionarioCodigo, BigDecimal salarioExtra) {
}
