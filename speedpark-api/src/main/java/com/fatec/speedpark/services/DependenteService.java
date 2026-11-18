package com.fatec.speedpark.services;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.DependenteRequest;
import com.fatec.speedpark.dto.DependenteView;
import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.Dependente;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.DependenteRepository;
import com.fatec.speedpark.security.TokenService;

import lombok.RequiredArgsConstructor;

/** Cada piloto so enxerga e mexe nos proprios dependentes. */
@Service
@RequiredArgsConstructor
public class DependenteService {

    private final DependenteRepository repository;
    private final ClienteRepository clienteRepository;
    private final Categoria categorias;

    public List<DependenteView> listar(Authentication auth) {
        return repository.findByResponsavel_PessoaCodigoOrderByIdAsc(TokenService.codigo(auth)).stream()
                .map(DependenteView::de).toList();
    }

    public List<DependenteView> listarDoCliente(Integer clienteCodigo, Authentication auth) {
        exigirAdmin(auth);
        return repository.findByResponsavel_PessoaCodigoOrderByIdAsc(clienteCodigo).stream().map(DependenteView::de).toList();
    }

    public DependenteView criarParaCliente(Integer clienteCodigo, DependenteRequest r, Authentication auth) {
        exigirAdmin(auth);
        Cliente responsavel = clienteRepository.findById(clienteCodigo)
                .orElseThrow(() -> new NoSuchElementException("Cliente não encontrado: " + clienteCodigo));
        return salvarNovo(responsavel, r);
    }

    private void exigirAdmin(Authentication auth) {
        if (!TokenService.ehAdmin(auth)) {
            throw new AccessDeniedException("Apenas o administrador pode fazer isso.");
        }
    }

    public DependenteView criar(DependenteRequest r, Authentication auth) {
        Cliente responsavel = clienteRepository.findById(TokenService.codigo(auth))
                .orElseThrow(() -> new AccessDeniedException("Apenas pilotos cadastrados têm dependentes."));
        return salvarNovo(responsavel, r);
    }

    private DependenteView salvarNovo(Cliente responsavel, DependenteRequest r) {
        LocalDate nasc = responsavel.getDataNascimento();
        if (nasc == null || Period.between(nasc, LocalDate.now()).getYears() < 18) {
            throw new IllegalArgumentException("Apenas clientes com 18 anos ou mais podem ter dependentes.");
        }
        Dependente d = new Dependente();
        d.setResponsavel(responsavel);
        d.setNome(r.nome().trim());
        d.setNascimento(r.nascimento());
        d.setCategoria(categorias.de(r.nascimento())); // pela idade, não pelo que o front mandar
        d.setAltura(r.altura());
        d.setPeso(r.peso());
        return DependenteView.de(repository.save(d));
    }

    public DependenteView atualizar(Integer id, DependenteRequest r, Authentication auth) {
        Dependente d = buscarDoPiloto(id, auth);
        d.setNome(r.nome().trim());
        d.setNascimento(r.nascimento());
        d.setCategoria(categorias.de(r.nascimento()));
        d.setAltura(r.altura());
        d.setPeso(r.peso());
        return DependenteView.de(repository.save(d));
    }

    public void remover(Integer id, Authentication auth) {
        repository.delete(buscarDoPiloto(id, auth));
    }

    private Dependente buscarDoPiloto(Integer id, Authentication auth) {
        Dependente d = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Dependente não encontrado: " + id));
        if (!TokenService.ehAdmin(auth) && !d.getResponsavel().getPessoaCodigo().equals(TokenService.codigo(auth))) {
            throw new AccessDeniedException("Este dependente pertence a outro piloto.");
        }
        return d;
    }
}
