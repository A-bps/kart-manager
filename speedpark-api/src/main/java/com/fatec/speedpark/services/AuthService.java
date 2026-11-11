package com.fatec.speedpark.services;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fatec.speedpark.dto.LoginRequest;
import com.fatec.speedpark.dto.LoginResponse;
import com.fatec.speedpark.dto.PilotoView;
import com.fatec.speedpark.dto.RedefinirSenhaRequest;
import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.repositories.ClienteRepository;
import com.fatec.speedpark.repositories.PessoaRepository;
import com.fatec.speedpark.security.TentativasLogin;
import com.fatec.speedpark.security.TokenService;

@Service
public class AuthService {

    private final PessoaRepository pessoaRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder encoder;
    private final TokenService tokenService;
    private final TentativasLogin tentativas;
    // hash falso: e conferido quando o e-mail não existe, para o tempo de resposta não revelar quais e-mails existem
    private final String hashFalso;

    public AuthService(PessoaRepository pessoaRepository, ClienteRepository clienteRepository,
            PasswordEncoder encoder, TokenService tokenService, TentativasLogin tentativas) {
        this.pessoaRepository = pessoaRepository;
        this.clienteRepository = clienteRepository;
        this.encoder = encoder;
        this.tokenService = tokenService;
        this.tentativas = tentativas;
        this.hashFalso = encoder.encode("senha-falsa-para-igualar-tempo");
    }

    // ponytail: confirma por e-mail + CPF (sem envio de e-mail); em producao use link/token por e-mail
    public void redefinirSenha(RedefinirSenhaRequest r) {
        String chave = "redefinir:" + r.email().trim().toLowerCase();
        tentativas.verificar(chave); // bloqueado? nem confere (impede adivinhar o CPF)
        Pessoa pessoa = pessoaRepository.findByEmailIgnoreCase(r.email().trim()).orElse(null);
        // a conta de admin tem a senha definida no application.properties
        if (pessoa == null || !r.cpf().equals(pessoa.getCpf()) || Pessoa.ADMIN.equals(pessoa.getPerfil())) {
            tentativas.falhou(chave);
            throw new IllegalArgumentException("E-mail ou CPF não conferem.");
        }
        tentativas.sucesso(chave);
        // identidade confirmada: a senha nova precisa ser diferente da atual
        if (pessoa.getSenhaHash() != null && encoder.matches(r.novaSenha(), pessoa.getSenhaHash())) {
            throw new IllegalArgumentException("A nova senha não pode ser igual à senha atual.");
        }
        pessoa.setSenhaHash(encoder.encode(r.novaSenha()));
        pessoaRepository.save(pessoa);
    }

    public LoginResponse login(LoginRequest request) {
        String chave = "login:" + request.email().trim().toLowerCase();
        tentativas.verificar(chave); // bloqueado? recusa ate com a senha certa
        Pessoa pessoa = pessoaRepository.findByEmailIgnoreCase(request.email().trim()).orElse(null);
        String hash = pessoa != null && pessoa.getSenhaHash() != null ? pessoa.getSenhaHash() : hashFalso;
        boolean senhaConfere = encoder.matches(request.senha(), hash);
        if (pessoa == null || pessoa.getSenhaHash() == null || !senhaConfere) {
            tentativas.falhou(chave); // na falha que estoura o limite, lanca 429
            throw new BadCredentialsException("E-mail ou senha incorretos.");
        }
        tentativas.sucesso(chave);
        return new LoginResponse(tokenService.gerar(pessoa), PilotoView.de(pessoa,
                clienteRepository.findById(pessoa.getCodigo()).orElse(null)));
    }
}
