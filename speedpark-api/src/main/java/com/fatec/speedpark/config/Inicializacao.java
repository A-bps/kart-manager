package com.fatec.speedpark.config;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fatec.speedpark.entities.Pessoa;
import com.fatec.speedpark.entities.Pista;
import com.fatec.speedpark.repositories.PessoaRepository;
import com.fatec.speedpark.repositories.PistaRepository;

import lombok.RequiredArgsConstructor;

/**
 * Dados minimos para o sistema funcionar: as 3 pistas do site e a conta de admin.
 * O admin so e criado se speedpark.admin.email e speedpark.admin.senha estiverem no application.properties
 * (nada de credencial fixa no codigo).
 */
@Component
@RequiredArgsConstructor
public class Inicializacao implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(Inicializacao.class);

    private final PistaRepository pistaRepository;
    private final PessoaRepository pessoaRepository;
    private final PasswordEncoder encoder;

    @Value("${speedpark.admin.email:}")
    private String adminEmail;

    @Value("${speedpark.admin.senha:}")
    private String adminSenha;

    @Value("${speedpark.admin.nome:Administrador Speed Park}")
    private String adminNome;

    @Value("${speedpark.admin.cpf:00000000000}")
    private String adminCpf;

    @Override
    public void run(ApplicationArguments args) {
        pista("pista1", "Pista 1", 15, 550, "6", "4", "kids");
        pista("pista2", "Pista 2", 20, 800, "8", "6", "junior");
        pista("pista3", "Pista 3", 30, 1200, "10", "8", "open");
        criarAdmin();
    }

    private void pista(String codigo, String nome, int capacidade, int metros, String porMin, String porVolta,
            String categoria) {
        if (pistaRepository.findByCodigo(codigo).isPresent()) {
            return;
        }
        Pista p = new Pista();
        p.setCodigo(codigo);
        p.setNome(nome);
        p.setCapacidade(capacidade);
        p.setMetros(metros);
        p.setPrecoPorMin(new BigDecimal(porMin));
        p.setPrecoPorVolta(new BigDecimal(porVolta));
        p.setCategoria(categoria);
        pistaRepository.save(p);
    }

    private void criarAdmin() {
        if (adminEmail.isBlank() || adminSenha.isBlank()) {
            log.warn("speedpark.admin.email/senha nao configurados: nenhuma conta de admin sera criada.");
            return;
        }
        if (adminSenha.length() < 6) {
            log.warn("speedpark.admin.senha tem menos de 6 caracteres: admin NAO criado.");
            return;
        }
        // o application.properties manda: se a senha do admin mudou no arquivo, atualiza no banco
        Pessoa existente = pessoaRepository.findByEmailIgnoreCase(adminEmail.trim()).orElse(null);
        if (existente != null) {
            if (Pessoa.ADMIN.equals(existente.getPerfil()) && !encoder.matches(adminSenha, existente.getSenhaHash())) {
                existente.setSenhaHash(encoder.encode(adminSenha));
                pessoaRepository.save(existente);
                log.info("Senha do admin atualizada a partir do application.properties.");
            }
            return;
        }
        Pessoa admin = new Pessoa();
        admin.setNome(adminNome);
        admin.setCpf(adminCpf);
        admin.setEmail(adminEmail.trim().toLowerCase());
        admin.setSenhaHash(encoder.encode(adminSenha));
        admin.setPerfil(Pessoa.ADMIN);
        pessoaRepository.save(admin);
        log.info("Conta de admin criada: {}", admin.getEmail());
    }
}
