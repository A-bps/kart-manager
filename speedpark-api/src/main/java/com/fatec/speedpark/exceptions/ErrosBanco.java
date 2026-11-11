package com.fatec.speedpark.exceptions;

import java.util.NoSuchElementException;

import org.springframework.security.access.AccessDeniedException;

/**
 * Traduz o retorno de erro das stored procedures (colunas NumeroErro e MensagemErro) para as excecoes da API,
 * que o ApiExceptionHandler transforma em 400/403/404/409. Os numeros estao no cabecalho da procedure,
 * no script do banco.
 */
public final class ErrosBanco {

    private ErrosBanco() {
    }

    public static RuntimeException traduzir(int numeroErro, String mensagem) {
        return switch (numeroErro) {
            case 50001 -> new ConflitoException(mensagem);
            case 50002, 50007 -> new IllegalArgumentException(mensagem);
            case 50003, 50005 -> new NoSuchElementException(mensagem);
            case 50004, 50006 -> new AccessDeniedException(mensagem);
            // qualquer outro erro do banco (ex.: violacao de chave) nao e regra de negocio conhecida
            default -> new IllegalStateException("Erro no banco de dados (" + numeroErro + "): " + mensagem);
        };
    }
}
