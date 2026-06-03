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
    cep_numero char(8) not null,
    constraint pk_pessoa primary key(codigo),
    constraint uq_pessoa_cpf unique(cpf),
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
    constraint pk_pista primary key(nr)
)
go

create table Cliente
(
    pessoa_codigo   int not null,
    data_nascimento date not null,
    constraint pk_cliente primary key(pessoa_codigo),
    constraint fk_cliente_pessoa foreign key(pessoa_codigo) references Pessoa(codigo)
)
go

create table Kart
(
    codigo   int identity not null,
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
