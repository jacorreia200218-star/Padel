# Padel Coach AI

Assistente pessoal de preparação física para padel: um check-in diário sobre o
estado do corpo gera automaticamente o plano de treino do dia, com os exercícios
escolhidos e a explicação de porque foram escolhidos.

## Run & Operate

- `pnpm --filter @workspace/padel-coach run dev` — correr a app (porta 25005)
- `pnpm --filter @workspace/padel-coach run build` — build de produção
- `pnpm --filter @workspace/padel-coach run typecheck` — typecheck da app
- `pnpm run typecheck` — typecheck de todos os pacotes
- Env necessárias em dev: `PORT` e `BASE_PATH` (definidas pelo `artifact.toml`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- App: React 19 + Vite 7, CSS próprio (sem framework de componentes)
- Persistência: `localStorage` do browser — **não há servidor nem base de dados**

## Where things live

Toda a app está em `artifacts/padel-coach/`:

| Ficheiro | O que é |
|---|---|
| `src/data/exercises.ts` | **Fonte de verdade** dos 62 exercícios, categorias, zonas de dor, equipamento, objetivos, escalas e dicas |
| `src/engine/checkin.ts` | Formato do check-in e os **sinais** que dele se derivam (prontidão, cansaço, sinais de alerta) |
| `src/engine/planner.ts` | **Motor de decisão**: recebe o check-in e devolve o plano do dia |
| `src/store/useStore.ts` | Estado + leitura/escrita em `localStorage` |
| `src/store/migrate.ts` | Conversão de dados gravados por versões anteriores do formato |
| `src/tabs/` | Os cinco separadores (Hoje, Biblioteca, Histórico, Estatísticas, Definições) |
| `src/app.css` | Estilos da app. `src/index.css` tem só os tokens de cor e o Tailwind |

## Architecture decisions

- **Não há backend.** `artifacts/api-server` só tem um `/healthz` e `lib/db` não
  define tabelas nenhumas — são andaimes do template do Replit, não são usados.
  A base de dados Postgres do projeto está vazia de propósito.
- **Não há IA.** Apesar do nome, o plano sai de regras determinísticas em
  `planner.ts`. Não há chamadas a modelos nem a serviços externos — a app
  funciona offline e nada sai do dispositivo.
- **Vídeos são links de pesquisa no YouTube**, não URLs fixos. URLs fixos
  apontam para vídeos removidos passado uns meses; a pesquisa nunca quebra.
- **CSS próprio, sem biblioteca de componentes.** A app tem uma linguagem visual
  definida (fundo escuro azulado, acento lima) que não vale a pena reconstruir
  em cima de componentes genéricos.
- **O formulário e o motor não falam a mesma língua, de propósito.** O check-in
  recolhe respostas humanas (escalas de 1 a 5 com rótulo, níveis de dor); o
  motor precisa de sinais grosseiros. A tradução está toda em `deriveSignals()`,
  para os dois lados poderem mudar sem se partirem um ao outro.
- **Sinais de alerta não são diagnóstico.** `redFlagsFor()` só reconhece
  situações em que continuar sozinho não é boa ideia (dor ≥ 7/10, dor em
  repouso, dor de semanas a piorar) e recomenda avaliação profissional. A app
  nunca nomeia lesões nem promete que um exercício resolve seja o que for.

## Product

Cinco separadores:

- **Hoje** — check-in diário (jogo previsto, treino de ontem, energia, dor
  muscular, cansaço, sono, zonas com dor, tempo e material disponível) e o plano
  resultante, com o raciocínio e dicas de recuperação por zona.
- **Biblioteca** — os 62 exercícios, com pesquisa e filtro por categoria.
- **Histórico** — calendário mensal com marca por dia (jogo, treino, descanso, dor).
- **Estatísticas** — horas de padel, dias de treino, sequência e gráficos a 30 dias.
- **Definições** — objetivos de treino, exportar/importar backup, apagar dados.

## Gotchas

- **Os dados vivem só no browser do utilizador.** Trocar de telemóvel, limpar os
  dados do Safari, ou o iOS limpar `localStorage` de um site não visitado há
  ~7 dias apaga tudo. As Definições têm exportação manual para backup. Adicionar
  ao ecrã principal (PWA) evita a limpeza automática do iOS.
- **As chaves de data são locais, nunca UTC.** Usar `todayKey()`, `dateKey()` e
  `parseDateKey()` de `src/store/useStore.ts` — nunca `toISOString()` sobre uma
  data local, que no horário de verão recua um dia (era o bug da versão
  anterior), nem `new Date("2026-09-03")`, que é lido como meia-noite UTC.
- **Ao mudar `exercises.ts`, não reutilizar ids antigos com significado novo** —
  `exerciseLastUsed` guarda ids e os planos antigos referenciam-nos.
- **Alterar o formato de `AppData` exige migração**, senão quem já usa a app
  perde o histórico. A chave de `localStorage` é `padel-coach-ai-data`.
  Subir `DATA_VERSION`, acrescentar a conversão em `migrate.ts` e testar com
  dados da versão anterior — a migração corre ao carregar e grava logo.
- **As escalas de energia, cansaço e qualidade do sono são de 1 a 5**; a dor
  muscular e a dor de lesão são de 0 a 10. Misturá-las dá contas erradas na
  prontidão — a conversão está em `deriveSignals()`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
