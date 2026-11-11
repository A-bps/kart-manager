package com.fatec.speedpark.exceptions;

import java.sql.SQLException;
import java.util.NoSuchElementException;

import org.springframework.dao.DataAccessException;
import org.springframework.security.access.AccessDeniedException;

/**
 * Traduz os erros que as stored procedures lancam com THROW (numeros 50001...) para as excecoes da API,
 * que o ApiExceptionHandler transforma em 400/403/404/409. Veja os numeros no script do banco.
 */
public final class ErrosBanco {

    private ErrosBanco() {
    }

    public static RuntimeException traduzir(DataAccessException e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof SQLException sql) {
                String msg = sql.getMessage();
                switch (sql.getErrorCode()) {
                    case 50001, 50012 -> { return new ConflitoException(msg); }
                    case 50002, 50007, 50013 -> { return new IllegalArgumentException(msg); }
                    case 50003, 50005, 50011 -> { return new NoSuchElementException(msg); }
                    case 50004, 50006 -> { return new AccessDeniedException(msg); }
                    default -> { /* erro de banco que nao e regra de negocio: segue */ }
                }
            }
        }
        return e;
    }
}
