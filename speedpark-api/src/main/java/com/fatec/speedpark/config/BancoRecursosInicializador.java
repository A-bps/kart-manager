package com.fatec.speedpark.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

/**
 * Garante no banco as views, procedures, functions, triggers e tabelas de LOG da parte
 * "ADMINISTRACAO DE BANCO DE DADOS" do script oficial (Banco_de_dados-Kartodromo.sql).
 *
 * Serve para o banco que foi criado so pelo Hibernate (sem rodar o script): ao subir, a API cria o que falta.
 * Le o mesmo script do projeto (fonte unica) e, a partir da primeira view (comeco da parte de administracao
 * de banco de dados), executa apenas os lotes que comecam com "create" e cujo objeto ainda nao existe. Os testes
 * (select, exec, insert, update) ficam de fora. Se o banco ja foi criado pelo script, nao faz nada.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class BancoRecursosInicializador implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BancoRecursosInicializador.class);
    // a parte de administracao do banco comeca na primeira view; nao depende de nenhum texto de comentario
    private static final Pattern PRIMEIRA_VIEW = Pattern.compile("(?im)^\\s*create\\s+view\\b");
    private static final Pattern LINHA_GO = Pattern.compile("(?im)^\\s*go\\s*$");
    private static final Pattern CRIAR = Pattern.compile(
            "(?is)^\\s*create\\s+(view|procedure|proc|function|trigger|table)\\s+(?:dbo\\.)?\\[?(\\w+)\\]?");

    private final JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) throws IOException {
        String script = new String(new ClassPathResource("Banco_de_dados-Kartodromo.sql").getInputStream().readAllBytes(),
                StandardCharsets.UTF_8);
        Matcher primeira = PRIMEIRA_VIEW.matcher(script);
        if (!primeira.find()) {
            throw new IllegalStateException("Script do banco sem a parte de administração de banco de dados (nenhuma view encontrada).");
        }
        int ini = primeira.start();
        int criados = 0;
        for (String lote : LINHA_GO.split(script.substring(ini))) {
            // tira os comentarios para descobrir o que o lote faz
            Matcher m = CRIAR.matcher(lote.replaceAll("(?m)^\\s*--.*$", "").trim());
            if (!m.find()) {
                continue; // teste (select, exec, insert, update...) ou lote so de comentarios
            }
            String nome = m.group(2);
            if (jdbc.queryForObject("select object_id(?)", Integer.class, nome) != null) {
                continue; // ja existe
            }
            jdbc.execute(lote);
            criados++;
            log.info("Banco: {} {} criado.", m.group(1).toLowerCase(), nome);
        }
        log.info("Recursos de banco verificados: {} criado(s) agora.", criados);
    }
}
