package com.fatec.speedpark.services;

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

    public DependenteView criar(DependenteRequest r, Authentication auth) {
        Cliente responsavel = clienteRepository.findById(TokenService.codigo(auth))
                .orElseThrow(() -> new AccessDeniedException("Apenas pilotos cadastrados têm dependentes."));
        Dependente d = new Dependente();
        d.setResponsavel(responsavel);
        d.setNome(r.nome().trim());
        d.setNascimento(r.nascimento());
        d.setCategoria(categorias.de(r.nascimento())); // pela idade, não pelo que o front mandar
        d.setAltura(r.altura());
        d.setPeso(r.peso());
        return DependenteView.de(repository.save(d));
    }

    public void remover(Integer id, Authentication auth) {
        Dependente d = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Dependente não encontrado: " + id));
        if (!d.getResponsavel().getPessoaCodigo().equals(TokenService.codigo(auth))) {
            throw new AccessDeniedException("Este dependente pertence a outro piloto.");
        }
        repository.delete(d);
    }
}
