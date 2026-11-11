package com.fatec.speedpark.services;

import java.util.List;
import java.util.Map;

/**
 * Le o que as procedures do banco devolvem: uma linha com "id" (deu certo) ou com
 * NumeroErro/MensagemErro (o banco ja desfez a transacao).
 */
final class RetornoProcedure {

    private RetornoProcedure() {
    }

    static Integer id(List<Map<String, Object>> retorno) {
        Map<String, Object> linha = retorno.get(0);
        if (linha.containsKey("NumeroErro")) {
            throw new IllegalStateException("Erro no banco de dados (" + linha.get("NumeroErro") + "): " + linha.get("MensagemErro"));
        }
        return ((Number) linha.get("id")).intValue();
    }
}
