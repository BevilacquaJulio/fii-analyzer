# Backend — Fii Analyser

API simples em Node.js + Express + MySQL para salvar o histórico de análises.

## Estrutura (MVC)

```
backend/
├── server.js                 → inicia o servidor
├── database/
│   └── schema.sql            → script MySQL (executar manualmente)
└── src/
    ├── app.js                → configuração do Express
    ├── config/
    │   └── database.js       → conexão com MySQL
    ├── models/
    │   └── AnaliseModel.js   → consultas no banco
    ├── controllers/
    │   └── AnaliseController.js → regras da API
    └── routes/
        └── analiseRoutes.js  → rotas HTTP
```

## 1. Criar o banco de dados

Abra o **phpMyAdmin** (ou DBeaver / MySQL Workbench), vá na aba **SQL** e execute o arquivo:

`backend/database/schema.sql`

## 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo:

```bash
copy .env.example .env
```

Edite o `.env` com seus dados do MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fii_analyser
```

## 3. Instalar e rodar

```bash
cd backend
npm install
npm start
```

A API ficará em: `http://localhost:3000`

## Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Verifica se a API está online |
| POST | `/api/analises` | Salva uma análise |
| GET | `/api/analises` | Lista análises salvas |
| GET | `/api/analises/:id` | Busca uma análise pelo ID |

## Exemplo de POST

```json
{
  "ticker": "HGLG11",
  "tipo": "papel",
  "status": "approved",
  "aprovados": 9,
  "total": 9,
  "dados": { "ticker": "HGLG11", "pvp": 0.95 },
  "resultado": { "typeResults": [], "generalResults": [] }
}
```
