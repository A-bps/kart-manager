package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fatec.speedpark.entities.Reserva;

/** Formato de reserva que o front ja usa. Para outros pilotos, dados pessoais vem ocultos. */
public record ReservaView(
        Integer id,
        LocalDate data,
        String hora,
        String pistaId,
        String nome,
        Integer pilotoId,
        String formato,
        Integer qtd,
        String formaPagamento,
        BigDecimal valor,
        LocalDateTime criadaEm) {

    public static ReservaView de(Reserva r, boolean completa) {
        Integer pilotoId = r.getCliente() == null ? null : r.getCliente().getPessoaCodigo();
        String hora = r.getHorario().toString().substring(0, 5);
        return new ReservaView(r.getId(), r.getData(), hora, r.getPista().getCodigo(),
                completa ? r.getParticipante() : "Reservado", pilotoId,
                r.getFormato(), r.getQtd(),
                completa ? r.getFormaPagamento() : null, completa ? r.getValor() : null, r.getCriadaEm());
    }
}
