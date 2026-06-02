    aju# 🏎️ Speed Park — Sistema de Kartódromo

Uma landing page interativa e de alta performance desenvolvida para o **Speed Park**, a pista de kart mais rápida e tecnológica da região.

Este projeto foi construído com foco em **simplicidade, performance e facilidade de avaliação**, utilizando uma arquitetura totalmente do lado do cliente (Client-Side). Isso significa que o projeto não requer instalação de dependências ou uso de terminal para rodar, sendo ideal para entregas acadêmicas.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza bibliotecas modernas injetadas diretamente via **CDN (Content Delivery Network)**
* **Estrutura Base:** HTML5 Semântico
* **Interface (UI):** [React 18](https://react.dev/) 
* **Transpilação:** [Babel Standalone](https://babeljs.io/docs/babel-standalone)
* **Estilização e Layout:**
  * [Tailwind CSS v3](https://tailwindcss.com/) (Motor de utilitários CSS configurado por script dinâmico)
  * [Bootstrap 5.3](https://getbootstrap.com/) (Sistema de Grid responsivo)
  * CSS Vanilla (`style.css`) para micro-interações, design brutalista e efeitos de Scroll Reveal.

---

## 📂 Estrutura do Projeto

A arquitetura foi condensada para ser o mais enxuta possível, focando apenas no essencial para o funcionamento local:

```text
Projeto-Kartodromo/
├── src/
│   └── assets/
│       └── images/         # Imagens estáticas e recursos visuais do projeto
├── app.jsx                 # Lógica central em React (Componentes, Hooks e Renderização)
├── style.css               # Estilos customizados, animações e variáveis CSS globais
├── index.html              # Ponto de entrada (carrega as CDNs e inicializa a aplicação)
└── README.md               # Esta documentação
```

---

## 🛠️ Como Executar Localmente (Para Avaliação)

Como o projeto foi projetado para rodar sem servidor backend ou empacotador (bundler), o processo de execução é imediato e descomplicado.

### 📋 Pré-requisitos
* Uma **conexão de internet ativa** (fundamental para o carregamento dos scripts do React, Tailwind e Babel via CDN).
* O editor **Visual Studio Code (VS Code)**.
* A extensão **Live Server** instalada no VS Code.

### 🚦 Passo a Passo
1. Abra a pasta principal do projeto (`Projeto-Kartodromo`) no seu VS Code.
2. Localize e abra o arquivo `index.html`.
3. Clique no botão **"Go Live"** localizado no canto inferior direito do VS Code (ou clique com o botão direito em qualquer lugar do código HTML e selecione *"Open with Live Server"*).
4. O seu navegador padrão abrirá automaticamente no endereço `http://127.0.0.1:5500` (ou porta semelhante), exibindo o projeto.

> **Nota para Avaliadores:** O projeto atua como uma _Single Page Application (SPA)_ estática. Toda a navegação ("Corridas", "Preços", "Rankings") ocorre de forma fluida por meio de âncoras (scroll suave) dentro da mesma página, sem a necessidade de bibliotecas externas de roteamento.

---

## 🗺️ Funcionalidades e Componentes

Toda a lógica está modularizada dentro do arquivo `app.jsx`, dividida nos seguintes componentes principais:

* **Navbar:** Menu de navegação responsivo (mobile-friendly) com efeito de _backdrop-blur_ (vidro fosco) e menu sanduíche para telas menores.
* **Hero Section:** Banner inicial de alto impacto visual com efeito Parallax vinculado ao movimento do mouse do usuário.
* **Baterias:** Cards modernos apresentando as modalidades de corrida (Sessões Open, Pro e Kart Junior).
* **Diferenciais:** Seção baseada em Grid destacando as tecnologias e medidas de segurança da pista.
* **Preços (Planos):** Tabela de preços utilizando _UI Brutalista_, com destaque para o plano mais popular e micro-interações de hover.
* **Rankings:** Sistema interativo de abas dinâmicas (Tabs) que filtra os tempos, pontuações e posições dos pilotos com base na categoria escolhida (Open, Pro e Junior).
* **useScrollReveal (Custom Hook):** Um Hook customizado em React que faz integração com a `Intersection Observer API` nativa do navegador. Ele é responsável por revelar os elementos na tela de forma suave (Fade-in/Up) à medida que o usuário rola a página.

---
🏎️ Desenvolvido como trabalho final com foco em **UI/UX moderna**, **design responsivo** e **arquitetura de código limpa e condensada**.
