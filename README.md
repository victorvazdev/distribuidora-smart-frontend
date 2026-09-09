# Distribuidora Smart - Gerenciamento de Estoque de Distribuidoras

Uma Single Page Application (SPA) para gerenciamento de estoque de distribuidoras. Este projeto permite o cadastro, listagem, edição e exclusão de **Produtos**.

Este frontend foi desenvolvido seguindo princípios estritos de **Vanilla Web Development**, sem a utilização de frameworks JavaScript pesados (como React, Angular ou Vue) ou bibliotecas de pré-processamento, garantindo alta performance, leveza e execução direta no navegador.

## Tecnologias Utilizadas

* **HTML5:** Estrutura semântica da aplicação.
* **CSS3:** Estilização customizada nativa (Flexbox, CSS Grid) sem frameworks de UI.
* **JavaScript (ES6+):** Manipulação do DOM, controle de estado da SPA e consumo da API RESTful via `Fetch API`.

## Pré-requisitos e Dependências

Devido à arquitetura **Vanilla Web Developnment** o qual foi adotada, o frontend **não possui dependências externas** via gerenciadores de pacotes (como `npm` ou `yarn`). Não é necessário instalar o Node.js para rodar esta interface.

**No entanto, o frontend depende do Backend (API) para funcionar corretamente:**
* A API em Python/Flask deve estar em execução na sua máquina local.

## Como executar com Docker (Recomendado)

A maneira mais fácil e isolada de rodar o projeto é utilizando o Docker. Certifique-se de ter o [Docker](https://www.docker.com/) instalado e rodando em sua máquina.

1. Faça o clone do repositório e acesse a pasta do projeto:
```bash
git clone [https://github.com/victorvazdev/distribuidora-smart-frontend.git](https://github.com/victorvazdev/distribuidora-smart-frontend.git)
cd distribuidora-smart-frontend
```

2. Construa a imagem da aplicação:
```bash
docker build -t victorvazdev/distribuidora-smart-frontend:1.0.0 .
```

3. Execute o container mapeando a porta 8000:
```bash
docker run -d --name ds-front -p 8080:80 victorvazdev/distribuidora-smart-frontend:1.0.0
```

A aplicação já estará rodando e pronta para acesso na porta 8000.

## Como executar o projeto localmente (Sem Docker)
Caso prefira rodar sem containers, siga os passos abaixo para executar a aplicação no seu ambiente local:

### 1. Clonando o repositório
Abra o seu terminal e clone este repositório para a sua máquina:
```bash
git clone https://github.com/victorvazdev/distribuidora-smart-frontend.git
cd distribuidora-smart-frontend
```

### 2. Configurando a conexão com a API
Por padrão, o frontend está configurado para se comunicar com a API local na porta 8000.

Caso precise alterar o endereço da API, edite o arquivo api.js localizado na raiz do projeto:

```javascript
// app.js
const API_URL = 'http://localhost:8000';
```

### 3. Executando a Aplicação (Comandos de Inicialização)
Para inicializar o frontend, basta dar um duplo clique no arquivo principal:

1. Navegue até a pasta do projeto através do gerenciador de arquivos do seu sistema operacional.
2. Dê um duplo clique no arquivo index.html.
3. O projeto será aberto e executado imediatamente no seu navegador padrão web (Chrome, Firefox, Edge, Safari, etc).

## Estrutura de Arquivos
.
├── app.js
├── Dockerfile
├── index.html
├── README.md
└── styles.css
