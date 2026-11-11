create database KartManager
go
use KartManager
go

-- =========================================
-- CRIACAO DAS TABELAS
-- =========================================

create table Uf
(
    sigla char(2) not null,
    nome  varchar(50) not null,
    constraint pk_uf primary key(sigla)
)
go

create table Cidade
(
    codigo   int identity not null,
    nome     varchar(100) not null,
    uf_sigla char(2) not null,
    constraint pk_cidade primary key(codigo),
    constraint fk_cidade_uf foreign key(uf_sigla) references Uf(sigla)
)
go

create table Cep
(
    numero        char(8) not null,
    cidade_codigo int not null,
    constraint pk_cep primary key(numero),
    constraint fk_cep_cidade foreign key(cidade_codigo) references Cidade(codigo)
)
go

create table Pessoa
(
    codigo     int identity not null,
    nome       varchar(100) not null,
    cpf        char(11) not null,
    email      varchar(100),
    fone       varchar(20),
    cep_numero char(8),
    senha_hash varchar(100),
    perfil     varchar(20) not null default 'PILOTO',
    criado_em  datetime2 default sysdatetime(),
    constraint pk_pessoa primary key(codigo),
    constraint uq_pessoa_cpf unique(cpf),
    constraint uq_pessoa_email unique(email),
    constraint fk_pessoa_cep foreign key(cep_numero) references Cep(numero)
)
go

create table Funcionario
(
    pessoa_codigo int not null,
    salario       money not null,
    constraint pk_funcionario primary key(pessoa_codigo),
    constraint fk_funcionario_pessoa foreign key(pessoa_codigo) references Pessoa(codigo)
)
go

create table Gerente
(
    pessoa_codigo int not null,
    salario_extra money not null,
    constraint pk_gerente primary key(pessoa_codigo),
    constraint fk_gerente_funcionario foreign key(pessoa_codigo) references Funcionario(pessoa_codigo)
)
go

create table Pista
(
    nr   int identity not null,
    nome varchar(100) not null,
    codigo         varchar(20),
    capacidade     int,
    metros         int,
    preco_por_min  decimal(10,2),
    preco_por_volta decimal(10,2),
    categoria      varchar(20),
    constraint pk_pista primary key(nr)
)
go

create table Cliente
(
    pessoa_codigo   int not null,
    data_nascimento date not null,
    altura          int,
    peso            decimal(5,1),
    constraint pk_cliente primary key(pessoa_codigo),
    constraint fk_cliente_pessoa foreign key(pessoa_codigo) references Pessoa(codigo)
)
go

create table Kart
(
    codigo   int identity not null,
    numero   int,
    estado   varchar(50) not null,
    historico varchar(255),
    constraint pk_kart primary key(codigo)
)
go

create table Corrida
(
    nr                 int identity not null,
    preco              money not null,
    data               date not null,
    horario            time not null,
    pista_nr           int not null,
    funcionario_codigo int not null,
    constraint pk_corrida primary key(nr),
    constraint fk_corrida_pista foreign key(pista_nr) references Pista(nr),
    constraint fk_corrida_funcionario foreign key(funcionario_codigo) references Funcionario(pessoa_codigo)
)
go

create table Cliente_Corrida
(
    cliente_codigo int not null,
    corrida_nr     int not null,
    melhor_volta   time,
    penalidade     varchar(100),
    tempo          time,
    posicao        int,
    constraint pk_cliente_corrida primary key(cliente_codigo, corrida_nr),
    constraint fk_cliente_corrida_cliente foreign key(cliente_codigo) references Cliente(pessoa_codigo),
    constraint fk_cliente_corrida_corrida foreign key(corrida_nr) references Corrida(nr)
)
go

create table Corrida_Kart
(
    corrida_nr  int not null,
    kart_codigo int not null,
    constraint pk_corrida_kart primary key(corrida_nr, kart_codigo),
    constraint fk_corrida_kart_corrida foreign key(corrida_nr) references Corrida(nr),
    constraint fk_corrida_kart_kart foreign key(kart_codigo) references Kart(codigo)
)
go

create table Manutencao
(
    codigo          int identity not null,
    status          varchar(50) not null,
    valor           money not null,
    forma_pagamento varchar(50),
    kart_codigo     int not null,
    constraint pk_manutencao primary key(codigo),
    constraint fk_manutencao_kart foreign key(kart_codigo) references Kart(codigo)
)
go

create table Pagamento
(
    codigo          int identity not null,
    valor           money not null,
    status          varchar(50) not null,
    forma_pagamento varchar(50) not null,
    cliente_codigo  int not null,
    corrida_nr      int not null,
    constraint pk_pagamento primary key(codigo),
    constraint fk_pagamento_cliente foreign key(cliente_codigo) references Cliente(pessoa_codigo),
    constraint fk_pagamento_corrida foreign key(corrida_nr) references Corrida(nr)
)
go

create table Reserva
(
    id              int identity not null,
    cliente_codigo  int,
    participante    varchar(100) not null,
    pista_nr        int not null,
    data            date not null,
    horario         time not null,
    formato         varchar(10),
    qtd             int,
    forma_pagamento varchar(30),
    valor           decimal(19,2),
    criada_em       datetime2 not null default sysdatetime(),
    constraint pk_reserva primary key(id),
    constraint fk_reserva_cliente foreign key(cliente_codigo) references Cliente(pessoa_codigo),
    constraint fk_reserva_pista foreign key(pista_nr) references Pista(nr)
)
go

create table Faturamento
(
    id              int identity not null,
    data            date not null,
    valor           decimal(19,2) not null,
    descricao       varchar(200),
    forma_pagamento varchar(30),
    status          varchar(20) not null,
    constraint pk_faturamento primary key(id)
)
go

create table Prova
(
    id          int identity not null,
    numero      int not null,
    pista_nr    int not null,
    duracao_seg int not null,
    iniciada_em datetime2 not null default sysdatetime(),
    encerrada_em datetime2,
    status      varchar(10) not null default 'ativa',
    constraint pk_prova primary key(id),
    constraint fk_prova_pista foreign key(pista_nr) references Pista(nr)
)
go

create table Resultado
(
    id           int identity not null,
    prova_id     int not null,
    posicao      int not null,
    kart         varchar(10),
    piloto_nome  varchar(100) not null,
    melhor_volta varchar(20),
    penalidades  varchar(100),
    constraint pk_resultado primary key(id),
    constraint fk_resultado_prova foreign key(prova_id) references Prova(id)
)
go

create table Dependente
(
    id                int identity not null,
    responsavel_codigo int not null,
    nome              varchar(100) not null,
    nascimento        date not null,
    categoria         varchar(20) not null,
    altura            int,
    peso              decimal(5,1),
    constraint pk_dependente primary key(id),
    constraint fk_dependente_cliente foreign key(responsavel_codigo) references Cliente(pessoa_codigo)
)
go

-- codigo da pista e numero do kart so valem quando preenchidos (varios NULL permitidos)
set quoted_identifier on
go
create unique index uq_pista_codigo on Pista(codigo) where codigo is not null
create unique index uq_kart_numero on Kart(numero) where numero is not null
go

-- =========================================
-- INSERTS - UF
-- =========================================
insert into Uf (sigla, nome) values ('SP', 'São Paulo')
insert into Uf (sigla, nome) values ('RJ', 'Rio de Janeiro')
insert into Uf (sigla, nome) values ('MG', 'Minas Gerais')
insert into Uf (sigla, nome) values ('PR', 'Paraná')
insert into Uf (sigla, nome) values ('SC', 'Santa Catarina')
insert into Uf (sigla, nome) values ('RS', 'Rio Grande do Sul')
insert into Uf (sigla, nome) values ('BA', 'Bahia')
insert into Uf (sigla, nome) values ('GO', 'Goiás')
insert into Uf (sigla, nome) values ('MT', 'Mato Grosso')
insert into Uf (sigla, nome) values ('ES', 'Espírito Santo')
go

-- =========================================
-- INSERTS - CIDADE
-- =========================================
insert into Cidade (nome, uf_sigla) values ('São José dos Campos', 'SP')
insert into Cidade (nome, uf_sigla) values ('Taubaté', 'SP')
insert into Cidade (nome, uf_sigla) values ('Niterói', 'RJ')
insert into Cidade (nome, uf_sigla) values ('Uberlândia', 'MG')       
insert into Cidade (nome, uf_sigla) values ('Londrina', 'PR')
insert into Cidade (nome, uf_sigla) values ('Joinville', 'SC')
insert into Cidade (nome, uf_sigla) values ('Caxias do Sul', 'RS')
insert into Cidade (nome, uf_sigla) values ('Feira de Santana', 'BA')
insert into Cidade (nome, uf_sigla) values ('Anápolis', 'GO')
insert into Cidade (nome, uf_sigla) values ('Vila Velha', 'ES')
go

-- =========================================
-- INSERTS - CEP
-- =========================================
insert into Cep (numero, cidade_codigo) values ('12245580', 1)
insert into Cep (numero, cidade_codigo) values ('12070320', 2)
insert into Cep (numero, cidade_codigo) values ('24020210', 3)
insert into Cep (numero, cidade_codigo) values ('38408100', 4)
insert into Cep (numero, cidade_codigo) values ('86010250', 5)
insert into Cep (numero, cidade_codigo) values ('89201130', 6)
insert into Cep (numero, cidade_codigo) values ('95020450', 7)
insert into Cep (numero, cidade_codigo) values ('44015420', 8)
insert into Cep (numero, cidade_codigo) values ('75110390', 9)
insert into Cep (numero, cidade_codigo) values ('29101735', 10)
go

-- =========================================
-- INSERTS - PESSOA
-- =========================================
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Samuel David',       '48392015077', 'samuka.dev@gmail.com',        '12997451230', '12245580')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Arthur Bathaus',     '10584732091', 'arthur.bathaus@hotmail.com',  '12988341211', '12070320')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Victor Hugo Martins','78219463055', 'victorhm@gmail.com',          '21996547821', '24020210')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Camila Fernandes',   '39812047002', 'camilafernandes@gmail.com',   '34991234587', '38408100')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Rafael Oliveira',    '56290184066', 'rafaeloliveira@outlook.com',  '43998561244', '86010250')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Juliana Costa',      '84027195014', 'ju.costa@gmail.com',          '47991827364', '89201130')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Fernando Lima',      '31570968025', 'fernando.lima@yahoo.com',     '54997651230', '95020450')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Beatriz Souza',      '90418256081', 'bia.souza@gmail.com',         '75998124566', '44015420')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Lucas Almeida',      '67190325043', 'lucasalmeida@hotmail.com',    '62995412377', '75110390')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Mariana Ribeiro',    '25061894032', 'mariribeiro@gmail.com',       '27999123451', '29101735')
go

insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Gabriel Mendes',   '48392015011', 'gabrielmendes@gmail.com',  '11997451230', '12245580')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Larissa Rocha',    '10584732012', 'larissarocha@hotmail.com', '12988341211', '12070320')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Bruno Carvalho',   '78219463013', 'brunocarvalho@gmail.com',  '21996547821', '24020210')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Amanda Lopes',     '39812047014', 'amandalopes@gmail.com',    '34991234587', '38408100')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Thiago Martins',   '56290184015', 'thiagomartins@outlook.com','43998561244', '86010250')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Patricia Souza',   '84027195016', 'patriciasouza@gmail.com',  '47991827364', '89201130')  
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Eduardo Lima',     '31570968017', 'eduardolima@yahoo.com',    '54997651230', '95020450')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Fernanda Alves',   '90418256018', 'fernandaalves@gmail.com',  '75998124566', '44015420')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Ricardo Gomes',    '67190325019', 'ricardogomes@hotmail.com', '62995412377', '75110390')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Julia Ferreira',   '25061894020', 'juliaferreira@gmail.com',  '27999123451', '29101735')
go

insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Carlos Henrique', '48392015021', 'carlosh@gmail.com',         '11993451230', '12245580')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Renata Moraes',   '10584732022', 'renatamoraes@hotmail.com',  '12982341211', '12070320')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Diego Fernandes', '78219463023', 'diegofernandes@gmail.com',  '21992547821', '24020210')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Vanessa Ribeiro', '39812047024', 'vanessaribeiro@gmail.com',  '34995234587', '38408100')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Felipe Costa',    '56290184025', 'felipecosta@outlook.com',   '43992561244', '86010250')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Aline Batista',   '84027195026', 'alinebatista@gmail.com',    '47995827364', '89201130')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Marcelo Santos',  '31570968027', 'marcelosantos@yahoo.com',   '54993651230', '95020450')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Camila Oliveira', '90418256028', 'camilaoliveira@gmail.com',  '75995124566', '44015420')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Rodrigo Almeida', '67190325029', 'rodrigoalmeida@hotmail.com','62991412377', '75110390')
insert into Pessoa (nome, cpf, email, fone, cep_numero) values ('Bianca Nunes',    '25061894030', 'biancanunes@gmail.com',     '27995123451', '29101735')
go

-- =========================================
-- INSERTS - FUNCIONARIO
-- =========================================
insert into Funcionario (pessoa_codigo, salario) values (1,  3850.00)
insert into Funcionario (pessoa_codigo, salario) values (2,  4200.00)
insert into Funcionario (pessoa_codigo, salario) values (3,  3150.00)
insert into Funcionario (pessoa_codigo, salario) values (4,  4700.00)
insert into Funcionario (pessoa_codigo, salario) values (5,  3600.00)
insert into Funcionario (pessoa_codigo, salario) values (6,  3980.00)
insert into Funcionario (pessoa_codigo, salario) values (7,  4450.00)
insert into Funcionario (pessoa_codigo, salario) values (8,  3300.00)
insert into Funcionario (pessoa_codigo, salario) values (9,  5100.00)
insert into Funcionario (pessoa_codigo, salario) values (10, 2875.00)

-- Pessoas 21-30 precisam estar em Funcionario antes de Gerente (FK chain)

insert into Funcionario (pessoa_codigo, salario) values (21, 4500.00)
insert into Funcionario (pessoa_codigo, salario) values (22, 5200.00)
insert into Funcionario (pessoa_codigo, salario) values (23, 3800.00)
insert into Funcionario (pessoa_codigo, salario) values (24, 4900.00)
insert into Funcionario (pessoa_codigo, salario) values (25, 4100.00)
insert into Funcionario (pessoa_codigo, salario) values (26, 4300.00)
insert into Funcionario (pessoa_codigo, salario) values (27, 5000.00)
insert into Funcionario (pessoa_codigo, salario) values (28, 3600.00)
insert into Funcionario (pessoa_codigo, salario) values (29, 5800.00)
insert into Funcionario (pessoa_codigo, salario) values (30, 4000.00)
go

-- =========================================
-- INSERTS - GERENTE
-- =========================================
insert into Gerente (pessoa_codigo, salario_extra) values (21, 1350.00)
insert into Gerente (pessoa_codigo, salario_extra) values (22, 2100.00)
insert into Gerente (pessoa_codigo, salario_extra) values (23,  980.00)
insert into Gerente (pessoa_codigo, salario_extra) values (24, 1750.00)
insert into Gerente (pessoa_codigo, salario_extra) values (25, 1225.00)
insert into Gerente (pessoa_codigo, salario_extra) values (26, 1430.00)
insert into Gerente (pessoa_codigo, salario_extra) values (27, 1950.00)
insert into Gerente (pessoa_codigo, salario_extra) values (28,  890.00)
insert into Gerente (pessoa_codigo, salario_extra) values (29, 2600.00)
insert into Gerente (pessoa_codigo, salario_extra) values (30, 1100.00)
go

-- =========================================
-- INSERTS - PISTA
-- =========================================
insert into Pista (nome) values ('Pista Thunder')
insert into Pista (nome) values ('Circuito Alpha')
insert into Pista (nome) values ('Pista Indoor Speed')
insert into Pista (nome) values ('Kart Arena Pro')
insert into Pista (nome) values ('Circuito Vale Sul')
insert into Pista (nome) values ('Pista Nitro')
insert into Pista (nome) values ('Arena Kart Extreme')
insert into Pista (nome) values ('Pista GP Racing')
insert into Pista (nome) values ('Autódromo Fast Track')
insert into Pista (nome) values ('Pista Black Lap')
go
update Pista set nome = 'Pista 1', codigo = 'pista1', capacidade = 15, metros = 550,  preco_por_min = 6,  preco_por_volta = 4, categoria = 'kids'   where nr = 1
update Pista set nome = 'Pista 2', codigo = 'pista2', capacidade = 20, metros = 800,  preco_por_min = 8,  preco_por_volta = 6, categoria = 'junior' where nr = 2
update Pista set nome = 'Pista 3', codigo = 'pista3', capacidade = 30, metros = 1200, preco_por_min = 10, preco_por_volta = 8, categoria = 'open'   where nr = 3
go

-- =========================================
-- INSERTS - CLIENTE
-- =========================================
insert into Cliente (pessoa_codigo, data_nascimento) values (11, '2001-03-15')
insert into Cliente (pessoa_codigo, data_nascimento) values (12, '1999-11-02')
insert into Cliente (pessoa_codigo, data_nascimento) values (13, '2002-07-29')
insert into Cliente (pessoa_codigo, data_nascimento) values (14, '1998-12-14')
insert into Cliente (pessoa_codigo, data_nascimento) values (15, '2001-09-08')
insert into Cliente (pessoa_codigo, data_nascimento) values (16, '1999-05-27')
insert into Cliente (pessoa_codigo, data_nascimento) values (17, '1997-02-19')
insert into Cliente (pessoa_codigo, data_nascimento) values (18, '2000-08-31')
insert into Cliente (pessoa_codigo, data_nascimento) values (19, '1996-06-12')
insert into Cliente (pessoa_codigo, data_nascimento) values (20, '2003-10-04')
go

-- =========================================
-- INSERTS - KART
-- =========================================

insert into Kart (estado, historico) values ('Disponível',     'Motor revisado recentemente')
insert into Kart (estado, historico) values ('Disponível',     'Troca de pastilha de freio')    
insert into Kart (estado, historico) values ('Disponível',     'Pneus novos instalados')
insert into Kart (estado, historico) values ('Indisponível',   'Falha elétrica identificada')
insert into Kart (estado, historico) values ('Disponível',     'Kart liberado para corrida')
insert into Kart (estado, historico) values ('Em manutenção',  'Revisão completa do motor')
insert into Kart (estado, historico) values ('Disponível',     'Chassi reforçado')
insert into Kart (estado, historico) values ('Disponível',     'Sistema de freios trocado')
insert into Kart (estado, historico) values ('Indisponível',   'Necessita alinhamento')
insert into Kart (estado, historico) values ('Disponível',     'Tanque abastecido e pronto')
go

-- =========================================
-- INSERTS - CORRIDA
-- =========================================
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (145.90, '2026-05-02', '14:30', 3,  2)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (189.50, '2026-05-03', '16:00', 5,  4)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (210.00, '2026-05-04', '20:15', 1,  7)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (135.75, '2026-05-05', '18:40', 8,  1)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (175.20, '2026-05-06', '15:10', 6,  5)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (220.90, '2026-05-07', '21:00', 2,  9)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (160.00, '2026-05-08', '13:20', 10, 3)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (198.45, '2026-05-09', '19:30', 4,  8)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (142.30, '2026-05-10', '17:00', 7,  6)
insert into Corrida (preco, data, horario, pista_nr, funcionario_codigo) values (250.00, '2026-05-11', '22:10', 9,  10)
go

-- =========================================
-- INSERTS - CLIENTE_CORRIDA
-- =========================================
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (11, 1,  '00:01:18', 'Nenhuma',        '00:14:52', 1)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (12, 2,  '00:01:21', 'Advertência',    '00:15:37', 3)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (13, 3,  '00:01:16', 'Nenhuma',        '00:14:28', 1)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (14, 4,  '00:01:24', 'Penalidade leve','00:16:02', 4)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (15, 5,  '00:01:19', 'Nenhuma',        '00:15:01', 2)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (16, 6,  '00:01:25', 'Toque em kart',  '00:16:45', 5)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (17, 7,  '00:01:17', 'Nenhuma',        '00:14:39', 1)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (18, 8,  '00:01:23', 'Saída de pista', '00:15:58', 3)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (19, 9,  '00:01:20', 'Nenhuma',        '00:15:14', 2)
insert into Cliente_Corrida (cliente_codigo, corrida_nr, melhor_volta, penalidade, tempo, posicao) values (20, 10, '00:01:15', 'Nenhuma',        '00:14:11', 1)
go

-- =========================================
-- INSERTS - CORRIDA_KART
-- =========================================

insert into Corrida_Kart (corrida_nr, kart_codigo) values (1,  3)
insert into Corrida_Kart (corrida_nr, kart_codigo) values (2,  7)
insert into Corrida_Kart (corrida_nr, kart_codigo) values (3,  1)
insert into Corrida_Kart (corrida_nr, kart_codigo) values (4,  1)   
insert into Corrida_Kart (corrida_nr, kart_codigo) values (5,  5)
insert into Corrida_Kart (corrida_nr, kart_codigo) values (6,  2)   
insert into Corrida_Kart (corrida_nr, kart_codigo) values (7,  10)
insert into Corrida_Kart (corrida_nr, kart_codigo) values (8,  5)   
insert into Corrida_Kart (corrida_nr, kart_codigo) values (9,  7)   
insert into Corrida_Kart (corrida_nr, kart_codigo) values (10, 8)
go

-- =========================================
-- INSERTS - MANUTENCAO
-- =========================================
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Concluída',    480.50,  'Pix',               2)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Pendente',    1290.90,  'Cartão de Crédito', 4)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Em análise',   320.00,  'Dinheiro',          6)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Concluída',    760.40,  'Pix',               1)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Em andamento', 980.75,  'Boleto',            8)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Pendente',     415.20,  'Cartão de Débito',  3)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Concluída',   1500.00,  'Transferência',     9)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Em andamento', 670.35,  'Pix',               5)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Concluída',    289.90,  'Dinheiro',          7)
insert into Manutencao (status, valor, forma_pagamento, kart_codigo) values ('Pendente',     845.60,  'Cartão',            10)
go

-- =========================================
-- INSERTS - PAGAMENTO
-- =========================================
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (145.90, 'Pago',        'Pix',               11, 1)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (189.50, 'Pago',        'Cartão de Crédito', 12, 2)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (210.00, 'Pendente',    'Dinheiro',          13, 3)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (135.75, 'Pago',        'Pix',               14, 4)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (175.20, 'Cancelado',   'Boleto',            15, 5)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (220.90, 'Pago',        'Transferência',     16, 6)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (160.00, 'Pendente',    'Cartão de Débito',  17, 7)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (198.45, 'Pago',        'Pix',               18, 8)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (142.30, 'Pago',        'Dinheiro',          19, 9)
insert into Pagamento (valor, status, forma_pagamento, cliente_codigo, corrida_nr) values (250.00, 'Processando', 'Cartão',            20, 10)
go

-- numero da frota = codigo do kart (a tela da frota so lista karts com numero)
update Kart set numero = codigo
go

-- Contas de login: a API cria o admin na primeira subida (veja application.properties).
-- As pessoas acima sao dados de exemplo e nao tem senha, entao nao fazem login.



-- INICIANDO ABAIXO A PARTE DE ADMINISTRAÇÃO DE BANCO DE DADOS:

--============================================================
-- VIEW: relatório completo das reservas do Speed Park
--
-- Objetivo:
-- Facilitar a consulta das reservas realizadas no sistema,
-- reunindo em uma única consulta os dados da pista, do piloto
-- que fez a reserva, de quem vai correr, da cobrança e da
-- situação da reserva.
--============================================================

create view v_Relatorio_Reservas_SpeedPark
as
	select
		-- Dados principais da reserva
		R.id               as No_Reserva,
		R.data             as Data_Reserva,
		R.horario          as Horario,
		R.criada_em        as Criada_Em,

		-- Dados da pista
		P.nome             as Pista,
		P.categoria        as Categoria_Pista,
		P.capacidade       as Capacidade_Pista,

		-- Quem vai correr e quem fez a reserva
		R.participante     as Participante,
		PE.nome            as Responsavel,
		PE.email           as Email_Responsavel,
		PE.fone            as Telefone_Responsavel,

		-- Origem da reserva traduzida para melhor entendimento
		case
			when C.pessoa_codigo is null then 'Balcao (admin)'
			else 'Site (piloto)'
		end as Origem,

		-- Dados da cobrança
		case R.formato
			when 'tempo'  then 'Por tempo'
			when 'voltas' then 'Por voltas'
			else 'Sem cobranca'
		end as Formato,
		R.qtd              as Quantidade,
		case R.forma_pagamento
			when 'pix'            then 'PIX'
			when 'cartao_debito'  then 'Cartao de debito'
			when 'cartao_credito' then 'Cartao de credito'
			when 'dinheiro'       then 'Dinheiro'
			else 'Nao informado'
		end as Forma_Pagamento,
		R.valor            as Valor,

		-- Situação da reserva traduzida para melhor entendimento
		case
			when R.data < cast(getdate() as date) then 'Realizada'
			when R.data = cast(getdate() as date) then 'Hoje'
			else 'Agendada'
		end as Situacao

	from Reserva as R

	-- Relaciona a reserva com a pista
	inner join Pista as P
		on R.pista_nr = P.nr

	-- Relaciona a reserva com o piloto que a fez (reserva de balcão não tem piloto)
	left join Cliente as C
		on R.cliente_codigo = C.pessoa_codigo

	-- Busca o nome e os contatos do piloto na tabela pessoa
	left join Pessoa as PE
		on C.pessoa_codigo = PE.codigo
go

-- Testando a view
select * from v_Relatorio_Reservas_SpeedPark
go

--============================================================
-- VIEW: resumo financeiro por dia e forma de pagamento
--
-- Objetivo:
-- Mostrar ao financeiro quanto já foi pago e quanto está
-- pendente em cada dia, separado por forma de pagamento,
-- com a quantidade de lançamentos e o valor médio.
--============================================================

create view v_Resumo_Financeiro_SpeedPark
as
	select
		F.data as Data_Lancamento,

		-- Forma de pagamento traduzida para melhor entendimento
		case F.forma_pagamento
			when 'pix'            then 'PIX'
			when 'cartao_debito'  then 'Cartao de debito'
			when 'cartao_credito' then 'Cartao de credito'
			when 'dinheiro'       then 'Dinheiro'
			else 'Nao informado'
		end as Forma_Pagamento,

		count(*) as Qtd_Lancamentos,
		sum(case when F.status = 'pago'     then F.valor else 0 end) as Total_Pago,
		sum(case when F.status = 'pendente' then F.valor else 0 end) as Total_Pendente,
		avg(F.valor) as Valor_Medio

	from Faturamento as F

	group by F.data, F.forma_pagamento
go

-- Testando a view
select * from v_Resumo_Financeiro_SpeedPark
go

--============================================================
-- FUNCTION: categoria do piloto pela idade
-- TIPO: SCALAR FUNCTION
--
-- Objetivo:
-- Devolver a categoria do piloto conforme a idade, regra
-- usada pela procedure de reserva (cada pista aceita uma
-- categoria):
--   menos de 7 anos  = kids   (Pista 1)
--   de 7 a 13 anos   = junior (Pista 2)
--   14 anos ou mais  = open   (Pista 3)
--============================================================

create function fc_CategoriaPorIdade_SpeedPark
(
	@nascimento date
)
returns varchar(10)
as
begin

	declare @idade int

	-- idade em anos completos (desconta 1 se o aniversário ainda não chegou)
	set @idade = datediff(year, @nascimento, getdate())

	if dateadd(year, @idade, @nascimento) > cast(getdate() as date)
		set @idade = @idade - 1

	return case
		when @idade < 7   then 'kids'
		when @idade <= 13 then 'junior'
		else 'open'
	end

end
go

-- TESTANDO A FUNCTION
select dbo.fc_CategoriaPorIdade_SpeedPark('2022-03-10') as Kids,
       dbo.fc_CategoriaPorIdade_SpeedPark('2015-03-10') as Junior,
       dbo.fc_CategoriaPorIdade_SpeedPark('1995-03-10') as Open_
go

--============================================================
-- PROCEDURE: criar uma reserva no sistema Speed Park
--
-- Objetivo:
-- Realizar a reserva completa em uma única transação:
-- confere a pista, a categoria do participante e as vagas do
-- horário, calcula o valor e grava a reserva e o lançamento
-- financeiro. Se qualquer passo falhar, nada é gravado.
--
-- Observação:
-- quando há erro de regra de negócio (ou erro do banco), a
-- procedure desfaz a transação e devolve NumeroErro e
-- MensagemErro, que o sistema Java traduz para a resposta:
--   50001 horário lotado           | 50005 dependente inexistente
--   50002 categoria x pista        | 50006 dependente de outro piloto
--   50003 pista inexistente        | 50007 quantidade inválida
--   50004 piloto não cadastrado
--============================================================

create procedure sp_CriarReserva_SpeedPark
(
	@pistaCodigo    varchar(20),
	@data           date,
	@horario        time,
	@participante   varchar(100),  -- reserva de balcão (admin): nome de quem vai correr
	@clienteCodigo  int,           -- piloto que reserva (null = balcão)
	@dependenteId   int,           -- filho do piloto (null = o próprio piloto corre)
	@formato        varchar(10),   -- 'tempo' ou 'voltas' (null = sem cobrança)
	@qtd            int,
	@formaPagamento varchar(30)
)
as
begin

	-- para o sistema Java ler só o resultado final da procedure
	set nocount on

	begin try

		declare @pistaNr        int
		declare @nomePista      varchar(100)
		declare @categoriaPista varchar(20)
		declare @capacidade     int
		declare @precoMin       decimal(10,2)
		declare @precoVolta     decimal(10,2)
		declare @nascimento     date
		declare @categoria      varchar(10)
		declare @donoDependente int
		declare @ocupadas       int
		declare @valor          decimal(19,2)
		declare @idReserva      int

		begin tran

		-- 1) Confere a pista e busca capacidade, categoria e preços
		select
			@pistaNr = nr,
			@nomePista = nome,
			@categoriaPista = categoria,
			@capacidade = capacidade,
			@precoMin = preco_por_min,
			@precoVolta = preco_por_volta
		from Pista
		where codigo = @pistaCodigo

		if @pistaNr is null
		begin
			rollback tran
			select 50003 as NumeroErro, N'Pista não encontrada.' as MensagemErro
			return
		end

		-- 2) Quando um piloto reserva: descobre quem vai correr e confere a categoria
		if @clienteCodigo is not null
		begin

			if not exists (select 1 from Cliente where pessoa_codigo = @clienteCodigo)
			begin
				rollback tran
				select 50004 as NumeroErro, N'Apenas pilotos cadastrados podem reservar.' as MensagemErro
				return
			end

			if @dependenteId is not null
			begin
				-- reserva para um filho do piloto
				select
					@donoDependente = responsavel_codigo,
					@participante = nome,
					@nascimento = nascimento
				from Dependente
				where id = @dependenteId

				if @donoDependente is null
				begin
					rollback tran
					select 50005 as NumeroErro, N'Dependente não encontrado.' as MensagemErro
					return
				end

				if @donoDependente <> @clienteCodigo
				begin
					rollback tran
					select 50006 as NumeroErro, N'Este dependente pertence a outro piloto.' as MensagemErro
					return
				end
			end
			else
			begin
				-- o próprio piloto corre: nome e nascimento vêm do cadastro
				select
					@participante = PE.nome,
					@nascimento = C.data_nascimento
				from Cliente as C
				inner join Pessoa as PE
					on PE.codigo = C.pessoa_codigo
				where C.pessoa_codigo = @clienteCodigo
			end

			-- cada pista aceita somente a sua categoria
			set @categoria = dbo.fc_CategoriaPorIdade_SpeedPark(@nascimento)

			if @categoria <> @categoriaPista
			begin
				rollback tran
				select
					50002 as NumeroErro,
					N'Categoria ' + upper(@categoria) + N' não pode correr na '
						+ @nomePista + N' (pista ' + upper(@categoriaPista) + N').' as MensagemErro
				return
			end

		end

		-- 3) Confere as vagas do horário
		select @ocupadas = count(*)
		from Reserva
		where pista_nr = @pistaNr
		  and data     = @data
		  and horario  = @horario

		if @ocupadas >= @capacidade
		begin
			rollback tran
			select 50001 as NumeroErro, N'Horário lotado nesta pista.' as MensagemErro
			return
		end

		-- 4) Calcula o valor (por minuto ou por volta, conforme a pista)
		if @formato is not null
		begin

			if @qtd is null or @qtd <= 0
			begin
				rollback tran
				select 50007 as NumeroErro, N'Quantidade inválida.' as MensagemErro
				return
			end

			if @formato = 'tempo'
				set @valor = @precoMin * @qtd
			else
				set @valor = @precoVolta * @qtd

		end

		-- 5) Grava a reserva
		insert into Reserva
		(
			cliente_codigo,
			participante,
			pista_nr,
			data,
			horario,
			formato,
			qtd,
			forma_pagamento,
			valor,
			criada_em
		)
		values
		(
			@clienteCodigo,
			@participante,
			@pistaNr,
			@data,
			@horario,
			@formato,
			@qtd,
			@formaPagamento,
			@valor,
			getdate()
		)

		set @idReserva = scope_identity()

		-- 6) Gera o lançamento financeiro da reserva
		if @valor is not null
		begin
			insert into Faturamento
			(
				data,
				valor,
				descricao,
				forma_pagamento,
				status
			)
			values
			(
				cast(getdate() as date),
				@valor,
				N'Reserva ' + @nomePista + N' ' + convert(varchar(10), @data, 103)
					+ N' ' + left(convert(varchar(8), @horario), 5) + N' - ' + @participante,
				@formaPagamento,
				'pago'
			)
		end

		-- devolve o número da reserva criada
		select @idReserva as id

		commit tran

	end try

	begin catch

		if @@trancount > 0
			rollback tran

		select
			error_number() as NumeroErro,
			error_message() as MensagemErro

	end catch

end
go

--============================================================
-- testando a procedure
--============================================================

-- 1) o piloto 11 (adulto, categoria open) reserva a Pista 3 (open):
-- grava a reserva e o lançamento financeiro
exec sp_CriarReserva_SpeedPark
	'pista3', '2030-01-08', '10:00', null, 11, null, 'tempo', 10, 'pix'
go

-- 2) o mesmo piloto tenta a Pista 1 (kids): a procedure recusa e nada é gravado
exec sp_CriarReserva_SpeedPark
	'pista1', '2030-01-08', '10:00', null, 11, null, 'tempo', 10, 'pix'
go

select * from Reserva
go

select * from Faturamento
go

--============================================================
-- FUNCTION: ranking dos pilotos do Speed Park
-- TIPO: MULTI-STATEMENT TABLE VALUED FUNCTION
-- OBJETIVO:
-- Retornar uma tabela com o ranking das corridas encerradas:
-- corridas disputadas, vitórias, pontos (25-18-15-12-10-8-6-4-2-1,
-- como na Fórmula 1) e melhor volta de cada piloto, podendo
-- filtrar pelo mínimo de corridas e por pista (NULL = todas).
--============================================================

create function fc_RankingPilotos_SpeedPark
(
	@MinimoCorridas int,
	@PistaCodigo    varchar(20)
)
returns @tb_RankingPilotos table
(
	Piloto       varchar(100),
	Corridas     int,
	Vitorias     int,
	Pontos       int,
	Melhor_Volta decimal(8,3)
)
as
begin

	insert into @tb_RankingPilotos
	(
		Piloto,
		Corridas,
		Vitorias,
		Pontos,
		Melhor_Volta
	)

	select
		min(RS.piloto_nome),
		count(*),

		-- vitórias = chegou em 1º lugar
		sum(case when RS.posicao = 1 then 1 else 0 end),

		-- pontos conforme a posição de chegada
		sum(case RS.posicao
				when 1  then 25
				when 2  then 18
				when 3  then 15
				when 4  then 12
				when 5  then 10
				when 6  then 8
				when 7  then 6
				when 8  then 4
				when 9  then 2
				when 10 then 1
				else 0
			end),

		-- melhor volta (tempos que não são números ficam de fora)
		min(try_cast(RS.melhor_volta as decimal(8,3)))

	from Resultado as RS

	inner join Prova as PV
		on RS.prova_id = PV.id

	inner join Pista as P
		on PV.pista_nr = P.nr

	where PV.status = 'encerrada'
	and (@PistaCodigo is null or P.codigo = @PistaCodigo)

	-- o mesmo piloto com maiúsculas/espaços diferentes conta como um só
	group by lower(ltrim(rtrim(RS.piloto_nome)))

	having count(*) >= @MinimoCorridas

	return

end
go

--============================================================
-- TESTANDO A FUNCTION
--============================================================

-- encerra uma corrida de teste para ter resultados
insert into Prova (numero, pista_nr, duracao_seg, status) values (1, 3, 600, 'encerrada')
go

insert into Resultado (prova_id, posicao, kart, piloto_nome, melhor_volta, penalidades)
values ((select max(id) from Prova), 1, '3', 'Ana Souza',  '55.4', null)
go

insert into Resultado (prova_id, posicao, kart, piloto_nome, melhor_volta, penalidades)
values ((select max(id) from Prova), 2, '5', 'Bruno Lima', '56.1', '+5s')
go

select *
from fc_RankingPilotos_SpeedPark
(
	1,
	null
)
order by Pontos desc
go

--============================================================
-- TRIGGER: histórico de novas reservas cadastradas
--
-- Objetivo:
-- Criar um registro de log sempre que uma nova reserva
-- for cadastrada no sistema Speed Park.
--============================================================

-- 1) Criar uma tabela de LOG para armazenar o histórico
-- de novas reservas cadastradas no sistema

create table LOG_HistoricoNovaReserva
(
	idLog        int           not null identity primary key,
	idReserva    int           not null,
	idCliente    int,
	idPista      int           not null,
	participante varchar(100)  not null,
	dataReserva  date          not null,
	horario      time          not null,
	valor        decimal(19,2),
	data         datetime      not null,
	usuario      varchar(100)  not null
)
go

-- 2) Criar uma trigger para cadastrar os dados na tabela
-- LOG_HistoricoNovaReserva sempre que uma nova reserva
-- for cadastrada
--
-- Tabela: reserva
-- Operação/evento: insert
-- Tipo: AFTER

create trigger tg_HistNovaReserva
on    Reserva
after insert
as
begin
	-- cadastrar no log os dados da nova reserva inserida
	insert into LOG_HistoricoNovaReserva
	(
		idReserva,
		idCliente,
		idPista,
		participante,
		dataReserva,
		horario,
		valor,
		data,
		usuario
	)
	select
		I.id,
		I.cliente_codigo,
		I.pista_nr,
		I.participante,
		I.data,
		I.horario,
		I.valor,
		GETDATE(),
		SYSTEM_USER
	from inserted as I
end
go

-- 3) Testar a trigger
-- Cadastrar uma nova reserva para disparar a trigger

insert into Reserva
(
	cliente_codigo,
	participante,
	pista_nr,
	data,
	horario,
	formato,
	qtd,
	forma_pagamento,
	valor,
	criada_em
)
values
(
	12,
	'Teste da trigger',
	3,
	'2030-01-09',
	'12:00',
	'tempo',
	10,
	'pix',
	100.00,
	getdate()
)
go

-- 4) Consultar a tabela de LOG para verificar
-- se a trigger registrou a nova reserva

select * from LOG_HistoricoNovaReserva
go

--============================================================
-- TRIGGER: auditoria das alterações do financeiro
--
-- Objetivo:
-- Guardar o valor antes e depois sempre que o status ou o
-- valor de um lançamento financeiro for alterado (por exemplo,
-- de pendente para pago), registrando quando e por quem.
--============================================================

-- 1) Criar uma tabela de LOG para armazenar as alterações

create table LOG_AuditoriaFaturamento
(
	idLog          int           not null identity primary key,
	idFaturamento  int           not null,
	statusAnterior varchar(20),
	statusNovo     varchar(20),
	valorAnterior  decimal(19,2),
	valorNovo      decimal(19,2),
	data           datetime      not null,
	usuario        varchar(100)  not null
)
go

-- 2) Criar a trigger
--
-- Tabela: faturamento
-- Operação/evento: update
-- Tipo: AFTER

create trigger tg_AuditoriaFaturamento
on    Faturamento
after update
as
begin
	-- cadastrar no log somente quando status ou valor mudaram
	insert into LOG_AuditoriaFaturamento
	(
		idFaturamento,
		statusAnterior,
		statusNovo,
		valorAnterior,
		valorNovo,
		data,
		usuario
	)
	select
		D.id,
		D.status,
		I.status,
		D.valor,
		I.valor,
		GETDATE(),
		SYSTEM_USER
	from inserted as I
	inner join deleted as D
		on D.id = I.id
	where D.status <> I.status
	or    D.valor  <> I.valor
end
go

-- 3) Testar a trigger
-- Alterar o status de um lançamento para disparar a trigger

update Faturamento
set status = 'pendente'
where id = (select max(id) from Faturamento)
go

-- 4) Consultar a tabela de LOG para verificar
-- se a trigger registrou a alteração

select * from LOG_AuditoriaFaturamento
go
