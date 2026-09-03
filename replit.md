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
| `src/data/exercises.ts` | **Fonte de verdade** dos 62 exercícios, categorias, zonas de dor, equipamento, objetivos e dicas |
| `src/engine/planner.ts` | **Motor de decisão**: recebe o check-in e devolve o plano do dia |
| `src/store/useStore.ts` | Estado + leitura/escrita em `localStorage` |
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
- **`todayKey()` tem um desvio de fuso horário conhecido** (ver comentário em
  `src/store/useStore.ts`): no horário de verão devolve o dia anterior. Todas as
  chaves sofrem o mesmo desvio, por isso a app é coerente, mas as datas
  guardadas estão erradas. Corrigir implica migrar os dados já guardados.
- **Ao mudar `exercises.ts`, não reutilizar ids antigos com significado novo** —
  `exerciseLastUsed` guarda ids e os planos antigos referenciam-nos.
- **Alterar o formato de `AppData` exige migração**, senão quem já usa a app
  perde o histórico. A chave de `localStorage` é `padel-coach-ai-data`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
