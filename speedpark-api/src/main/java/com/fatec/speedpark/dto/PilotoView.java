package com.fatec.speedpark.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fatec.speedpark.entities.Cliente;
import com.fatec.speedpark.entities.Pessoa;

/** Formato que o front ja usa para piloto/usuario (role em minusculas, CPF mascarado). Nunca inclui senha. */
public record PilotoView(
        Integer id,
        String nome,
        String cpf,
        String email,
        String telefone,
        LocalDate nascimento,
        Integer altura,
        BigDecimal peso,
        String role,
        LocalDateTime criadoEm) {

    public static PilotoView de(Pessoa p, Cliente c) {
        String cpf = p.getCpf();
        String cpfMascarado = cpf != null && cpf.length() == 11
                ? cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9)
                : cpf;
        return new PilotoView(p.getCodigo(), p.getNome(), cpfMascarado, p.getEmail(), p.getFone(),
                c == null ? null : c.getDataNascimento(), c == null ? null : c.getAltura(),
                c == null ? null : c.getPeso(), p.getPerfil().toLowerCase(), p.getCriadoEm());
    }
}
