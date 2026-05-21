<div align="center">

# Design System — Fii Analyser
### `v2.0.0` · White Neon Edition

*Documento vivo — espelha o código em `frontend/css/`.*

**Arquivos de implementação**

| Arquivo | Responsabilidade |
|---|---|
| `frontend/css/tokens.css` | Variáveis (cores, tipo, espaço) |
| `frontend/css/base.css` | Reset, scrollbars, animações globais |
| `frontend/css/components.css` | Botões, inputs, cards, modais, critérios |
| `frontend/css/layout.css` | Sidebar, grids, tabelas |
| `frontend/css/icons.css` | Tamanhos de ícones SVG |
| `frontend/js/icons.js` | SVGs (sem emojis) |

</div>

&nbsp;

---

## Changelog

| Versão | Data | Resumo |
|---|---|---|
| **v2.0.2** | Mai/2026 | Hover `.btn-primary` sem `translateY` (evita piscar); transição só em propriedades visuais |
| **v2.0.1** | Mai/2026 | Botão "Salvar no histórico" no formulário; estado apagado até campos completos; animação `saveBtnWake` |
| **v2.0.0** | Mai/2026 | Paleta white neon; sidebar; critérios por borda; modais (data + checklist); combo escala; toggle com balão; Plus Jakarta Sans; estrutura frontend/backend |
| v1.0.0 | — | Versão inicial green neon (`#39FF14`) — **obsoleta** |

> Ao fazer mudanças visuais, **sempre** registrar aqui e na regra `.cursor/rules/design-system-sync.mdc`.

&nbsp;

---

## 01 · Filosofia de Design

> **Contraste absoluto. Precisão financeira. Um acento que ilumina.**

O Fii Analyser usa fundo escuro profundo com **branco neon** como cor de destaque — títulos, botões primários, valores importantes e estados ativos. Verde aparece apenas como **reforço sutil de sucesso** (bordas e limites de critérios aprovados), nunca como cor primária da interface.

**Pilares**

| Pilar | Princípio |
|---|---|
| **Legibilidade** | Números com `tabular-nums`; alinhamento à direita em tabelas |
| **Hierarquia** | Branco neon = primário; cinza = secundário; borda = semântica |
| **Sobriedade** | Fundo dos cards/critérios sempre `--bg-surface`; cor semântica na **borda** |
| **Consistência** | Tokens CSS únicos; sem cores hardcoded exceto casos documentados |

&nbsp;

---

## 02 · Paleta de Cores

### Acento principal — White Neon

```
#FFFFFF  ·  --neon / --neon-light
Uso: botões primários, títulos, ticker, valores métrica, texto de critério aprovado
Texto sobre botão branco: --text-on-accent (#0a0a0a)
```

### Sucesso — Verde sutil (bordas e limites)

```
#4ADE80  ·  --success-green
rgba(74, 222, 128, 0.28)  ·  --success-green-border
Uso: borda de critério/card/badge APROVADO; limite do critério (.criterion-limit)
NÃO usar como fundo forte nem como cor primária de CTA
```

### Backgrounds

| Token | Hex | Uso |
|---|---|---|
| `--bg-void` | `#000000` | Overlays |
| `--bg-base` | `#0a0a0a` | Página |
| `--bg-surface` | `#111111` | Cards, critérios, modais |
| `--bg-raised` | `#161616` | Inputs, badges |
| `--bg-hover` | `#1a1a1a` | Hover |
| `--bg-subtle` | `#222222` | Bordas internas |

### Semântica

| Estado | Cor | Borda / uso |
|---|---|---|
| Aprovado | `--neon-light` + borda `--success-green-border` | Critérios, card resultado |
| Reprovado | `--danger` `#FF3B3B` | Borda vermelha |
| Atenção | `--warning` `#FFAA00` | Borda amarela |
| Info | `--info` `#3B9EFF` | Ícones informativos |
| Crescente (DY) | `#4ADE80` | Botão `.selected-crescente` |

### Glow

```css
--glow-neon:    0 0 10px #FFFFFF55, 0 0 28px #FFFFFF33, 0 0 48px #FFFFFF18;
--glow-subtle:  0 0 14px #FFFFFF44;
--glow-success: 0 0 10px rgba(74, 222, 128, 0.18), 0 0 24px rgba(74, 222, 128, 0.08);
--glow-danger:  0 0 8px #FF3B3B66, 0 0 20px #FF3B3B22;
--glow-warn:    0 0 8px #FFAA0066, 0 0 20px #FFAA0022;
```

**Regra:** glow branco em CTAs e sidebar ativa; glow verde só em contextos de sucesso pontuais.

&nbsp;

---

## 03 · Tipografia

```
Fonte: Plus Jakarta Sans (Google Fonts)
Pesos: 400, 500, 600, 700
Números: font-variant-numeric: tabular-nums (tabelas, métricas, critérios)
```

| Token | Tamanho | Uso |
|---|---|---|
| `--type-display` | `2rem` | Hero (reservado) |
| `--type-title` | `1.625rem` | Ticker no resultado |
| `--type-heading` | `1.125rem` | Título de página / seção |
| `--type-subheading` | `1rem` | Botões, erros |
| `--type-body` | `0.9375rem` | Formulários, corpo |
| `--type-caption` | `0.8125rem` | Tabela, chips |
| `--type-label` | `0.8125rem` | Labels de campo |

**Labels (`.label`)**

- Peso 600, `--text-secondary`
- **Sentence case** (não uppercase forçado)
- `letter-spacing: 0.01em`

**Destaques**

- `.page-title`, `.section-title`, `.result-ticker`: branco neon + `text-shadow: 0 0 24px #FFFFFF44`
- `.metric-value`: branco neon + glow

&nbsp;

---

## 04 · Layout e Navegação

### App shell

```
┌──────────────┬────────────────────────────────────┐
│   SIDEBAR    │  page-header                       │
│   logo 96px  │  main (max-width 1200px)           │
│   Análise    │    cards / forms / resultados      │
│   Simulador  │                                    │
└──────────────┴────────────────────────────────────┘
```

- `.app`: flex row, `min-height: 100vh`
- `.sidebar`: 260px, sticky, `--bg-surface`, borda direita `#FFFFFF22`
- `.sidebar__logo`: altura **96px**
- `.sidebar__indicator`: pill animado atrás do link ativo (gradiente branco + glow)
- Navegação SPA-like via `sidebar.js` (fetch + `history.pushState`)

### Transições de página

| Classe | Efeito |
|---|---|
| `.page-enter-initial` | Fade + slide up na carga |
| `.page-enter-from-right` | Entrada simulador |
| `.page-enter-from-left` | Entrada análise |
| `.page-exit-left` / `.page-exit-right` | Saída antes do swap |

### Grids de formulário

| Classe | Colunas |
|---|---|
| `.form-grid--3` | 3 (análise — dados do fundo) |
| `.form-grid--2` | 2 (critérios qualitativos) |
| `.summary-grid` | 5 (simulador — resumo) |

Gap padrão: `--space-4` (16px)

&nbsp;

---

## 05 · Ícones

- **Proibido:** emojis na UI
- **Obrigatório:** SVG via `Icons` em `frontend/js/icons.js`
- Tamanhos em `icons.css`: `.icon--sm` (16px), `.icon--md` (18px), `.icon--badge` (16px em badges)
- Critérios usam `.criterion-icon` (22×22px)
- Sidebar: SVG inline nos links (20×20px)

&nbsp;

---

## 06 · Componentes

### 6.1 · Botões

**Primary (`.btn-primary`)**

- Gradiente branco, texto `--text-on-accent`
- `--glow-neon`; hover: gradiente levemente mais claro + glow intensificado (**sem** `translateY` — evita piscar)
- Active: `scale(0.98)` apenas no clique

**Secondary (`.btn-secondary`)**

- Transparente, borda `--neon-dim`, texto `--neon`

**Salvar histórico (`.btn-save-historico`)**

- Fica ao lado de **Analisar FII** no formulário
- **Apagado** (`.btn-save-historico--dimmed`): opacity ~0.38, disabled, borda neutra, **sem** cursor de bloqueado
- Hover apagado: tooltip `.save-historico-tip` — *"Preencha todos os campos para salvar no histórico"*
- **Ativo** (`.btn-save-historico--ready`): quando todos os campos obrigatórios estão preenchidos
- Transição suave + animação `saveBtnWake` (~0.65s) ao ganhar cor (borda verde sutil + glow)
- Ao clicar: analisa + salva na API + exibe feedback em `.save-feedback`

**Estados:** `:disabled` → opacity 0.4 (botões genéricos)

### 6.2 · Inputs

**Padrão (`.input`)**

- Altura **43px**, `--bg-raised`, borda `--border-hover`
- Focus: borda `--neon` + ring `--neon-ghost`
- Error: borda `--danger`

**Numéricos:** spinners ocultos globalmente em `base.css`

**Campo data (`.input--picker`)**

- Botão estilo input; abre modal de constituição
- Placeholder muted; preenchido → `.input--picker--filled` texto primary
- Ícone calendário à direita

### 6.3 · Input combo + escala (Milhões / Bilhões)

Usado em: Patrimônio Líquido, Liquidez Diária

```
┌─────────────────────────────────────────────┐
│  1,2                    Bilhões  ∨          │
└─────────────────────────────────────────────┘
```

- `.input-combo`: campo unificado, sem divisória interna
- `.scale-dropdown__label`: opção selecionada à esquerda do chevron
- Menu: fundo escuro translúcido + `backdrop-filter: blur(16px)`
- Defaults: PL = Bilhões, Liquidez = Milhões

### 6.4 · Toggle FII Papel / Tijolo

**Estados**

| Classe | Visual |
|---|---|
| `.toggle-active` | Gradiente branco, texto escuro, glow |
| `.toggle-inactive` | `--bg-raised`, texto muted |

**Balão de checklist (`.toggle-btn__balloon`)**

1. Clique seleciona tipo → animação do ícone balão preto (`#0a0a0a`) dentro do botão ativo
2. Clique no balão → modal checklist (`.checklist-modal`)
3. Segundo clique no mesmo botão ativo → desseleciona tipo
4. Animação `balloon-pop` (~450ms) antes do scroll ao formulário

### 6.5 · Botões Sim/Não qualitativos (`.yes-no-btn`)

| Estado | Classe | Visual |
|---|---|---|
| Estável / Sim | `.selected-yes` | Fundo escuro, borda branca neon |
| Crescente | `.selected-crescente` | Borda e texto `#4ADE80` |
| Não | `.selected-no` | Vermelho semântico |

### 6.6 · Cards

**Base (`.card`)**

- `--bg-surface`, padding `--space-6`, radius `--radius-lg`

**Resultado — regra de ouro**

> Fundo **sempre** `--bg-surface`. Status comunicado pela **borda**.

| Classe | Borda |
|---|---|
| `.card-approved` | `--success-green-border` |
| `.card-rejected` | `--danger` |
| `.card-warning` | `--warning` |

### 6.7 · Badges

Mesma lógica dos cards: fundo `--bg-raised`, borda semântica, sem glow pesado.

- Aprovado: texto branco neon + borda verde sutil
- `text-shadow` leve no badge aprovado

### 6.8 · Separador de seção (`.separator`)

Gradiente horizontal: transparente → `--neon-dim` → transparente

&nbsp;

---

## 07 · Modais

Padrão compartilhado: `.checklist-modal`, `.date-modal`

```css
/* Backdrop */
background: rgba(0, 0, 0, 0.72);
backdrop-filter: blur(4px);

/* Painel */
background: var(--bg-surface);
border: 1px solid var(--border-hover);
border-radius: var(--radius-xl);
animation: modal-slide-up 0.3s;
```

| Modal | ID | Conteúdo |
|---|---|---|
| Checklist do tipo | `#checklist-modal` | Grid de cards por critério (tipo + geral) |
| Data de constituição | `#historico-date-modal` | Wizard 3 passos: Ano → Mês → Dia |

**Modal de data**

- Steps: `.date-modal__step` — ativo = pill branco neon; concluído = borda verde
- Mês: grid 4 colunas; Dia: grid 7 colunas (`.date-modal__chip`)
- Confirmar → exibe `DD/MM/AAAA · N anos` no picker

**Body lock:** `body.modal-open { overflow: hidden }`

Fechar: X, backdrop, Esc

&nbsp;

---

## 08 · Critérios de análise (lista)

```
┌─ bg: --bg-surface ─────────────────────────────────────────┐
│ ✓  Liquidez Diária          R$ 2M        ≥ R$ 1M          │  border: verde sutil
├────────────────────────────────────────────────────────────┤
│ ✕  Vacância                 12%          ≤ 10%             │  border: vermelha
└────────────────────────────────────────────────────────────┘
```

| Classe | Fundo | Borda | Texto |
|---|---|---|---|
| `.criterion.pass` | `--bg-surface` | `--success-green-border` | Branco neon + text-shadow |
| `.criterion.pass .criterion-limit` | — | — | `--success-green` 75% |
| `.criterion.fail` | `--bg-surface` | vermelha 50% | `--danger` |
| `.criterion.warn` | `--bg-surface` | amarela 50% | `--warning` |
| `.criterion.info` | `--bg-surface` | `--border-base` | `--text-muted` |

**Feedback de salvamento (`.save-feedback`)**

- Abaixo dos botões do formulário (`.actions`)
- Sucesso: `--success-green` · Erro: `--danger`

&nbsp;

---

## 09 · Tabela (Simulador)

Headers: `--neon-light` sobre `#0d0d0d`

| Coluna | Classe | Cor |
|---|---|---|
| Valor Total Real | `.col-total-real` | **Laranja** `#ff9800` |
| Dividendo Real | `.col-div-real` | **Branco neon** + text-shadow |

Zebra: `#0f0f0f` / `--bg-base` · Hover: `#1a1a1a`

&nbsp;

---

## 10 · Animações

| Nome | Uso |
|---|---|
| `fadeInUp` | `.resultado` ao aparecer |
| `fadeIn` | `.metric-card` |
| `glowPulse` | `.badge-approved` (sutil) |
| `balloon-pop` | Ícone balão no toggle |
| `modal-fade-in` / `modal-slide-up` | Modais |
| `pageEnter*` / `pageExit*` | Navegação sidebar |

Transições: `--t-fast` 0.15s · `--t-base` 0.25s · `--t-slow` 0.4s

&nbsp;

---

## 11 · Espaçamento e radius

Escala: `--space-1` (4px) … `--space-16` (64px)

Radius: `--radius-sm` 4px · `--radius-md` 6px · `--radius-lg` 10px · `--radius-xl` 14px

&nbsp;

---

## 12 · Tokens CSS — referência (espelho de `tokens.css`)

```css
:root {
  /* Backgrounds */
  --bg-void: #000000;
  --bg-base: #0a0a0a;
  --bg-surface: #111111;
  --bg-raised: #161616;
  --bg-hover: #1a1a1a;
  --bg-subtle: #222222;

  /* Accent — White Neon */
  --neon: #FFFFFF;
  --neon-light: #FFFFFF;
  --neon-bright: #F5F5F5;
  --neon-dim: #FFFFFF66;
  --neon-ghost: #FFFFFF22;

  /* Success — green subtle */
  --success-green: #4ADE80;
  --success-green-border: rgba(74, 222, 128, 0.28);
  --success-green-glow: rgba(74, 222, 128, 0.12);
  --success-bg: #0a120e;

  /* Semantic */
  --danger: #FF3B3B;
  --warning: #FFAA00;
  --info: #3B9EFF;
  --text-on-accent: #0a0a0a;

  /* Text */
  --text-primary: #E8E8E8;
  --text-secondary: #888888;
  --text-muted: #555555;

  /* Borders */
  --border-base: #1f1f1f;
  --border-hover: #2a2a2a;
  --border-accent: #FFFFFF;

  /* Glow — ver seção 02 */
}
```

&nbsp;

---

## 13 · Manutenção deste documento

### Quando atualizar

- Novo componente visual
- Mudança de cor, spacing, animação ou padrão de modal
- Novo estado (hover, error, selected)
- Alteração em `tokens.css`

### Como atualizar

1. Editar CSS em `frontend/css/`
2. Atualizar seção correspondente **neste arquivo**
3. Adicionar linha no **Changelog**
4. Se novo token → seção 12 + `tokens.css`

### Checklist antes de concluir PR/tarefa visual

- [ ] Tokens usados (sem hex solto, salvo exceções documentadas)
- [ ] Fundo de critérios/cards = `--bg-surface`; semântica na borda
- [ ] Ícones SVG, sem emojis
- [ ] Design system e Changelog atualizados
- [ ] `node frontend/test/logic.test.js` passa (lógica intacta)

&nbsp;

---

<div align="center">

**Fii Analyser · Design System · v2.0.0 · White Neon**

*Qualquer desvio deve ser intencional, implementado em tokens.css e registrado no Changelog.*

</div>
