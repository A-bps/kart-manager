package com.fatec.speedpark.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import com.fatec.speedpark.entities.Prova;

/** Formato que o front ja usa: datas em milissegundos (o cronometro da tela calcula em cima de iniciadaEm). */
public record ProvaView(
        Integer id,
        Integer numero,
        String pistaId,
        String pistaNome,
        long iniciadaEm,
        Long encerradaEm,
        int duracaoSec,
        List<Posicao> posicoes) {

    public record Posicao(String kart, String nome, String melhorVolta, String penalidades) {
    }

    public static ProvaView de(Prova p) {
        return new ProvaView(p.getId(), p.getNumero(), p.getPista().getCodigo(), p.getPista().getNome(),
                ms(p.getIniciadaEm()), p.getEncerradaEm() == null ? null : ms(p.getEncerradaEm()), p.getDuracaoSeg(),
                p.getResultados().stream()
                        .map(r -> new Posicao(r.getKart(), r.getPilotoNome(), r.getMelhorVolta(), r.getPenalidades()))
                        .toList());
    }

    private static long ms(LocalDateTime t) {
        return t.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
    }
}
