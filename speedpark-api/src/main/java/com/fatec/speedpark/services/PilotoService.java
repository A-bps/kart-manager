package com.fatec.speedpark.services;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fatec.speedpark.dto.PerfilRequest;
import com.fatec.speedpark.dto.PilotoRequest;
import com.fatec.speedpark.dto.PilotoView;
import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.exceptions.ConflitoException;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.DependenteRepository;
import com.fatec.speedpark.repositories.PessoaRepository;
import com.fatec.speedpark.repositories.ReservaRepository;
import com.fatec.speedpark.security.TokenService;

import lombok.RequiredArgsConstructor;

/** Piloto = Pessoa (login) + Cliente (dados de pista). O admin e uma Pessoa sem Cliente. */
@Service
@RequiredArgsConstructor
public class PilotoService {

    private final PessoaRepository pessoaRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;
    private final DependenteRepository dependenteRepository;
    private final PasswordEncoder encoder;

    @Transactional
    public PilotoView registrar(PilotoRequest r) {
        if (pessoaRepository.existsByEmailIgnoreCase(r.email())) {
            throw new ConflitoException("Este e-mail já está cadastrado.");
        }
        if (pessoaRepository.existsByCpf(r.cpf())) {
            throw new ConflitoException("Este CPF já está cadastrado.");
        }
        Pessoa pessoa = new Pessoa();
        pessoa.setNome(r.nome().trim());
        pessoa.setCpf(r.cpf());
        pessoa.setEmail(r.email());
        pessoa.setFone(r.telefone());
        pessoa.setSenhaHash(encoder.encode(r.senha()));
        pessoa.setPerfil(Pessoa.PILOTO);
        pessoa = pessoaRepository.save(pessoa);

        Cliente cliente = new Cliente(pessoa, r.nascimento());
        cliente.setAltura(r.altura());
        cliente.setPeso(r.peso());
        return PilotoView.de(pessoa, clienteRepository.save(cliente));
    }

    public List<PilotoView> listar() {
        return clienteRepository.findAll().stream().map(c -> PilotoView.de(c.getPessoa(), c)).toList();
    }

    public PilotoView buscar(Integer id, Authentication auth) {
        garantirAcesso(id, auth);
        return visao(buscarPessoa(id));
    }

    @Transactional
    public PilotoView atualizarPerfil(Integer id, PerfilRequest r, Authentication auth) {
        garantirAcesso(id, auth);
        Pessoa pessoa = buscarPessoa(id);
        pessoa.setNome(r.nome().trim());
        pessoa.setFone(r.telefone());
        pessoaRepository.save(pessoa);
        Cliente cliente = clienteRepository.findById(id).orElse(null);
        if (cliente != null) {
            cliente.setAltura(r.altura());
            cliente.setPeso(r.peso());
            clienteRepository.save(cliente);
        }
        return PilotoView.de(pessoa, cliente);
    }

    @Transactional
    public void deletar(Integer id) {
        Pessoa pessoa = buscarPessoa(id);
        if (Pessoa.ADMIN.equals(pessoa.getPerfil())) {
            throw new ConflitoException("A conta de administrador não pode ser apagada.");
        }
        // as reservas ficam (historico/financeiro), so perdem o vinculo com o piloto apagado
        reservaRepository.desvincularCliente(id);
        dependenteRepository.deleteAll(dependenteRepository.findByResponsavel_PessoaCodigoOrderByIdAsc(id));
        clienteRepository.findById(id).ifPresent(clienteRepository::delete);
        pessoaRepository.delete(pessoa);
    }

    private void garantirAcesso(Integer id, Authentication auth) {
        if (!TokenService.ehAdmin(auth) && !TokenService.codigo(auth).equals(id)) {
            throw new AccessDeniedException("Sem permissão para este piloto.");
        }
    }

    private Pessoa buscarPessoa(Integer id) {
        return pessoaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Piloto não encontrado com o código: " + id));
    }

    private PilotoView visao(Pessoa p) {
        return PilotoView.de(p, clienteRepository.findById(p.getCodigo()).orElse(null));
    }
}
