# Dicionário de Dados – Speed Park (banco KartManager)

Gerado a partir do banco criado pelo script Banco_de_dados-Kartodromo.sql no SQL Server. **PK** = chave primária, **FK** = chave estrangeira (referência), **UQ** = valor único, **Nulo** = aceita vazio.

## Índice das tabelas

| Tabela | Descrição |
|---|---|
| [Cep](#cep) | CEPs com o endereço (rua, bairro) e a cidade. |
| [Cidade](#cidade) | Cidades, cada uma ligada a um estado. |
| [Cliente](#cliente) | Piloto (especialização de Pessoa): data de nascimento, altura e peso. |
| [Cliente_Corrida](#cliente_corrida) | Tabela associativa: quais clientes participam de qual corrida (N:N). |
| [Corrida](#corrida) | Corridas do modelo original do banco (data, horário, pista). |
| [Corrida_Kart](#corrida_kart) | Tabela associativa: quais karts são usados em qual corrida (N:N). |
| [Dependente](#dependente) | Filhos/dependentes de um piloto, usados para reservar na categoria certa. |
| [Faturamento](#faturamento) | Lançamentos financeiros (recebimentos, pendências e estornos). |
| [Funcionario](#funcionario) | Pessoa que trabalha no kartódromo (especialização de Pessoa), com salário. |
| [Gerente](#gerente) | Funcionário que gerencia outros funcionários (especialização de Funcionario). |
| [Kart](#kart) | Karts da frota, com número e estado (pronto, atenção, manutenção). |
| [LOG_AuditoriaFaturamento](#log_auditoriafaturamento) | Log gravado pela trigger tg_AuditoriaFaturamento a cada lançamento criado ou alterado. |
| [LOG_HistoricoEstadoKart](#log_historicoestadokart) | Log gravado pela trigger tg_HistEstadoKart a cada mudança de estado de um kart. |
| [LOG_HistoricoNovaReserva](#log_historiconovareserva) | Log gravado pela trigger tg_HistNovaReserva a cada reserva criada. |
| [Manutencao](#manutencao) | Manutenções feitas nos karts, com status e valor. |
| [Pagamento](#pagamento) | Pagamentos do modelo original, ligados a cliente e corrida. |
| [Pessoa](#pessoa) | Dados comuns de quem usa o sistema: nome, CPF, e-mail, telefone, senha (hash BCrypt) e perfil (ADMIN ou PILOTO). |
| [Pista](#pista) | Pistas do kartódromo: código, capacidade, tamanho, preços e a categoria que pode correr nela. |
| [Prova](#prova) | Corridas realizadas no painel do admin (iniciada, encerrada, duração). |
| [Reserva](#reserva) | Reservas de horário feitas pelo site ou no balcão: pista, data, horário, participante e cobrança. |
| [Resultado](#resultado) | Resultado de cada piloto em uma prova: posição, kart, melhor volta e penalidades. |
| [Uf](#uf) | Estados (unidades da federação). |

## Cep

CEPs com o endereço (rua, bairro) e a cidade.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| numero | char(8) | não | PK |  |  |
| cidade_codigo | int | não | FK | Cidade.codigo |  |

## Cidade

Cidades, cada uma ligada a um estado.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| nome | varchar(100) | não |  |  |  |
| uf_sigla | char(2) | não | FK | Uf.sigla |  |

## Cliente

Piloto (especialização de Pessoa): data de nascimento, altura e peso.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| pessoa_codigo | int | não | PK, FK | Pessoa.codigo |  |
| data_nascimento | date | não |  |  |  |
| altura | int | sim |  |  |  |
| peso | decimal(5,1) | sim |  |  |  |

## Cliente_Corrida

Tabela associativa: quais clientes participam de qual corrida (N:N).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| cliente_codigo | int | não | PK, FK | Cliente.pessoa_codigo |  |
| corrida_nr | int | não | PK, FK | Corrida.nr |  |
| melhor_volta | time | sim |  |  |  |
| penalidade | varchar(100) | sim |  |  |  |
| tempo | time | sim |  |  |  |
| posicao | int | sim |  |  |  |

## Corrida

Corridas do modelo original do banco (data, horário, pista).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| nr | int | não | PK |  | identity (automático) |
| preco | money | não |  |  |  |
| data | date | não |  |  |  |
| horario | time | não |  |  |  |
| pista_nr | int | não | FK | Pista.nr |  |
| funcionario_codigo | int | não | FK | Funcionario.pessoa_codigo |  |

## Corrida_Kart

Tabela associativa: quais karts são usados em qual corrida (N:N).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| corrida_nr | int | não | PK, FK | Corrida.nr |  |
| kart_codigo | int | não | PK, FK | Kart.codigo |  |

## Dependente

Filhos/dependentes de um piloto, usados para reservar na categoria certa.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| responsavel_codigo | int | não | FK | Cliente.pessoa_codigo |  |
| nome | varchar(100) | não |  |  |  |
| nascimento | date | não |  |  |  |
| categoria | varchar(20) | não |  |  |  |
| altura | int | sim |  |  |  |
| peso | decimal(5,1) | sim |  |  |  |

## Faturamento

Lançamentos financeiros (recebimentos, pendências e estornos).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| data | date | não |  |  |  |
| valor | decimal(19,2) | não |  |  |  |
| descricao | varchar(200) | sim |  |  |  |
| forma_pagamento | varchar(30) | sim |  |  |  |
| status | varchar(20) | não |  |  |  |

## Funcionario

Pessoa que trabalha no kartódromo (especialização de Pessoa), com salário.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| pessoa_codigo | int | não | PK, FK | Pessoa.codigo |  |
| salario | money | não |  |  |  |

## Gerente

Funcionário que gerencia outros funcionários (especialização de Funcionario).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| pessoa_codigo | int | não | PK, FK | Funcionario.pessoa_codigo |  |
| salario_extra | money | não |  |  |  |

## Kart

Karts da frota, com número e estado (pronto, atenção, manutenção).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| numero | int | sim | UQ |  |  |
| estado | varchar(50) | não |  |  |  |
| historico | varchar(255) | sim |  |  |  |

## LOG_AuditoriaFaturamento

Log gravado pela trigger tg_AuditoriaFaturamento a cada lançamento criado ou alterado.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| idLog | int | não | PK |  | identity (automático) |
| idFaturamento | int | não |  |  |  |
| operacao | varchar(10) | não |  |  |  |
| valorAnterior | decimal(19,2) | sim |  |  |  |
| valorNovo | decimal(19,2) | sim |  |  |  |
| statusAnterior | varchar(20) | sim |  |  |  |
| statusNovo | varchar(20) | sim |  |  |  |
| data | datetime | não |  |  |  |
| usuario | varchar(100) | não |  |  |  |

## LOG_HistoricoEstadoKart

Log gravado pela trigger tg_HistEstadoKart a cada mudança de estado de um kart.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| idLog | int | não | PK |  | identity (automático) |
| idKart | int | não |  |  |  |
| numeroKart | int | sim |  |  |  |
| estadoAnterior | varchar(50) | sim |  |  |  |
| estadoNovo | varchar(50) | sim |  |  |  |
| data | datetime | não |  |  |  |
| usuario | varchar(100) | não |  |  |  |

## LOG_HistoricoNovaReserva

Log gravado pela trigger tg_HistNovaReserva a cada reserva criada.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| idLog | int | não | PK |  | identity (automático) |
| idReserva | int | não |  |  |  |
| idCliente | int | sim |  |  |  |
| participante | varchar(100) | não |  |  |  |
| valor | decimal(19,2) | sim |  |  |  |
| data | datetime | não |  |  |  |
| usuario | varchar(100) | não |  |  |  |

## Manutencao

Manutenções feitas nos karts, com status e valor.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| status | varchar(50) | não |  |  |  |
| valor | money | não |  |  |  |
| forma_pagamento | varchar(50) | sim |  |  |  |
| kart_codigo | int | não | FK | Kart.codigo |  |

## Pagamento

Pagamentos do modelo original, ligados a cliente e corrida.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| valor | money | não |  |  |  |
| status | varchar(50) | não |  |  |  |
| forma_pagamento | varchar(50) | não |  |  |  |
| cliente_codigo | int | não | FK | Cliente.pessoa_codigo |  |
| corrida_nr | int | não | FK | Corrida.nr |  |

## Pessoa

Dados comuns de quem usa o sistema: nome, CPF, e-mail, telefone, senha (hash BCrypt) e perfil (ADMIN ou PILOTO).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| nome | varchar(100) | não |  |  |  |
| cpf | char(11) | não | UQ |  |  |
| email | varchar(100) | sim | UQ |  |  |
| fone | varchar(20) | sim |  |  |  |
| cep_numero | char(8) | sim | FK | Cep.numero |  |
| senha_hash | varchar(100) | sim |  |  |  |
| perfil | varchar(20) | não |  |  | padrão 'PILOTO' |
| criado_em | datetime2 | sim |  |  | padrão sysdatetime() |

## Pista

Pistas do kartódromo: código, capacidade, tamanho, preços e a categoria que pode correr nela.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| nr | int | não | PK |  | identity (automático) |
| nome | varchar(100) | não |  |  |  |
| codigo | varchar(20) | sim | UQ |  |  |
| capacidade | int | sim |  |  |  |
| metros | int | sim |  |  |  |
| preco_por_min | decimal(10,2) | sim |  |  |  |
| preco_por_volta | decimal(10,2) | sim |  |  |  |
| categoria | varchar(20) | sim |  |  |  |

## Prova

Corridas realizadas no painel do admin (iniciada, encerrada, duração).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| numero | int | não |  |  |  |
| pista_nr | int | não | FK | Pista.nr |  |
| duracao_seg | int | não |  |  |  |
| iniciada_em | datetime2 | não |  |  | padrão sysdatetime() |
| encerrada_em | datetime2 | sim |  |  |  |
| status | varchar(10) | não |  |  | padrão 'ativa' |

## Reserva

Reservas de horário feitas pelo site ou no balcão: pista, data, horário, participante e cobrança.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| cliente_codigo | int | sim | FK | Cliente.pessoa_codigo |  |
| participante | varchar(100) | não |  |  |  |
| pista_nr | int | não | FK | Pista.nr |  |
| data | date | não |  |  |  |
| horario | time | não |  |  |  |
| formato | varchar(10) | sim |  |  |  |
| qtd | int | sim |  |  |  |
| forma_pagamento | varchar(30) | sim |  |  |  |
| valor | decimal(19,2) | sim |  |  |  |
| criada_em | datetime2 | não |  |  | padrão sysdatetime() |

## Resultado

Resultado de cada piloto em uma prova: posição, kart, melhor volta e penalidades.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| prova_id | int | não | FK | Prova.id |  |
| posicao | int | não |  |  |  |
| kart | varchar(10) | sim |  |  |  |
| piloto_nome | varchar(100) | não |  |  |  |
| melhor_volta | varchar(20) | sim |  |  |  |
| penalidades | varchar(100) | sim |  |  |  |

## Uf

Estados (unidades da federação).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| sigla | char(2) | não | PK |  |  |
| nome | varchar(50) | não |  |  |  |
