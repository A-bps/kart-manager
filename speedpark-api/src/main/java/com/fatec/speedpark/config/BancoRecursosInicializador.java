package com.fatec.speedpark.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
 * Garante no banco os recursos de administracao (views, procedures, function, triggers).
 *
 * A fonte unica e o script oficial Banco_de_dados-Kartodromo.sql: aqui so executamos o trecho entre
 * "@@INICIO_ADMINISTRACAO_BD@@" e "@@FIM_ADMINISTRACAO_BD@@", dividido nas linhas "go". Todo o trecho usa
 * "create or alter" / "if object_id(...) is null", entao rodar de novo e seguro. Isso cobre o caso do banco
 * que foi criado pelo Hibernate (sem o script): ao subir, a API instala o que falta.
 * Roda depois do Hibernate criar/atualizar as tabelas.
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class BancoRecursosInicializador implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BancoRecursosInicializador.class);
    private static final String INICIO = "@@INICIO_ADMINISTRACAO_BD@@";
    private static final String FIM = "@@FIM_ADMINISTRACAO_BD@@";
    private static final Pattern LINHA_GO = Pattern.compile("(?im)^\\s*go\\s*$");

    private final JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) throws IOException {
        String script = new String(new ClassPathResource("Banco_de_dados-Kartodromo.sql").getInputStream().readAllBytes(),
                StandardCharsets.UTF_8);
        int ini = script.indexOf(INICIO);
        int fim = script.indexOf(FIM);
        if (ini < 0 || fim < ini) {
            throw new IllegalStateException("Script do banco sem o bloco de administracao (marcadores nao encontrados).");
        }
        // pula o resto da linha do marcador de inicio
        String bloco = script.substring(script.indexOf('\n', ini) + 1, fim);

        int total = 0;
        for (String lote : LINHA_GO.split(bloco)) {
            // lote so de comentarios/linhas em branco nao tem o que executar
            String semComentarios = lote.replaceAll("(?m)^\\s*--.*$", "").trim();
            if (semComentarios.isEmpty()) {
                continue;
            }
            jdbc.execute(lote);
            total++;
        }
        log.info("Recursos de banco (views, procedures, function, triggers) garantidos: {} lotes executados.", total);
    }
}
