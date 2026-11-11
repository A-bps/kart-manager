package com.fatec.speedpark.services;

import java.math.BigDecimal;
import java.sql.Types;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlParameterValue;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatec.speedpark.dto.ReservaRequest;
import com.fatec.speedpark.dto.ReservaView;
import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.Dependente;
import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.entities.Reserva;
import com.fatec.speedpark.exceptions.ConflitoException;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.DependenteRepository;
import com.fatec.speedpark.repositories.PistaRepository;
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
    private final PistaRepository pistaRepository;
    private final ClienteRepository clienteRepository;
    private final DependenteRepository dependenteRepository;
    private final JdbcTemplate jdbc;

    // ponytail: findAll + filtro em memoria; paginar por data se a tabela crescer muito
    public List<ReservaView> listar(Authentication auth) {
        boolean admin = TokenService.ehAdmin(auth);
        Integer eu = TokenService.codigo(auth);
        return repository.findAll().stream()
                .map(r -> ReservaView.de(r, admin || (r.getCliente() != null && r.getCliente().getPessoaCodigo().equals(eu))))
                .toList();
    }

    // Sem @Transactional de proposito: a transacao (reserva + lancamento financeiro) e da stored procedure.
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

        Pista pista = pistaRepository.findByCodigo(r.pistaId())
                .orElseThrow(() -> new NoSuchElementException("Pista não encontrada: " + r.pistaId()));

        // quem corre: o piloto logado ou um dependente dele (nome e categoria vem do cadastro, nunca do pedido);
        // a reserva de balcao (admin) so informa o nome
        Integer clienteCodigo = null;
        String participante = r.nome().trim();
        if (!admin) {
            Cliente cliente = clienteRepository.findById(TokenService.codigo(auth))
                    .orElseThrow(() -> new AccessDeniedException("Apenas pilotos cadastrados podem reservar."));
            clienteCodigo = cliente.getPessoaCodigo();
            String categoria;
            if (r.dependenteId() != null) {
                Dependente dep = dependenteRepository.findById(r.dependenteId())
                        .orElseThrow(() -> new NoSuchElementException("Dependente não encontrado: " + r.dependenteId()));
                if (!dep.getResponsavel().getPessoaCodigo().equals(clienteCodigo)) {
                    throw new AccessDeniedException("Este dependente pertence a outro piloto.");
                }
                participante = dep.getNome();
                categoria = Categoria.de(dep.getNascimento());
            } else {
                participante = cliente.getPessoa().getNome();
                categoria = Categoria.de(cliente.getDataNascimento());
            }
            // cada pista aceita somente a sua categoria (crianca na Open, adulto na Kids...)
            if (!categoria.equals(pista.getCategoria())) {
                throw new IllegalArgumentException("Categoria " + categoria.toUpperCase() + " não pode correr na "
                        + pista.getNome() + " (pista " + pista.getCategoria().toUpperCase() + ").");
            }
        }

        // ponytail: vagas conferidas aqui, sem trava no banco; duas reservas no mesmo instante podem passar da capacidade
        if (repository.countByPistaAndDataAndHorario(pista, r.data(), r.hora()) >= pista.getCapacidade()) {
            throw new ConflitoException("Horário lotado nesta pista.");
        }

        BigDecimal valor = null;
        if (r.formato() != null) {
            BigDecimal unitario = r.formato().equals("tempo") ? pista.getPrecoPorMin() : pista.getPrecoPorVolta();
            valor = unitario.multiply(BigDecimal.valueOf(r.qtd()));
        }
        String descricao = "Reserva " + pista.getNome() + " " + r.data().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                + " " + r.hora() + " - " + participante;

        List<Map<String, Object>> retorno = jdbc.queryForList("exec dbo.sp_CadReserva_SpeedPark ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
                new SqlParameterValue(Types.INTEGER, clienteCodigo),
                participante,
                pista.getNr(),
                r.data(),
                r.hora(),
                new SqlParameterValue(Types.VARCHAR, r.formato()),
                new SqlParameterValue(Types.INTEGER, r.qtd()),
                new SqlParameterValue(Types.VARCHAR, r.formaPagamento()),
                new SqlParameterValue(Types.DECIMAL, valor),
                descricao);

        // a procedure devolve a reserva criada (coluna id) ou, se deu erro, NumeroErro e MensagemErro (ja com rollback)
        Map<String, Object> linha = retorno.get(0);
        if (linha.containsKey("NumeroErro")) {
            throw new IllegalStateException("Erro no banco de dados (" + linha.get("NumeroErro") + "): " + linha.get("MensagemErro"));
        }
        Integer reservaId = ((Number) linha.get("id")).intValue();
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
        Set<LocalTime> s = new HashSet<>();
        for (int h = inicio; h <= fim; h += 2) {
            s.add(LocalTime.of(h, 0));
        }
        return Set.copyOf(s);
    }
}
