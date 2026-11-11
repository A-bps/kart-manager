package com.fatec.speedpark.exceptions;

/** Regra de negocio violada por conflito com o estado atual (vira HTTP 409). */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
