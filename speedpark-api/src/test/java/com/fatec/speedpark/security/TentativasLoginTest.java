package com.fatec.speedpark.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import com.fatec.speedpark.exceptions.TentativasExcedidasException;

/** Teste puro (sem Spring nem banco): usa um relogio controlado para provar bloqueio e desbloqueio. */
class TentativasLoginTest {

    /** Relogio que so anda quando mandamos. */
    static class RelogioManual extends Clock {
        Instant agora = Instant.parse("2026-01-01T12:00:00Z");

        @Override public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId z) { return this; }
        @Override public Instant instant() { return agora; }
        void avanca(Duration d) { agora = agora.plus(d); }
    }

    @Test
    void bloqueiaNaQuintaFalhaERecusaAteComSenhaCerta() {
        RelogioManual relogio = new RelogioManual();
        TentativasLogin t = new TentativasLogin(5, 900, relogio);
        for (int i = 1; i <= 4; i++) {
            t.verificar("a@x.com");
            assertDoesNotThrow(() -> t.falhou("a@x.com"));
        }
        t.verificar("a@x.com"); // ainda livre
        assertThrows(TentativasExcedidasException.class, () -> t.falhou("a@x.com")); // 5a falha bloqueia
        assertThrows(TentativasExcedidasException.class, () -> t.verificar("a@x.com")); // mesmo acertando, recusa
    }

    @Test
    void bloqueioAcabaDepoisDoTempoERecomecaDoZero() {
        RelogioManual relogio = new RelogioManual();
        TentativasLogin t = new TentativasLogin(3, 60, relogio);
        for (int i = 0; i < 2; i++) t.falhou("a@x.com");
        assertThrows(TentativasExcedidasException.class, () -> t.falhou("a@x.com"));
        relogio.avanca(Duration.ofSeconds(59));
        assertThrows(TentativasExcedidasException.class, () -> t.verificar("a@x.com")); // 1s antes: ainda bloqueado
        relogio.avanca(Duration.ofSeconds(2));
        assertDoesNotThrow(() -> t.verificar("a@x.com")); // liberou
        // contador recomecou: leva 3 falhas de novo para bloquear
        assertDoesNotThrow(() -> t.falhou("a@x.com"));
        assertDoesNotThrow(() -> t.falhou("a@x.com"));
        assertThrows(TentativasExcedidasException.class, () -> t.falhou("a@x.com"));
    }

    @Test
    void sucessoZeraOContadorEChavesSaoIndependentes() {
        TentativasLogin t = new TentativasLogin(3, 60, new RelogioManual());
        t.falhou("a@x.com");
        t.falhou("a@x.com");
        t.sucesso("a@x.com"); // acertou a senha: zera
        assertDoesNotThrow(() -> t.falhou("a@x.com"));
        assertDoesNotThrow(() -> t.falhou("a@x.com"));
        // outro e-mail nao e afetado
        assertDoesNotThrow(() -> t.verificar("b@x.com"));
        assertDoesNotThrow(() -> t.falhou("b@x.com"));
    }

    @Test
    void falhasAntigasForaDaJanelaNaoContam() {
        RelogioManual relogio = new RelogioManual();
        TentativasLogin t = new TentativasLogin(3, 60, relogio);
        t.falhou("a@x.com");
        t.falhou("a@x.com");
        relogio.avanca(Duration.ofSeconds(120)); // as 2 falhas ficaram para tras
        assertDoesNotThrow(() -> t.falhou("a@x.com")); // conta como a 1a, nao a 3a
    }
}
