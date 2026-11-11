package com.fatec.speedpark.services;

import java.sql.Types;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Consultas que usam os recursos criados no banco (script "ADMINISTRACAO DE BANCO DE DADOS"):
 * view, function que retorna tabela e a tabela de LOG alimentada pela trigger.
 */
@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final JdbcTemplate jdbc;

    /** VIEW v_Relatorio_Reservas_SpeedPark, filtrada por periodo (datas opcionais). */
    public List<Map<String, Object>> reservas(LocalDate de, LocalDate ate) {
        return consultaPorPeriodo("select * from dbo.v_Relatorio_Reservas_SpeedPark", "Data_Reserva", de, ate,
                "order by Data_Reserva desc, Horario, No_Reserva");
    }

    /** FUNCTION fc_RankingPilotos_SpeedPark(minimo de corridas, pista ou null para todas). */
    public List<Map<String, Object>> ranking(int minimoCorridas, String pistaCodigo) {
        return limpar(jdbc.queryForList("select * from dbo.fc_RankingPilotos_SpeedPark(?, ?) order by Pontos desc, Vitorias desc, Piloto",
                minimoCorridas, new SqlParameterValue(Types.VARCHAR, pistaCodigo == null || pistaCodigo.isBlank() ? null : pistaCodigo)));
    }

    /** LOG da trigger tg_HistNovaReserva (uma linha para cada reserva criada). */
    public List<Map<String, Object>> auditoriaReservas() {
        return limpar(jdbc.queryForList("select top 200 * from LOG_HistoricoNovaReserva order by idLog desc"));
    }

    // troca java.sql.Date/Time/Timestamp por java.time: o JSON sai como "2026-11-24", "10:00:00" e "2026-11-10T17:07:34"
    private static List<Map<String, Object>> limpar(List<Map<String, Object>> linhas) {
        linhas.forEach(l -> l.replaceAll((k, v) -> {
            if (v instanceof java.sql.Timestamp t) return t.toLocalDateTime();
            if (v instanceof java.sql.Date d) return d.toLocalDate();
            if (v instanceof java.sql.Time t) return t.toLocalTime();
            return v;
        }));
        return linhas;
    }

    // acrescenta o filtro de periodo usando parametros (nunca concatena valores)
    private List<Map<String, Object>> consultaPorPeriodo(String base, String colunaData, LocalDate de, LocalDate ate,
            String ordem) {
        StringBuilder sql = new StringBuilder(base).append(" where 1 = 1");
        List<Object> args = new ArrayList<>();
        if (de != null) {
            sql.append(" and ").append(colunaData).append(" >= ?");
            args.add(java.sql.Date.valueOf(de));
        }
        if (ate != null) {
            sql.append(" and ").append(colunaData).append(" <= ?");
            args.add(java.sql.Date.valueOf(ate));
        }
        sql.append(' ').append(ordem);
        return limpar(jdbc.queryForList(sql.toString(), args.toArray()));
    }
}
