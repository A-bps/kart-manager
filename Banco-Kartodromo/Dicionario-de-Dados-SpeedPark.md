# Dicionário de Dados – Speed Park (banco KartManager)

Gerado a partir do banco real em SQL Server. **PK** = chave primária, **FK** = chave estrangeira (referência), **UQ** = valor único, **Nulo** = aceita vazio.

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
| numero | varchar(8) | não | PK |  |  |
| cidade_codigo | int | não | FK | Cidade.codigo |  |

## Cidade

Cidades, cada uma ligada a um estado.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| nome | varchar(100) | não |  |  |  |
| uf_sigla | varchar(2) | não | FK | Uf.sigla |  |

## Cliente

Piloto (especialização de Pessoa): data de nascimento, altura e peso.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| pessoa_codigo | int | não | PK, FK | Pessoa.codigo |  |
| data_nascimento | date | não |  |  |  |
| altura | int | sim |  |  |  |
| peso | numeric(5,1) | sim |  |  |  |

## Cliente_Corrida

Tabela associativa: quais clientes participam de qual corrida (N:N).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| melhor_volta | time | sim |  |  |  |
| penalidade | varchar(100) | sim |  |  |  |
| posicao | int | sim |  |  |  |
| tempo | time | sim |  |  |  |
| cliente_codigo | int | não | PK, FK | Cliente.pessoa_codigo |  |
| corrida_nr | int | não | PK, FK | Corrida.nr |  |

## Corrida

Corridas do modelo original do banco (data, horário, pista).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| nr | int | não | PK |  | identity (automático) |
| data | date | não |  |  |  |
| horario | time | não |  |  |  |
| preco | numeric(19,2) | não |  |  |  |
| funcionario_codigo | int | não | FK | Funcionario.pessoa_codigo |  |
| pista_nr | int | não | FK | Pista.nr |  |

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
| altura | int | sim |  |  |  |
| categoria | varchar(20) | não |  |  |  |
| nascimento | date | não |  |  |  |
| nome | varchar(100) | não |  |  |  |
| peso | numeric(5,1) | sim |  |  |  |
| responsavel_codigo | int | não | FK | Cliente.pessoa_codigo |  |

## Faturamento

Lançamentos financeiros (recebimentos, pendências e estornos).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| data | date | não |  |  |  |
| descricao | varchar(200) | sim |  |  |  |
| forma_pagamento | varchar(30) | sim |  |  |  |
| status | varchar(20) | não |  |  |  |
| valor | numeric(19,2) | não |  |  |  |

## Funcionario

Pessoa que trabalha no kartódromo (especialização de Pessoa), com salário.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| pessoa_codigo | int | não | PK, FK | Pessoa.codigo |  |
| salario | numeric(19,2) | não |  |  |  |

## Gerente

Funcionário que gerencia outros funcionários (especialização de Funcionario).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| pessoa_codigo | int | não | PK, FK | Funcionario.pessoa_codigo |  |
| salario_extra | numeric(19,2) | não |  |  |  |

## Kart

Karts da frota, com número e estado (pronto, atenção, manutenção).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| estado | varchar(50) | não |  |  |  |
| historico | varchar(255) | sim |  |  |  |
| numero | int | sim | UQ |  |  |

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
| forma_pagamento | varchar(50) | sim |  |  |  |
| status | varchar(50) | não |  |  |  |
| valor | numeric(19,2) | não |  |  |  |
| kart_codigo | int | não | FK | Kart.codigo |  |

## Pagamento

Pagamentos do modelo original, ligados a cliente e corrida.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| forma_pagamento | varchar(50) | não |  |  |  |
| status | varchar(50) | não |  |  |  |
| valor | numeric(19,2) | não |  |  |  |
| cliente_codigo | int | não | FK | Cliente.pessoa_codigo |  |
| corrida_nr | int | não | FK | Corrida.nr |  |

## Pessoa

Dados comuns de quem usa o sistema: nome, CPF, e-mail, telefone, senha (hash BCrypt) e perfil (ADMIN ou PILOTO).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| codigo | int | não | PK |  | identity (automático) |
| cpf | varchar(11) | não | UQ |  |  |
| email | varchar(100) | sim |  |  |  |
| fone | varchar(20) | sim |  |  |  |
| nome | varchar(100) | não |  |  |  |
| cep_numero | varchar(8) | sim | FK | Cep.numero |  |
| criado_em | datetime2 | sim |  |  |  |
| senha_hash | varchar(100) | sim |  |  |  |
| perfil | varchar(20) | não |  |  | padrão 'PILOTO' |

## Pista

Pistas do kartódromo: código, capacidade, tamanho, preços e a categoria que pode correr nela.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| nr | int | não | PK |  | identity (automático) |
| nome | varchar(100) | não |  |  |  |
| capacidade | int | sim |  |  |  |
| categoria | varchar(20) | sim |  |  |  |
| codigo | varchar(20) | sim | UQ |  |  |
| metros | int | sim |  |  |  |
| preco_por_min | numeric(10,2) | sim |  |  |  |
| preco_por_volta | numeric(10,2) | sim |  |  |  |

## Prova

Corridas realizadas no painel do admin (iniciada, encerrada, duração).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| duracao_seg | int | não |  |  |  |
| encerrada_em | datetime2 | sim |  |  |  |
| iniciada_em | datetime2 | não |  |  |  |
| numero | int | não |  |  |  |
| status | varchar(10) | não |  |  |  |
| pista_nr | int | não | FK | Pista.nr |  |

## Reserva

Reservas de horário feitas pelo site ou no balcão: pista, data, horário, participante e cobrança.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| criada_em | datetime2 | não |  |  |  |
| data | date | não |  |  |  |
| forma_pagamento | varchar(30) | sim |  |  |  |
| formato | varchar(10) | sim |  |  |  |
| horario | time | não |  |  |  |
| participante | varchar(100) | não |  |  |  |
| qtd | int | sim |  |  |  |
| valor | numeric(19,2) | sim |  |  |  |
| cliente_codigo | int | sim | FK | Cliente.pessoa_codigo |  |
| pista_nr | int | não | FK | Pista.nr |  |

## Resultado

Resultado de cada piloto em uma prova: posição, kart, melhor volta e penalidades.

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| id | int | não | PK |  | identity (automático) |
| kart | varchar(10) | sim |  |  |  |
| melhor_volta | varchar(20) | sim |  |  |  |
| penalidades | varchar(100) | sim |  |  |  |
| piloto_nome | varchar(100) | não |  |  |  |
| posicao | int | não |  |  |  |
| prova_id | int | não | FK | Prova.id |  |

## Uf

Estados (unidades da federação).

| Coluna | Tipo | Nulo | Chave | Referência | Padrão / restrição |
|---|---|---|---|---|---|
| sigla | varchar(2) | não | PK |  |  |
| nome | varchar(50) | não |  |  |  |
