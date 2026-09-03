# Padel Coach AI

Assistente pessoal de preparação física para padel: um check-in diário sobre o
estado do corpo gera automaticamente o plano de treino do dia, com os exercícios
escolhidos e a explicação de porque foram escolhidos.

## Run & Operate

- `pnpm --filter @workspace/padel-coach run dev` — correr a app (porta 25005)
- `pnpm --filter @workspace/padel-coach run build` — build de produção
- `pnpm --filter @workspace/padel-coach run test` — testes ao motor e aos dados
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
| `src/data/exercises.ts` | Porta de entrada dos dados: categorias, zonas de dor, equipamento, objetivos, escalas e dicas |
| `src/data/library/` | **Fonte de verdade** dos 92 exercícios, por família (mobilidade, força, core, explosão/agilidade, prevenção, recuperação) |
| `src/data/types.ts` | O que um exercício tem: execução, erros comuns, benefícios, cuidados, alternativas |
| `src/data/zones.ts` | Programas por zona do corpo e os sinais de alerta da página de dores |
| `src/data/profile.ts` | Perfil de quem usa a app e as opções dos seus campos |
| `src/pwa.ts` | Registo do service worker e deteção de app instalada |
| `src/**/*.test.ts` | Testes. Correm com `pnpm test` — sem dependências novas, via `tsx` e o test runner do Node |
| `public/sw.js` | Service worker: a app abre sem rede |
| `src/engine/checkin.ts` | Formato do check-in e os **sinais** que dele se derivam (prontidão, cansaço, sinais de alerta) |
| `src/engine/planner.ts` | **Motor de decisão**: recebe o check-in e devolve o plano do dia |
| `src/engine/session.ts` | O treino a decorrer: onde vai, substituições, alternativas |
| `src/engine/progression.ts` | Progressão gradual: quando um exercício sobe de degrau e o que muda |
| `src/store/useStore.ts` | Estado + leitura/escrita em `localStorage` |
| `src/store/migrate.ts` | Conversão de dados gravados por versões anteriores do formato |
| `src/tabs/` | Os cinco separadores (Hoje, Exercícios, Dores, Histórico, Perfil) |
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
- **Antes de mexer no motor, corre `pnpm test`.** As regras já são muitas e as
  garantias que interessam — nunca sair carga num dia vermelho, nunca sugerir
  material que não se tem, nunca devolver plano vazio — são testadas contra
  centenas de combinações de respostas, não contra três casos escolhidos à mão.
  Uma regra nova que pareça inofensiva pode partir uma delas.
- **O semáforo manda no plano.** `computeStatus()` decide verde/amarelo/vermelho
  e o motor obedece: vermelho nunca produz carga, amarelo corta saltos, sprints
  e explosão mas mantém força moderada. Regras novas devem entrar dentro do
  estado a que pertencem, não ao lado dele — senão volta a ser possível sair um
  treino pesado num dia mau.
- **A barra tem cinco separadores e não deve crescer.** Ao sexto, os rótulos
  deixam de caber num telemóvel. As estatísticas foram para dentro do Histórico
  precisamente por isso.
- **A progressão é uma regra, não aprendizagem.** Três conclusões sem problemas
  sobem um degrau; dor faz recuar um. Cada degrau muda uma coisa de cada vez
  (séries, depois descanso), nunca tudo ao mesmo tempo, e as repetições ficam
  de fora porque são texto. Com um check-in por dia não há dados para inferir
  seja o que for — mas há de sobra para contar até três, e isso é honesto,
  explicável e reversível.
- **Sinais de alerta não são diagnóstico.** `redFlagsFor()` só reconhece
  situações em que continuar sozinho não é boa ideia (dor ≥ 7/10, dor em
  repouso, dor de semanas a piorar) e recomenda avaliação profissional. A app
  nunca nomeia lesões nem promete que um exercício resolve seja o que for.

## Product

Cinco separadores:

- **Hoje** — saudação, estado do dia e os números do check-in num relance;
  depois o check-in diário (jogo previsto, sono, energia, cansaço, dores
  musculares, dor por zona com triagem, atividade de ontem, tempo e material) e,
  a partir dele, o **estado do dia** em semáforo 🟢🟡🔴, o plano resultante, o
  raciocínio da escolha e dicas de recuperação por zona. Daí arranca o **treino
  guiado**: um exercício de cada vez, com temporizador de descanso e a opção de
  trocar, facilitar, saltar ou parar quando algo custa ou dói.
- **Biblioteca** — os 92 exercícios, com pesquisa e filtro por categoria. Cada
  ficha tem execução passo a passo, erros comuns, para que serve, cuidados
  quando aplicável, alternativas navegáveis e link de vídeo.
- **Dores** — escolhes uma zona do corpo e vês exercícios geralmente usados
  para mobilidade, fortalecimento e prevenção nessa área, por ordem (primeiro
  soltar, depois fortalecer), com dicas de autocuidado. Os sinais de alerta
  estão sempre visíveis, escolhida ou não uma zona.
- **Histórico** — os últimos sete dias com o estado e o que se fez em cada um,
  calendário mensal, e as estatísticas a 30 dias: horas de padel, tempo de
  treino, sequência, médias de energia, sono e cansaço, dias com dor, e
  gráficos de cada uma dessas séries.
- **Perfil** — nome, idade, altura, peso, nível e frequência de padel, objetivos
  de treino, dias e tempo disponíveis, material e historial de lesões. O tempo e
  o material servem de ponto de partida no check-in diário. Aqui ficam também o
  backup e a limpeza de dados.

A app é instalável (PWA): adicionada ao ecrã principal abre sem barra do browser
e sem rede.

## Gotchas

- **Os dados vivem só no browser do utilizador.** Trocar de telemóvel ou limpar
  os dados do Safari apaga tudo; o Perfil tem exportação manual para backup.
  Fora do ecrã principal, o iOS ainda apaga `localStorage` de sites não visitados
  há ~7 dias — daí o aviso para instalar que aparece no Perfil enquanto a app
  correr dentro do browser.
- **Ao mudar `public/sw.js`, subir `CACHE_VERSION`.** Sem isso, quem tem a versão
  antiga em cache pode nunca chegar à nova.
- **As chaves de data são locais, nunca UTC.** Usar `todayKey()`, `dateKey()` e
  `parseDateKey()` de `src/store/useStore.ts` — nunca `toISOString()` sobre uma
  data local, que no horário de verão recua um dia (era o bug da versão
  anterior), nem `new Date("2026-09-03")`, que é lido como meia-noite UTC.
- **A sessão de treino é persistida de propósito** (`AppData.session`). Um treino
  é interrompido a toda a hora e ter de recomeçar do primeiro exercício é a
  diferença entre usar a app durante o treino e desistir dela.
- **O temporizador de descanso conta pelo relógio, não somando ticks** — o
  telemóvel suspende `setInterval` com o ecrã bloqueado e o descanso sairia
  muito mais longo do que o real.
- **Não reutilizar ids de exercícios com significado novo** — `exerciseLastUsed`
  guarda ids e os planos antigos referenciam-nos. Acrescenta-se um id novo.
- **O texto dos exercícios é informação geral de treino, não clínica.** Os
  campos `cautions` dizem o que evitar e quando parar; nunca nomeiam lesões nem
  prometem que um exercício resolve alguma coisa. Manter esse registo ao
  acrescentar exercícios.
- **Alterar o formato de `AppData` exige migração**, senão quem já usa a app
  perde o histórico. A chave de `localStorage` é `padel-coach-ai-data`.
  Subir `DATA_VERSION`, acrescentar a conversão em `migrate.ts` e testar com
  dados da versão anterior — a migração corre ao carregar e grava logo.
- **As escalas de energia, cansaço e qualidade do sono são de 1 a 5**; a dor
  muscular e a dor de lesão são de 0 a 10. Misturá-las dá contas erradas na
  prontidão — a conversão está em `deriveSignals()`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
