# Frontend — Fii Analyser

Interface estática em HTML, CSS e JavaScript puro.

## Estrutura

```
frontend/
├── index.html        → Analisador de FII
├── simulador.html    → Simulador de lucros
├── historico.html    → Histórico de análises salvas
├── logo.png
├── css/              → Estilos
├── js/               → Lógica da aplicação
└── test/             → Testes da lógica (Node.js)
```

## Como abrir

1. Abra `index.html` no navegador, **ou**
2. Use **Live Server** no VS Code/Cursor apontando para esta pasta.

## API

O botão **Salvar no histórico** chama a API em `http://localhost:3000`.  
Configure a URL em `js/config.js` se necessário.

## Testes

Na raiz do projeto:

```bash
node frontend/test/logic.test.js
```
