package com.fatec.speedpark.security;

import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fatec.speedpark.exceptions.TentativasExcedidasException;

/**
 * Bloqueio contra tentativas repetidas (adivinhar senha ou CPF): depois de N falhas seguidas na mesma chave
 * (e-mail), novas tentativas sao recusadas por um tempo, mesmo que acertem. Sucesso zera o contador.
 * ponytail: contadores em memoria — somem ao reiniciar a API e valem por instancia; o bloqueio e por e-mail
 * (nao por IP), entao alguem pode travar a conta de outra pessoa por alguns minutos. Para producao: Redis/banco
 * e limite por IP.
 */
@Component
public class TentativasLogin {

    private record Estado(int falhas, Instant ultimaFalha, Instant bloqueadoAte) {
    }

    private static final int LIMITE_DE_CHAVES = 10_000;

    private final int maximo;
    private final long bloqueioSegundos;
    private final Clock relogio;
    private final ConcurrentHashMap<String, Estado> estados = new ConcurrentHashMap<>();

    @Autowired
    public TentativasLogin(@Value("${speedpark.login.max-tentativas:5}") int maximo,
            @Value("${speedpark.login.bloqueio-segundos:900}") long bloqueioSegundos) {
        this(maximo, bloqueioSegundos, Clock.systemDefaultZone());
    }

    TentativasLogin(int maximo, long bloqueioSegundos, Clock relogio) {
        this.maximo = maximo;
        this.bloqueioSegundos = bloqueioSegundos;
        this.relogio = relogio;
    }

    /** Lanca se a chave esta bloqueada. Chamar antes de conferir a senha. */
    public void verificar(String chave) {
        Estado e = estados.get(chave);
        if (e == null || e.bloqueadoAte() == null) {
            return;
        }
        Instant agora = relogio.instant();
        if (agora.isBefore(e.bloqueadoAte())) {
            throw new TentativasExcedidasException(e.bloqueadoAte().getEpochSecond() - agora.getEpochSecond());
        }
        estados.remove(chave, e); // bloqueio acabou: recomeca do zero
    }

    /** Registra uma falha. Se atingiu o limite, bloqueia e lanca (a propria tentativa que estourou ja e recusada). */
    public void falhou(String chave) {
        Instant agora = relogio.instant();
        if (estados.size() > LIMITE_DE_CHAVES) {
            estados.entrySet().removeIf(en -> en.getValue().ultimaFalha().plusSeconds(bloqueioSegundos).isBefore(agora));
        }
        Estado novo = estados.merge(chave, new Estado(1, agora, null), (antigo, ignorado) -> {
            // falhas antigas (fora da janela) nao contam
            int base = antigo.ultimaFalha().plusSeconds(bloqueioSegundos).isBefore(agora) ? 0 : antigo.falhas();
            int total = base + 1;
            return new Estado(total, agora, total >= maximo ? agora.plusSeconds(bloqueioSegundos) : null);
        });
        if (novo.bloqueadoAte() != null) {
            throw new TentativasExcedidasException(bloqueioSegundos);
        }
    }

    public void sucesso(String chave) {
        estados.remove(chave);
    }
}
