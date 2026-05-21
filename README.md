# Fii Analyser

Sistema de análise e simulação de Fundos Imobiliários (FIIs).

## Estrutura do projeto

```
fii_analyser/
├── frontend/          → Interface (HTML, CSS, JavaScript)
├── backend/           → API Node.js + MySQL (MVC)
├── docs/              → Documentação e prompts do projeto
└── README.md
```

## Frontend

Abra `frontend/index.html` no navegador ou use uma extensão **Live Server**.

```bash
# Testes da lógica (opcional)
node frontend/test/logic.test.js
```

Mais detalhes: [frontend/README.md](frontend/README.md)

## Backend

```bash
cd backend
copy .env.example .env
npm install
npm start
```

Antes de rodar, execute o script SQL em `backend/database/schema.sql` no MySQL.

Mais detalhes: [backend/README.md](backend/README.md)

## Documentação

- [Design system](docs/fii-analyzer-design-system.md) — **referência visual obrigatória** para mudanças de UI
