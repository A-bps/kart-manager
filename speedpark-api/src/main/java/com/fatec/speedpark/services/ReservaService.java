package com.fatec.speedpark.services;

import java.sql.Types;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatec.speedpark.dto.ReservaRequest;
import com.fatec.speedpark.dto.ReservaView;
import com.fatec.speedpark.entities.Reserva;
import com.fatec.speedpark.exceptions.ErrosBanco;
import com.fatec.speedpark.repositories.ReservaRepository;
import com.fatec.speedpark.security.TokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservaService {

    // mesmas grades de horario do site; sexta e sabado vao ate as 22h
    private static final Set<LocalTime> HORARIOS_SEMANA = horarios(8, 18);
    private static final Set<LocalTime> HORARIOS_FDS = horarios(8, 22);
    private static final Set<Integer> QTD_TEMPO = Set.of(10, 15, 20, 30);
    private static final Set<Integer> QTD_VOLTAS = Set.of(5, 10, 15, 20);

    private final ReservaRepository repository;
    private final JdbcTemplate jdbc;

    // ponytail: findAll + filtro em memoria; paginar por data se a tabela crescer muito
    public List<ReservaView> listar(Authentication auth) {
        boolean admin = TokenService.ehAdmin(auth);
        Integer eu = TokenService.codigo(auth);
        return repository.findAll().stream()
                .map(r -> ReservaView.de(r, admin || (r.getCliente() != null && r.getCliente().getPessoaCodigo().equals(eu))))
                .toList();
    }

    @Transactional
    public ReservaView criar(ReservaRequest r, Authentication auth) {
        boolean admin = TokenService.ehAdmin(auth);
        boolean comCobranca = r.formato() != null || r.qtd() != null;
        if (!admin || comCobranca) {
            if (r.formato() == null || r.qtd() == null || (!admin && r.formaPagamento() == null)) {
                throw new IllegalArgumentException("Informe formato, quantidade e forma de pagamento.");
            }
            Set<Integer> permitidas = r.formato().equals("tempo") ? QTD_TEMPO : QTD_VOLTAS;
            if (!permitidas.contains(r.qtd())) {
                throw new IllegalArgumentException("Quantidade inválida para o formato " + r.formato() + ".");
            }
        }
        validarDataEHora(r.data(), r.hora());

        // A transacao da reserva (pista, categoria pela idade, vagas, valor, gravar Reserva + Faturamento)
        // e feita pela stored procedure sp_CriarReserva_SpeedPark. O piloto e identificado pelo token;
        // nome e categoria do participante vem do cadastro, nunca do pedido.
        Integer clienteCodigo = admin ? null : TokenService.codigo(auth);
        Integer reservaId;
        try {
            reservaId = jdbc.queryForObject("exec dbo.sp_CriarReserva_SpeedPark ?, ?, ?, ?, ?, ?, ?, ?, ?", Integer.class,
                    r.pistaId(), r.data(), r.hora(), r.nome().trim(),
                    new SqlParameterValue(Types.INTEGER, clienteCodigo),
                    new SqlParameterValue(Types.INTEGER, r.dependenteId()),
                    new SqlParameterValue(Types.VARCHAR, r.formato()),
                    new SqlParameterValue(Types.INTEGER, r.qtd()),
                    new SqlParameterValue(Types.VARCHAR, r.formaPagamento()));
        } catch (DataAccessException e) {
            throw ErrosBanco.traduzir(e);
        }
        return ReservaView.de(repository.findById(reservaId)
                .orElseThrow(() -> new NoSuchElementException("Reserva não encontrada: " + reservaId)), true);
    }

    @Transactional
    public void cancelar(Integer id, Authentication auth) {
        Reserva reserva = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Reserva não encontrada: " + id));
        boolean dono = reserva.getCliente() != null
                && reserva.getCliente().getPessoaCodigo().equals(TokenService.codigo(auth));
        if (!TokenService.ehAdmin(auth) && !dono) {
            throw new AccessDeniedException("Você só pode cancelar as suas reservas.");
        }
        repository.delete(reserva);
    }

    private void validarDataEHora(LocalDate data, LocalTime hora) {
        if (data.isBefore(LocalDate.now()) || (data.isEqual(LocalDate.now()) && hora.isBefore(LocalTime.now()))) {
            throw new IllegalArgumentException("Não é possível reservar um horário que já passou.");
        }
        boolean fimDeSemana = data.getDayOfWeek() == DayOfWeek.FRIDAY || data.getDayOfWeek() == DayOfWeek.SATURDAY;
        if (!(fimDeSemana ? HORARIOS_FDS : HORARIOS_SEMANA).contains(hora)) {
            throw new IllegalArgumentException("Horário fora da grade de funcionamento.");
        }
    }

    // de h em h 2 horas, de inicio ate fim
    private static Set<LocalTime> horarios(int inicio, int fim) {
        Set<LocalTime> s = new java.util.HashSet<>();
        for (int h = inicio; h <= fim; h += 2) {
            s.add(LocalTime.of(h, 0));
        }
        return Set.copyOf(s);
    }
}
