# 🏎️ Speed Park — Sistema de Kartódromo

Sistema web para o kartódromo **Speed Park**, composto por três partes:

- **Frontend** — site institucional + painel do piloto + painel administrativo (React via CDN, sem build).
- **Backend** — API REST em **Java 21 / Spring Boot** (`speedpark-api`).
- **Banco de dados** — **Microsoft SQL Server**, com modelagem relacional documentada em `Banco-Kartodromo/`.

> ✅ **Estado atual:** o frontend **consome a API em tudo**. Login, cadastro de pilotos, reservas, frota (karts), financeiro, corridas em andamento, histórico/ranking e dependentes ("filhos") são gravados no SQL Server e valem em qualquer navegador. **Para o site funcionar, a API precisa estar rodando.**
>
> No navegador ficam apenas preferências: tema claro/escuro e o marcador de "última vez que o admin viu a agenda" (selo de novas reservas).
>
> 🏁 **Categorias:** definidas pela idade (menos de 7 anos = Kids, 7 a 13 = Junior, 14 ou mais = Open). Cada pista aceita uma categoria (Pista 1 = Kids, Pista 2 = Junior, Pista 3 = Open). A regra é aplicada no servidor: criança não reserva em pista acima e adulto não reserva em pista infantil. Filhos têm a categoria calculada pela data de nascimento. Reservas lançadas pelo admin (só com nome) não passam por essa checagem.

---

## 🚀 Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | HTML5, React 18, Babel Standalone, Tailwind CSS v3, Bootstrap 5.3, CSS (`style.css`) — tudo via CDN |
| Backend | Java 21, Spring Boot 4, Spring Web MVC, Spring Data JPA (Hibernate), Lombok, Maven Wrapper |
| Banco | Microsoft SQL Server, driver `mssql-jdbc` |

---

## 📂 Estrutura do Projeto

```text
Projeto-Kartodromo/
├── index.html / app.jsx                  # Site principal (home, baterias, preços, rankings, login)
├── dashboard-piloto.html / .jsx          # Cockpit do piloto (agendamentos, histórico)
├── dashboard-admin.html / .jsx           # Painel administrativo (agenda, frota, corridas, financeiro)
├── api.js                                # Camada de dados do front: chama a API e guarda cache em memória
├── utils.js                              # Funções compartilhadas do frontend
├── style.css                             # Estilos customizados e animações
├── src/assets/images/                    # Logo e imagens
├── Banco_de_dados-Kartodromo.sql         # Script oficial de criação do banco (tabelas + dados de exemplo)
├── Banco-Kartodromo/                     # Documentação (DER, mapeamento), backup/restore e migração do banco
└── speedpark-api/                        # API REST Spring Boot
    └── src/main/java/com/fatec/speedpark/
        ├── controllers/                  # Endpoints REST
        ├── services/                     # Regras de negócio
        ├── repositories/                 # Acesso ao banco (JPA)
        ├── entities/                     # Tabelas mapeadas
        ├── dto/                          # Objetos de entrada (com validação) e de saída
        ├── security/                     # Login JWT, BCrypt e CORS
        ├── config/                       # Dados iniciais (pistas e conta de admin)
        └── exceptions/                   # Tratamento global de erros
    └── tests/smoke.sh                    # Teste automatizado da API (117 verificações)
```

---

## 🖥️ Como Executar o Frontend

**Pré-requisitos:** internet (para as CDNs), VS Code com a extensão **Live Server**, e a **API rodando** (veja abaixo).

1. Abra a pasta `Projeto-Kartodromo` no VS Code.
2. Abra o `index.html` e clique em **Go Live** (canto inferior direito).
3. O site abre em `http://127.0.0.1:5500`. Essa é a origem liberada no CORS da API; se usar outra porta, ajuste `speedpark.cors.origins`.

O front espera a API em `http://localhost:8080/api` (constante `API_URL` em `api.js`). Se a API estiver fora do ar, os painéis mostram uma mensagem de erro em vez de carregar.

Os painéis são acessados pelo login do site ou diretamente por `dashboard-piloto.html` e `dashboard-admin.html`.

---

## ☕ Como Executar o Backend

**Pré-requisitos:** Java JDK 21 e SQL Server rodando na porta `1433`. Não é preciso instalar o Maven — o projeto usa o Maven Wrapper (`mvnw`).

### 1. Criar o banco

**Opção A (recomendada) – script oficial:** no SQL Server Management Studio, abra e execute `Banco_de_dados-Kartodromo.sql`. Ele cria o banco `KartManager`, todas as tabelas (incluindo login, reservas e financeiro) e dados de exemplo (30 pessoas, 10 pistas, 10 karts, corridas). É o único script de criação mantido; as 3 pistas do site e a frota já vêm preenchidas.

**Opção B – automático:** crie só o banco vazio (`CREATE DATABASE KartManager;`) e deixe o Hibernate criar as tabelas ao subir a API (`ddl-auto=update`).

> As pessoas de exemplo do script não têm senha, então não fazem login. Para entrar, use o admin ou cadastre um piloto pelo site.

### 2. Configurar a conexão

O arquivo com a senha **não é versionado**. Crie-o a partir do modelo:

```bash
cd speedpark-api/src/main/resources
cp application.properties.example application.properties
```

Edite o `application.properties` e troque:

| Propriedade | O que colocar |
|---|---|
| `spring.datasource.password` | senha do seu usuário do SQL Server (e o `username`, se não for `sa`) |
| `speedpark.admin.email` / `speedpark.admin.senha` | conta de administrador (o `.example` já traz `admin@speedpark.com` / `admin123`). A senha deste arquivo vale a cada subida: mudou o arquivo, reinicie a API |
| `speedpark.jwt.secret` | opcional. Sem ela, uma chave aleatória é gerada a cada subida (o login cai ao reiniciar a API) |
| `speedpark.cors.origins` | endereços do front liberados (padrão: `http://127.0.0.1:5500` e `http://localhost:5500`) |
| `speedpark.login.max-tentativas` / `speedpark.login.bloqueio-segundos` | opcionais. Padrão: 5 erros e 900 s (15 min) de bloqueio |

> `admin123` é só para uso acadêmico/local. Não existe usuário ou senha de admin fixo no código. Na subida, a API também cria as 3 pistas do site (`pista1`, `pista2`, `pista3`) se ainda não existirem.

> **Banco já existente** (criado antes do login): rode uma vez `Banco-Kartodromo/Migracao_login_reservas.sql` para tornar o CEP da pessoa opcional. O Hibernate cria as demais colunas e tabelas sozinho.

### 3. Subir a API

Pela IDE: execute a classe `SpeedparkApiApplication`.

Pelo terminal, dentro de `speedpark-api/`:

```bash
./mvnw spring-boot:run      # Linux/macOS
mvnw.cmd spring-boot:run    # Windows
```

A API sobe em `http://localhost:8080`.

---

## 🔌 Endpoints da API

### Login e permissões

O login devolve um **token JWT** (válido por 8 h) que deve ir em `Authorization: Bearer <token>`. Senhas ficam no banco só como hash BCrypt.

| Método | Rota | Quem acessa | Ação |
|---|---|---|---|
| `POST` | `/api/auth/login` | público | `{email, senha}` → `{token, usuario}` |
| `POST` | `/api/auth/registro` | público | cadastra piloto `{nome, cpf, email, telefone, nascimento, altura, peso, senha}` |
| `POST` | `/api/auth/redefinir-senha` | público | senha esquecida: `{email, cpf, novaSenha}` (confere e-mail + CPF do cadastro) |
| `GET` | `/api/auth/me` | logado | dados de quem está logado |
| `GET/POST/DELETE` | `/api/pilotos` | admin | lista, cadastra e apaga pilotos |
| `GET/PUT` | `/api/pilotos/{id}` | o próprio piloto ou admin | ver e editar perfil |
| `GET/POST/DELETE` | `/api/reservas` | logado | piloto vê/cria/cancela as suas; admin todas (preço e vagas calculados no servidor) |
| `GET` | `/api/karts`, `/api/pistas` | logado | leitura da frota e das pistas |
| `GET/POST/DELETE` | `/api/dependentes` | logado (só os próprios) | filhos do piloto, usados ao agendar |
| `GET` | `/api/provas/historico` | público | corridas encerradas (alimenta o ranking da página inicial e o histórico do piloto) |
| `GET/POST/DELETE` | `/api/provas/ativas`, `/api/provas`, `/api/provas/{id}` | admin | corridas em andamento: iniciar (uma por pista) e apagar |
| `POST` | `/api/provas/{id}/encerrar` | admin | grava o resultado final e move a corrida para o histórico |
| `GET` | `/api/relatorios/reservas`, `/ranking`, `/auditoria/reservas` | admin | consultas da view, da function e do log da trigger do banco (filtros `de`, `ate`, `minimoCorridas`, `pista`) |
| `GET/POST/PUT/DELETE` | `/api/faturamento` | admin | lançamentos financeiros |
| qualquer | demais rotas abaixo | admin | CRUD completo |

**Proteções de senha:**
- **Bloqueio:** 5 erros seguidos de senha (ou de CPF, na redefinição) bloqueiam aquele e-mail por 15 minutos; nesse período até a senha certa é recusada (HTTP 429, com o tempo restante na mensagem). Acertar a senha zera o contador. Os contadores ficam em memória: reiniciar a API libera todos.
- **Nova senha:** na redefinição, a senha nova precisa ter 6+ caracteres e **ser diferente da atual**.

Erros seguem um formato único: `{timestamp, status, erro, mensagem, campos?}`. `400` = dados inválidos (`campos` lista cada campo), `401` = sem login/senha errada, `403` = sem permissão, `404` = não existe, `429` = tentativas demais (bloqueio temporário), `409` = conflito (e-mail/CPF repetido, horário lotado, registro com dependências).

### CRUD genérico (admin)

Todos os recursos seguem o padrão CRUD:

| Método | Rota | Ação |
|---|---|---|
| `GET` | `/api/{recurso}` | Lista todos |
| `GET` | `/api/{recurso}/{id}` | Busca por id |
| `POST` | `/api/{recurso}` | Cria |
| `PUT` | `/api/{recurso}/{id}` | Atualiza |
| `DELETE` | `/api/{recurso}/{id}` | Remove |

| Recurso | Rota | Id |
|---|---|---|
| UF | `/api/ufs` | `sigla` |
| Cidade | `/api/cidades` | `codigo` |
| CEP | `/api/ceps` | `numero` |
| Pessoa | `/api/pessoas` | `codigo` |
| Cliente | `/api/clientes` | `pessoaCodigo` |
| Funcionário | `/api/funcionarios` | `pessoaCodigo` |
| Gerente | `/api/gerentes` | `pessoaCodigo` |
| Pista | `/api/pistas` | `nr` |
| Kart | `/api/karts` | `codigo` |
| Manutenção | `/api/manutencoes` | `codigo` |
| Corrida | `/api/corridas` | `nr` |
| Pagamento | `/api/pagamentos` | `codigo` |
| Cliente × Corrida | `/api/clientes-corridas` | `{clienteCodigo}/{corridaNr}` |
| Corrida × Kart | `/api/corridas-karts` | `{corridaNr}/{kartCodigo}` (sem `PUT`) |

### Exemplo

```bash
# login (guarde o token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@speedpark.com", "senha": "SUA_SENHA_DE_ADMIN"}'

# rota de admin com o token
curl -X POST http://localhost:8080/api/ufs \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"sigla": "SP", "nome": "São Paulo"}'
```

```javascript
const { token } = await (await fetch("http://localhost:8080/api/auth/login", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@speedpark.com", senha: "SUA_SENHA_DE_ADMIN" }),
})).json();
const res = await fetch("http://localhost:8080/api/ufs", { headers: { Authorization: `Bearer ${token}` } });
console.log(await res.json());
```

```python
import requests
token = requests.post("http://localhost:8080/api/auth/login",
                      json={"email": "admin@speedpark.com", "senha": "SUA_SENHA_DE_ADMIN"}).json()["token"]
print(requests.get("http://localhost:8080/api/ufs", headers={"Authorization": f"Bearer {token}"}).json())
```

### Testes

Com a API no ar, `ADMIN_SENHA='sua_senha' bash speedpark-api/tests/smoke.sh` roda 117 verificações (login, senha esquecida, permissões, validação, reservas, corridas, dependentes, financeiro, relatórios, trigger, erros 409) e apaga os dados que criou.

Há também testes unitários do bloqueio de tentativas (`cd speedpark-api && ./mvnw test`), que usam um relógio simulado para provar o desbloqueio sem esperar 15 minutos.

---

## 🗄️ Banco de Dados

- **SGBD:** Microsoft SQL Server (T-SQL)
- **Modelo:** relacional, com tabelas associativas para relacionamentos N:N (cliente × corrida, corrida × kart)
- **Integridade:** `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `IDENTITY` e constraints nomeadas
- **Documentação:** DER e mapeamento em `Banco-Kartodromo/`

Cobre: clientes, funcionários e gerentes, pistas, karts e manutenções, corridas e resultados, pagamentos e endereços (UF, cidade, CEP). Tabelas usadas pelo site: `Reserva`, `Faturamento`, `Prova` (corridas disputadas) e `Resultado` (posição, kart, melhor volta e penalidades de cada piloto), `Dependente` (filhos).

### Administração de banco de dados (Etapa 3 do Projeto de Extensão)

O relatório de referência pede, no mínimo, **1 procedure, 1 view, 1 trigger e 1 function que retorna tabela**, todas chamadas pelo sistema Java, mais o backup/restore (bônus). O projeto tem exatamente isso, no bloco **"ADMINISTRAÇÃO DE BANCO DE DADOS"** do `Banco_de_dados-Kartodromo.sql` (cabeçalho com **Objetivo** e o teste logo abaixo de cada objeto, como no modelo):

| Recurso | Nome | Para que serve | Quem chama no Java |
|---|---|---|---|
| **Procedure** | `sp_CadReserva_SpeedPark` | Cadastra a reserva e o lançamento financeiro na mesma transação (`begin try / begin tran / commit / rollback`); no erro, desfaz tudo e devolve `NumeroErro` e `MensagemErro` | `POST /api/reservas` |
| **View** | `v_Relatorio_Reservas_SpeedPark` | Consulta com `join`s e `case`: reserva + pista + piloto + forma de pagamento + situação | `GET /api/relatorios/reservas` |
| **Function (tabela)** | `fc_RankingPilotos_SpeedPark(minCorridas, pista)` | Ranking com corridas, vitórias e pontos estilo F1 | `GET /api/relatorios/ranking` |
| **Trigger** | `tg_HistNovaReserva` (em `Reserva`, `after insert`) | Grava em `LOG_HistoricoNovaReserva` cada reserva criada | disparada pela reserva feita pelo Java |

- As regras de negócio (categoria pela idade, vagas, valor) ficam no Java (`ReservaService`); a procedure só grava, como no exemplo.
- Tudo aparece na tela do admin em **Relatórios** (view, function e o histórico gravado pela trigger).
- Se o banco foi criado só pelo Hibernate (sem o script), a própria API cria os objetos que faltam ao subir (`BancoRecursosInicializador`): ela lê este mesmo script e executa apenas os `create` de objetos que ainda não existem, ignorando os testes.

### Backup e Restore

`Banco-Kartodromo/Backup_Restore_SpeedPark.sql` faz o **backup completo** (`BACKUP DATABASE ... WITH CHECKSUM`), confere o arquivo (`RESTORE VERIFYONLY`) e **restaura em um banco novo** (`KartManager_Restaurado`, com `WITH MOVE`) para você comparar com o original sem risco. Ao final traz o roteiro para restaurar por cima do banco original em caso de desastre. Testado: 22 tabelas e 16 recursos idênticos no banco restaurado.

---

## 🤝 Fluxo de trabalho (Git)

```bash
git pull                          # antes de começar
git add .
git commit -m "descrição"
git push                          # ao terminar
```

Para baixar o projeto em um PC novo, use `git clone https://github.com/A-bps/kart-manager.git` (nunca `git init`).

---

🏎️ Projeto acadêmico — FATEC.
