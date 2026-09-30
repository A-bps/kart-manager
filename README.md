# 🏎️ Speed Park — Sistema de Kartódromo

Sistema web para o kartódromo **Speed Park**, composto por três partes:

- **Frontend** — site institucional + painel do piloto + painel administrativo (React via CDN, sem build).
- **Backend** — API REST em **Java 21 / Spring Boot** (`speedpark-api`).
- **Banco de dados** — **Microsoft SQL Server**, com modelagem relacional documentada em `Banco-Kartodromo/`.

> ⚠️ **Estado atual:** o frontend ainda **não consome a API** — os dados das telas (pilotos, reservas, frota, faturamento) ficam no `localStorage` do navegador. A API e o banco funcionam de forma independente e podem ser testados pelo Postman.

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
├── utils.js                              # Funções compartilhadas do frontend
├── style.css                             # Estilos customizados e animações
├── src/assets/images/                    # Logo e imagens
├── Banco_de_dados-Kartodromo.sql         # Script de criação do banco
├── Banco-Kartodromo/                     # Documentação do banco (DER, mapeamento, análises)
└── speedpark-api/                        # API REST Spring Boot
    └── src/main/java/com/fatec/speedpark/
        ├── controllers/                  # Endpoints REST
        ├── services/                     # Regras de negócio
        ├── repositories/                 # Acesso ao banco (JPA)
        ├── entities/                     # Tabelas mapeadas
        ├── dto/                          # Objetos de entrada das requisições
        └── exceptions/                   # Tratamento global de erros
```

---

## 🖥️ Como Executar o Frontend

**Pré-requisitos:** internet (para as CDNs), VS Code com a extensão **Live Server**.

1. Abra a pasta `Projeto-Kartodromo` no VS Code.
2. Abra o `index.html` e clique em **Go Live** (canto inferior direito).
3. O site abre em `http://127.0.0.1:5500`.

Os painéis são acessados pelo login do site ou diretamente por `dashboard-piloto.html` e `dashboard-admin.html`.

---

## ☕ Como Executar o Backend

**Pré-requisitos:** Java JDK 21 e SQL Server rodando na porta `1433`. Não é preciso instalar o Maven — o projeto usa o Maven Wrapper (`mvnw`).

### 1. Criar o banco

No SQL Server Management Studio, crie o banco (só na primeira vez):

```sql
CREATE DATABASE KartManager;
```

As **tabelas são criadas automaticamente** pelo Hibernate ao subir a API (`ddl-auto=update`). Como alternativa, é possível rodar o script `Banco_de_dados-Kartodromo.sql`.

### 2. Configurar a conexão

O arquivo com a senha **não é versionado**. Crie-o a partir do modelo:

```bash
cd speedpark-api/src/main/resources
cp application.properties.example application.properties
```

Edite o `application.properties` e troque `SUA_SENHA_AQUI` pela senha do seu usuário do SQL Server (e o `username`, se não for `sa`).

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
curl -X POST http://localhost:8080/api/ufs \
  -H "Content-Type: application/json" \
  -d '{"sigla": "SP", "nome": "São Paulo"}'

curl http://localhost:8080/api/ufs
```

```javascript
const res = await fetch("http://localhost:8080/api/ufs");
console.log(await res.json());
```

```python
import requests
print(requests.get("http://localhost:8080/api/ufs").json())
```

---

## 🗄️ Banco de Dados

- **SGBD:** Microsoft SQL Server (T-SQL)
- **Modelo:** relacional, com tabelas associativas para relacionamentos N:N (cliente × corrida, corrida × kart)
- **Integridade:** `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `NOT NULL`, `IDENTITY` e constraints nomeadas
- **Documentação:** DER e mapeamento em `Banco-Kartodromo/`

Cobre: clientes, funcionários e gerentes, pistas, karts e manutenções, corridas e resultados, pagamentos e endereços (UF, cidade, CEP).

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
