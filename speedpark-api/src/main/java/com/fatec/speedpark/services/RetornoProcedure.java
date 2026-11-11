package com.fatec.speedpark.services;

import java.util.List;
import java.util.Map;

import com.fatec.speedpark.exceptions.ConflitoException;

/**
 * Le o que as procedures do banco devolvem: uma linha com "id" (deu certo) ou com
 * NumeroErro/MensagemErro (o banco ja desfez a transacao). Erro 50000 e o raiserror da propria
 * procedure (regra de negocio, ex.: horario lotado) e vira 409; qualquer outro e erro do banco.
 */
final class RetornoProcedure {

    private RetornoProcedure() {
    }

    static Integer id(List<Map<String, Object>> retorno) {
        Map<String, Object> linha = retorno.get(0);
        if (linha.containsKey("NumeroErro")) {
            if (((Number) linha.get("NumeroErro")).intValue() == 50000) {
                throw new ConflitoException((String) linha.get("MensagemErro"));
            }
            throw new IllegalStateException("Erro no banco de dados (" + linha.get("NumeroErro") + "): " + linha.get("MensagemErro"));
        }
        return ((Number) linha.get("id")).intValue();
    }
}
