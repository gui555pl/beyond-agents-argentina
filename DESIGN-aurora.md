## Overview

O site da Aurora lê como uma marca de inovação de postura confiante e propósito claro. A base é um **fundo escuro profundo** (`{colors.canvas}` — #0a0a0f) sustentando texto em branco quente (`{colors.ink}` — #f0efe8) para display e corpo. A voltagem da marca é o **Aurora Violet** (`{colors.primary}` — #7c3aed) reservado para CTAs primários, destaques e elementos de movimento — usado com parcimônia.

A tipografia usa **Inter** como família única para display e corpo. Display senta em weight 500 com letter-spacing negativo — voz editorial de inovação, não grito técnico. JetBrains Mono (ou equivalente) carrega eventuais superfícies de código.

A assinatura visual mais forte são as **pills de estágio de jornada**: cinco pills coloridas (pêssego, menta, azul, lavanda, dourado) marcando as fases da jornada de aceleração (Discovery → Build → Scale) dentro de visualizações de produto. Usadas apenas em UI de produto — nunca como cores de ação do sistema.

**Características-chave:**
- Fundo escuro profundo, não preto puro. Ink é quente (#f0efe8), não branco puro.
- Cor de CTA única: `{colors.primary}` (Aurora Violet #7c3aed). Usada com parcimônia.
- Display weight em 500 — nunca bold pesado. Voz de inovação editorial.
- Pills de jornada: 5 tokens dedicados para estágios de aceleração.
- Raio de CTA compacto 8px — dialeto de produto tech.
- Profundidade apenas por bordas sutis e gradientes; sem drop shadows pesadas.
- 80px de ritmo de seção.

## Colors

### Brand & Accent
- **Aurora Violet** (`{colors.primary}` — #7c3aed): CTAs primários, destaques de aceleração, wordmark. Usado com parcimônia.
- **Aurora Violet Active** (`{colors.primary-active}` — #6d28d9): Estado de press.
- **Aurora Violet Light** (`{colors.primary-light}` — #a78bfa): Hover state, variações secundárias.

### Surface
- **Canvas** (`{colors.canvas}` — #0a0a0f): Fundo escuro profundo da página.
- **Canvas Soft** (`{colors.canvas-soft}` — #12121a): Fundo de cards internos e painéis.
- **Surface Card** (`{colors.surface-card}` — #1a1a27): Superfície de card — contraste sutil contra o canvas.
- **Surface Strong** (`{colors.surface-strong}` — #252536): Badges, pills de tag, divisores.
- **Surface Overlay** (`{colors.surface-overlay}` — #0f0f1a): Fundo de modal e overlay.

### Hairlines
- **Hairline** (`{colors.hairline}` — #2a2a40): Divisor 1px padrão.
- **Hairline Soft** (`{colors.hairline-soft}` — #1e1e30): Divisor leve.
- **Hairline Strong** (`{colors.hairline-strong}` — #3a3a55): Contorno de painel mais forte.

### Text
- **Ink** (`{colors.ink}` — #f0efe8): Display, body em destaque. Branco quente.
- **Body** (`{colors.body}` — #a8a5b8): Texto corrido padrão.
- **Body Strong** (`{colors.body-strong}` — #d4d2e0): Texto de apoio com mais ênfase.
- **Muted** (`{colors.muted}` — #6b6880): Sub-títulos, labels secundários.
- **Muted Soft** (`{colors.muted-soft}` — #4a4760): Texto desabilitado.
- **On Primary** (`{colors.on-primary}` — #ffffff): Texto branco sobre Aurora Violet.

### Journey Pills (assinatura de aceleração)
- **Thinking** (`{colors.journey-thinking}` — #dfa88f): Pêssego. Usado apenas em timelines de jornada de produto.
- **Discovery** (`{colors.journey-discovery}` — #9fc9a2): Menta. Fase de descoberta.
- **Build** (`{colors.journey-build}` — #9fbbe0): Azul pastel. Fase de construção.
- **Scale** (`{colors.journey-scale}` — #c0a8dd): Lavanda. Fase de escala.
- **Done** (`{colors.journey-done}` — #c08532): Dourado quente. Fase concluída/lançada.

### Semantic
- **Success** (`{colors.semantic-success}` — #1f8a65): Indicadores de confirmação.
- **Error** (`{colors.semantic-error}` — #cf2d56): Erros de validação.
- **Warning** (`{colors.semantic-warning}` — #d97706): Alertas.

### Vertical Badges
- **GovTech** (`{colors.vertical-gov}` — #3b82f6): Azul governo.
- **HealthTech** (`{colors.vertical-health}` — #10b981): Verde saúde.
- **LegalTech** (`{colors.vertical-legal}` — #f59e0b): Âmbar jurídico.
- **EdTech** (`{colors.vertical-ed}` — #8b5cf6): Violeta educação.

## Typography

### Font Family
**Inter** é a família principal de display e corpo. Fallback: `system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif`. Superfícies de código usam **JetBrains Mono**.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-mega}` | 72px | 500 | 1.1 | -2px | Hero h1 da homepage |
| `{typography.display-lg}` | 40px | 500 | 1.15 | -1px | Cabeçalhos de seção |
| `{typography.display-md}` | 28px | 500 | 1.2 | -0.5px | Cabeçalhos de sub-seção |
| `{typography.display-sm}` | 22px | 500 | 1.3 | -0.2px | Títulos de grupo de cards |
| `{typography.title-md}` | 18px | 600 | 1.4 | 0 | Títulos de componente |
| `{typography.title-sm}` | 16px | 600 | 1.4 | 0 | Labels de lista |
| `{typography.body-md}` | 16px | 400 | 1.6 | 0 | Corpo padrão |
| `{typography.body-tracked}` | 16px | 400 | 1.6 | 0.05px | Corpo editorial rastreado |
| `{typography.body-sm}` | 14px | 400 | 1.5 | 0 | Corpo do footer |
| `{typography.caption}` | 13px | 400 | 1.4 | 0 | Legendas |
| `{typography.caption-uppercase}` | 11px | 600 | 1.4 | 0.88px | Labels de seção, labels de pills de jornada |
| `{typography.code}` | 13px | 400 | 1.5 | 0 | Blocos de código — JetBrains Mono |
| `{typography.button}` | 14px | 500 | 1.0 | 0 | Labels de CTA |
| `{typography.nav-link}` | 14px | 500 | 1.4 | 0 | Menu de top-nav |

### Principles
- **Display weight em 500.** Voz editorial de inovação, nunca bold excessivo.
- **Letter-spacing negativo apenas em display.** -0.2px a -2px de tracking.
- **JetBrains Mono em toda superfície de código.**

## Layout

### Spacing System
- **Unidade base:** 4px.
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.base}` 16px · `{spacing.md}` 20px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 80px.
- **Section padding:** 80px.

### Grid & Container
- Largura máxima de conteúdo: ~1200px.
- Grid editorial: 12 colunas.
- Grids de cards de verticais: 2-up no desktop para splits, 4-up para logos de portfolio.
- Footer: 4 colunas no desktop.

### Whitespace Philosophy
Ritmo editorial generoso — mais próximo de uma plataforma de inovação premium do que de landing page genérica. O canvas escuro tem bastante respiro; cards dentro de bandas ficam próximos (16–24px de gap).

## Elevation & Depth

O sistema usa **profundidade por hairline e gradiente sutil**. Sem drop shadows pesadas. Cards flutuam acima do canvas via bordas de 1px e contraste sutil de superfície.

| Level | Treatment | Use |
|---|---|---|
| Flat (canvas) | `{colors.canvas}` (#0a0a0f) | Bandas de corpo, footer |
| Card | `{colors.surface-card}` (#1a1a27) | Cards de conteúdo |
| Hairline border | 1px `{colors.hairline}` | Contornos de card, divisores |
| Inner pane | `{colors.canvas-soft}` (#12121a) | Dentro de cards de mockup |

### Decorative Depth
- **Cards de mockup de produto** são os únicos elementos "elevados". Card escuro sobre canvas mais escuro com estrutura interna de painel.
- **Pills de jornada pastel** adicionam profundidade cromática sem elevação de superfície.
- **Gradiente de hero**: radial violet sutil no fundo do hero — `radial-gradient(ellipse at top, rgba(124,58,237,0.15) 0%, transparent 70%)`.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Reservado |
| `{rounded.xs}` | 4px | Tags inline |
| `{rounded.sm}` | 6px | Linhas compactas |
| `{rounded.md}` | 8px | CTAs, inputs de formulário |
| `{rounded.lg}` | 12px | Cards, painéis |
| `{rounded.xl}` | 16px | Cards de feature maiores (raro) |
| `{rounded.pill}` | 9999px | Pills de jornada, badges de vertical |
| `{rounded.full}` | 9999px | Avatares (raro) |

## Components

### Top Navigation

**`top-nav`** — Background `{colors.canvas}`, texto `{colors.ink}`, altura 64px. Layout: wordmark Aurora à esquerda, menu horizontal primário (Ecossistema / Verticais / Jornada / Benefícios / Portfolio), Login + CTA "Chamadas Abertas" à direita.

### Buttons

**`button-primary`** — O CTA Aurora Violet. Background `{colors.primary}`, texto `{colors.on-primary}`, type `{typography.button}` (14px / 500), padding 10px × 18px, altura 40px, rounded `{rounded.md}` (8px).

**`button-primary-active`** — Estado de press. Background `{colors.primary-active}`.

**`button-secondary`** — Pill de card sobre canvas escuro. Background `{colors.surface-card}`, texto `{colors.ink}`, borda 1px `{colors.hairline-strong}`.

**`button-tertiary-text`** — Link de texto ink inline.

**`button-cta-main`** — CTA maior de destaque. Background `{colors.primary}`, texto `{colors.on-primary}`, padding 14px × 28px, altura 48px. Usado para "Submeta sua iniciativa".

### Hero & Mockups

**`hero-band`** — Background `{colors.canvas}` com gradiente violet radial sutil, headline de display em `{typography.display-mega}` (72px / 500 / -2px), subtítulo em `{typography.body-md}`, dois CTAs (`button-cta-main` + `button-secondary`), e visual de jornada/mockup centralizado abaixo do copy.

**`journey-card`** — Card com estrutura de fases numeradas (01–06). Background `{colors.surface-card}`, rounded `{rounded.lg}` (12px), borda 1px `{colors.hairline}`, sem padding (painéis preenchem o card de borda a borda).

**`inner-pane`** — Painel interno dentro do mockup de jornada. Background `{colors.canvas-soft}`, texto `{colors.body}` em `{typography.body-md}`, rounded `{rounded.md}` (8px), padding 16px.

### Cards

**`feature-card`** — Background `{colors.surface-card}`, texto `{colors.ink}`, tipo `{typography.title-md}`, rounded `{rounded.lg}`, padding 24px. Borda 1px `{colors.hairline}`.

**`portfolio-card`** — Card de produto do portfolio (Absens, Legis, Erudio, Quoti). Mesmo surface e rounding; internamente com badge de vertical + título + descrição + CTA "Saiba mais".

**`comparison-card`** — Card "Antes × Depois da Aurora". Mesmo surface e rounding; dividido internamente em 2 colunas.

**`testimonial-card`** — Card de depoimento. Background `{colors.surface-card}`, texto `{colors.body}`, rounded `{rounded.lg}`, padding 24px.

**`company-logo-card`** — Card de logo de empresa do ecossistema (EDS, Beyond Co., EDX, Pointer, GPS IT, Bora!, Völund). Background `{colors.surface-card}`, borda 1px `{colors.hairline}`, rounded `{rounded.lg}`, padding 20px.

### Journey Pills (assinatura)

**`journey-pill-thinking`** — Pill pêssego. Background `{colors.journey-thinking}`, texto `{colors.ink}`, tipo `{typography.caption-uppercase}` (11px / 600 / 0.88px tracking, uppercase), rounded `{rounded.pill}`, padding 4px × 10px. Marca estágio "Thinking".

**`journey-pill-discovery`** — Pill menta. Mesmo shape, background `{colors.journey-discovery}`. Marca fase "Discovery".

**`journey-pill-build`** — Pill azul pastel. Background `{colors.journey-build}`. Marca fase "Build".

**`journey-pill-scale`** — Pill lavanda. Background `{colors.journey-scale}`. Marca fase "Scale".

**`journey-pill-done`** — Pill dourada. Background `{colors.journey-done}`, texto `{colors.on-primary}` branco. Marca fase "Done/Launched".

### Vertical Badges

**`badge-govtech`** — Background `{colors.vertical-gov}` com opacity 15%, texto `{colors.vertical-gov}`, rounded `{rounded.pill}`, tipo `{typography.caption-uppercase}`.

**`badge-healthtech`** — Background `{colors.vertical-health}` com opacity 15%, texto `{colors.vertical-health}`.

**`badge-legaltech`** — Background `{colors.vertical-legal}` com opacity 15%, texto `{colors.vertical-legal}`.

**`badge-edtech`** — Background `{colors.vertical-ed}` com opacity 15%, texto `{colors.vertical-ed}`.

### Forms & Tags

**`text-input`** — Background `{colors.surface-card}`, texto `{colors.ink}`, rounded `{rounded.md}` (8px), padding 12px × 16px, altura 44px.

**`badge-pill`** — Pill uppercase pequena. Background `{colors.surface-strong}`, texto `{colors.ink}`, tipo `{typography.caption-uppercase}`, rounded `{rounded.pill}`, padding 4px × 10px.

### CTA / Footer

**`cta-band`** — Banda pré-footer "Submeta sua iniciativa". Background `{colors.canvas}` com gradiente violet sutil, headline centralizada em `{typography.display-lg}`, CTA único Aurora Violet. 96px de padding vertical.

**`footer`** — Footer de fechamento. Background `{colors.canvas}`, texto `{colors.body}`. Lista de links em 4 colunas: Navegação / Programas / Escritórios / Conecte-se. Padding 64×48px.

**`footer-link`** — Background transparente, texto `{colors.body}`, tipo `{typography.body-sm}`.

## Do's and Don'ts

### Do
- Reserve `{colors.primary}` (Aurora Violet) para CTAs primários e wordmark.
- Mantenha display weight em 500. A voz editorial depende disso.
- Use o canvas escuro `{colors.canvas}` como base da página — nunca preto puro.
- Renderize toda superfície de código em JetBrains Mono.
- Use pills de jornada pastel apenas dentro de visualizações de aceleração de produto — nunca como cores de ação do sistema.
- Use badges de vertical com opacity 15% de fundo — nunca cor sólida.

### Don't
- Não introduza uma segunda cor de ação de marca. Aurora Violet é a única.
- Não mude display para weights bold (700+). A voz editorial depende de 500.
- Não adicione drop shadows pesadas. Hairlines + contraste ink-on-canvas escuro carregam a profundidade.
- Não use pills de jornada em UI que não seja de produto/timeline.
- Não extraia uma cor de CTA de um widget de terceiros (cookie consent, etc.).

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Hero h1 72→32px; visual de jornada colapsa para painel único; grid 1-up; nav hamburger. |
| Tablet | 640–1024px | Hero h1 48px; visual de jornada comprime; grid 2-up. |
| Desktop | 1024–1280px | Hero h1 72px completo; visual multi-fase completo; grid 4-up para logos. |
| Wide | > 1280px | Conteúdo limitado a 1200px. |

### Touch Targets
- CTA primário com altura 40px — WCAG AA.
- CTA principal "Submeta sua iniciativa" com altura 48px — WCAG AAA.

### Collapsing Strategy
- Top nav muda para hamburger abaixo de 768px.
- Visual de jornada multi-fase colapsa para painel único primário no mobile.
- Grid de cards: 4-up → 2-up → 1-up.

## Iteration Guide

1. Foque em um único componente por vez.
2. CTAs default para `{rounded.md}` (8px). Cards usam `{rounded.lg}` (12px).
3. Variantes vivem como entradas separadas dentro de `components:`.
4. Use `{token.refs}` em todo lugar — nunca hex inline.
5. Estado de hover não documentado.
6. Inter 500 para display, 400/500/600 para corpo. JetBrains Mono em toda superfície de código.
7. Aurora Violet fica escasso.
8. Pills de jornada ficam escopadas para visualizações de aceleração de produto.

## Known Gaps

- Valores exatos de hex precisam ser confirmados inspecionando o CSS do site em produção (DevTools → Computed Styles).
- Timings de animação (entrada de pill de jornada, reveal de card) fora de escopo.
- Superfícies in-app apenas parcialmente capturadas via mockups de marketing.
- Estados de validação de formulário além de focus não visíveis nas superfícies capturadas.
- Gradiente exato do hero (Aurora Violet radial) precisa de calibração visual.
- Tipografia real pode divergir de Inter — confirmar via DevTools.
