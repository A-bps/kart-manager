package com.fatec.speedpark.exceptions;

/** Muitas tentativas seguidas erradas: a chave (e-mail) fica bloqueada por um tempo (vira HTTP 429). */
public class TentativasExcedidasException extends RuntimeException {

    private final long segundos;

    public TentativasExcedidasException(long segundos) {
        super("Muitas tentativas erradas. Tente novamente em " + Math.max(1, (segundos + 59) / 60) + " minuto(s).");
        this.segundos = Math.max(1, segundos);
    }

    public long getSegundos() {
        return segundos;
    }
}
