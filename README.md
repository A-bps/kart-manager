# 🏎‍🟀 Speed Park — Sistema de Kartódromo

Uma landing page interativa e de alta performance desenvolvida para o *Speed Park*, a pista de kart mais rápida e tecnológica da região.

Este projeto foi construído com foco em *simplicidade, performance e facilidade de avaliação, utilizando uma arquitetura com **frontend estático* e um *backend em Java orientado a objetos*, responsável por representar as principais regras de negócio de um kartódromo.

---

## 🚀 Tecnologias Utilizadas

### Frontend

O frontend utiliza bibliotecas modernas injetadas diretamente via *CDN (Content Delivery Network)*:

* *Estrutura Base:* HTML5 Semântico
* *Interface (UI):* [React 18](https://react.dev/)
* *Transpilação:* [Babel Standalone](https://babeljs.io/docs/babel-standalone)
* *Estilização e Layout:*
  * [Tailwind CSS v3](https://tailwindcss.com/) (motor de utilitários CSS configurado por script dinâmico)
  * [Bootstrap 5.3](https://getbootstrap.com/) (sistema de grid responsivo)
  * CSS Vanilla (style.css) para micro-interações, design brutalista e efeitos de Scroll Reveal.

### Backend

O backend foi desenvolvido em *Java, com foco em **Programação Orientada a Objetos (POO)*, validações de regras de negócio e testes manuais via console.

* *Linguagem:* Java
* *Paradigma:* Programação Orientada a Objetos
* *Execução:* Aplicação de console
* *Entrada de dados:* Scanner
* *Manipulação de valores monetários:* BigDecimal
* *Manipulação de datas e horários:* LocalDate e LocalTime
* *Persistência:* Não aplicado ao banco de dados; os dados são trabalhados em memória durante a execução
* *Dependências externas:* Não há dependências obrigatórias no projeto

### Banco de Dados

O sistema utiliza um banco de dados relacional desenvolvido em SQL Server, responsável pelo armazenamento e gerenciamento das informações do kartódromo.

SGBD: Microsoft SQL Server
Ferramenta utilizada: SQL Server Management Studio 22
Linguagem: T-SQL
Modelagem: Modelo Lógico Relacional
Relacionamentos: Modelo relacional com tabelas associativas e relacionamentos N:N
Integridade: Utilização de PRIMARY KEY, FOREIGN KEY, UNIQUE e NOT NULL
Identificação automática: IDENTITY
Organização: Constraints nomeadas para padronização e integridade referencial
## 🛠️ Como Executar Localmente o Frontend

Como o frontend foi projetado para rodar sem servidor backend ou empacotador (bundler), o processo de execução é imediato e descomplicado.

### 📋 Pré-requisitos

* Uma *conexão de internet ativa* para carregamento do React, Tailwind e Babel via CDN.
* O editor *Visual Studio Code (VS Code)*.
* A extensão *Live Server* instalada no VS Code.

### 🚦 Passo a Passo

1. Abra a pasta principal do projeto (Projeto-Kartodromo) no VS Code.
2. Localize e abra o arquivo index.html.
3. Clique no botão *"Go Live"* localizado no canto inferior direito do VS Code.
4. O navegador abrirá automaticamente em http://127.0.0.1:5500 ou porta semelhante.

> *Nota para Avaliadores:* O frontend atua como uma Single Page Application (SPA) estática. Toda a navegação ("Corridas", "Preços", "Rankings") ocorre por meio de âncoras com rolagem suave dentro da mesma página.

---

## ☕ Como Executar o Backend

O backend é uma aplicação Java de console, criada para demonstrar a modelagem das entidades e regras de negócio do sistema de kartódromo.

### 📋 Pré-requisitos

* *Java JDK* instalado na máquina.
* *Visual Studio Code* com a extensão *Extension Pack for Java* instalada, ou outra IDE compatível com Java.

### ▶️ Executando pelo VS Code

1. Abra a pasta Inter_BackEnd no VS Code.
2. Acesse o arquivo:

text
src/TestesManuais.java


3. Clique em *Run* acima do método main, ou execute pela opção de execução da extensão Java.
4. O terminal exibirá um menu com opções de testes manuais.

### ▶️ Executando pelo terminal

Dentro da pasta Inter_BackEnd, execute:

bash
javac -d bin src/entities/*.java src/TestesManuais.java
java -cp bin TestesManuais


---

 ##🧩Funcionalidades do Banco##

O banco permite:

* Cadastro de clientes
* Cadastro de pistas
* Controle de corridas
* Registro de resultados
* Controle de ranking
* Controle financeiro
* Histórico de manutenção
* Controle de disponibilidade dos karts
* Relacionamento entre clientes e corridas
* Relacionamento entre corridas e karts


## 🧩 Funcionalidades do Backend

O backend representa as principais entidades de um sistema de kartódromo e aplica validações importantes para o funcionamento das regras de negócio.

### Entidades principais

* *Pessoa:* representa os dados básicos de uma pessoa, como código, nome, CPF, e-mail, telefone e CEP.
* *Cliente:* representa o cliente do kartódromo, vinculado a uma pessoa e à data de nascimento.
* *Funcionário:* representa um funcionário responsável por operações do kartódromo.
* *Gerente:* representa um gerente com salário extra.
* *Corrida:* representa uma corrida agendada, com número, preço, data, horário, pista e funcionário responsável.
* *ClienteCorrida:* representa a participação de um cliente em uma corrida, armazenando melhor volta, penalidade, tempo total e posição.
* *Kart:* representa os karts disponíveis, indisponíveis ou em manutenção.
* *CorridaKart:* relaciona uma corrida com um kart.
* *Pagamento:* representa o pagamento de uma corrida, incluindo valor, status, forma de pagamento, cliente e corrida.
* *Manutenção:* representa uma manutenção realizada em um kart.
* *Pista:* representa uma pista do kartódromo.
* *CEP, Cidade e UF:* representam a estrutura de endereço das pessoas cadastradas.

---

## ✅ Regras de Negócio e Validações

O backend possui métodos de validação para garantir consistência dos dados informados.

Entre as principais validações implementadas estão:

* Cadastro de pessoa com *CPF obrigatório e único*.
* Validação de nome, CPF, e-mail, telefone e endereço.
* Cadastro de cliente com dados pessoais e data de nascimento.
* Agendamento de corrida com verificação de *conflito de data, horário e pista*.
* Validação de corrida com preço, data, horário, pista e funcionário responsável.
* Controle de disponibilidade do kart por meio do estado informado.
* Validação de pagamento com valor, status, forma de pagamento, cliente e corrida.
* Geração de comprovante apenas quando o pagamento está com status *"Pago"*.
* Validação de resultados de corrida, incluindo melhor volta, tempo e posição.
* Validação de ranking para evitar posições duplicadas na mesma corrida.
* Validação de manutenção vinculada a um kart.

---

## 🧪 Testes Manuais do Backend

A classe TestesManuais.java possui um menu interativo para simular cenários de sucesso e falha no sistema.

Ao executar o backend, o seguinte menu é exibido:

text
=== Testes Manuais ===
1) Teste cadastro CPF unico
2) Teste agendamento com conflito
3) Teste pagamento e comprovante
4) Teste disponibilidade de kart
5) Teste resultados e ranking
6) Testes de sucesso
7) Teste guiado por console
0) Sair


### Cenários testados

* *Cadastro com CPF único:* verifica se o sistema bloqueia CPFs duplicados.
* *Agendamento com conflito:* valida se uma corrida não pode ser marcada na mesma pista, data e horário de outra corrida.
* *Pagamento e comprovante:* impede a geração de comprovante para pagamento ainda não confirmado.
* *Disponibilidade de kart:* verifica se o kart está disponível com base no estado informado.
* *Resultados e ranking:* valida dados de resultado e impede posições duplicadas.
* *Testes de sucesso:* executa um fluxo válido com cadastro, corrida, pagamento e ranking.
* *Teste guiado:* permite inserir dados manualmente pelo console.
---

## 🗺️ Funcionalidades e Componentes do Frontend

Toda a lógica do frontend está modularizada dentro do arquivo app.jsx, dividida nos seguintes componentes principais:

* *Navbar:* menu de navegação responsivo com efeito de backdrop-blur e menu sanduíche.
* *Hero Section:* banner inicial com efeito Parallax vinculado ao movimento do mouse.
* *Baterias:* cards apresentando as modalidades de corrida.
* *Diferenciais:* seção baseada em Grid destacando tecnologias e medidas de segurança.
* *Preços (Planos):* tabela de preços com UI Brutalista e micro-interações.
* *Rankings:* sistema interativo de abas dinâmicas que filtra tempos, pontuações e posições.
* *useScrollReveal:* Hook customizado em React integrado à Intersection Observer API.

---

## 🧠 Observações Técnicas

* O backend não está integrado diretamente ao frontend e ao banco de dados.
* O projeto backend funciona como uma camada de modelagem e validação das regras de negócio.
* Os dados são armazenados temporariamente em listas durante a execução dos testes.
* A estrutura foi pensada para facilitar a avaliação acadêmica, demonstrando organização, encapsulamento, validações e relacionamentos entre classes.

---

- Desenvolvido como trabalho final com foco em *UI/UX moderna, design responsivo, **Programação Orientada a Objetos* e *arquitetura de código limpa*.
