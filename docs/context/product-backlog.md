# Product Backlog

> Gerado por `/backlog` em 2026-10-12. Fonte: `docs/context/product.md` e `docs/Plataforma de Consulta Política — Descritivo e Backlog.md` (POL-001..037).
> Contém apenas tarefas cross-cutting, que tocam 2+ projetos, ou de projetos ainda não registrados (`worker`, `core`, `ui`).
> Tarefas de um único projeto vivem em `docs/apps/<nome>/context/backlog.md`
> ou `docs/packages/<nome>/context/backlog.md`.
> Use `/spec TASKXX` para gerar a especificação de cada tarefa.

## Legenda de Status

| Status | Significado |
|--------|-------------|
| backlog | Aguardando especificação |
| spec-review | Spec + Tarefas geradas, aguardando aprovação humana |
| spec-approved | Spec aprovada, pronta para implementação |
| in-progress | Em implementação |
| done | Concluída |

---

## Fase 1 — Fundação

| ID | Título | Descrição | Projetos | Status | Dependências | Spec |
|----|--------|-----------|----------|--------|---------------|------|
| TASK01 | Scaffold Turborepo (web + bff) com CI | POL-001. Cria apps web e bff no Turborepo; CI com type-check, lint, test e build; README com comandos; preenche os comandos de verificação em guardrails.md. | web, bff | spec-approved | — | `docs/specs/2026-10-12-scaffold-turborepo.md` |
| TASK02 | Ambiente na VPS | POL-002. Compose em /opt/docker/votoaberto/, Traefik, subdomínio, schema no Postgres central, deploy automático na main, HTTPS, healthcheck no Uptime Kuma. | web, bff | backlog | TASK01 | — |
| TASK03 | Shell do site com Nocturne | POL-003. Cabeçalho, menu dos módulos, rodapé com fontes, tema claro e escuro; navegável por teclado; sem rolagem lateral em 360 px. | web, ui | backlog | TASK01 | — |
| TASK04 | Pacote core de normalização | POL-017. Normalização de votos, partidos e totais em TypeScript puro; cobertura ≥ 90%; usado por worker, BFF e web. | core | backlog | TASK01 | — |
| TASK05 | Worker de ingestão com BullMQ | POL-011. Jobs, agenda, retry com backoff e tabela de execuções; falha de uma fonte não bloqueia as outras. | worker | backlog | TASK01, TASK02 | — |

## Fase 2 — Core

| ID | Título | Descrição | Projetos | Status | Dependências | Spec |
|----|--------|-----------|----------|--------|---------------|------|
| TASK06 | Sincronizar parlamentares e partidos | POL-012. Deputados, senadores, mandatos, partidos e filiações; siglas normalizadas. | worker | backlog | TASK04, TASK05 | — |
| TASK07 | Sincronizar votações da Câmara | POL-013. Votações de plenário, votos e orientações em janelas de 3 meses, sem cabeçalho Accept. | worker | backlog | TASK06 | — |
| TASK08 | Sincronizar votações do Senado | POL-014. Votações e votos via /votacao; votações secretas só com totais. | worker | backlog | TASK06 | — |
| TASK09 | Sincronizar proposições | POL-015. Proposições votadas, autorias e tramitação nas duas Casas. | worker | backlog | TASK07, TASK08 | — |
| TASK10 | Carga histórica | POL-016. Carga desde a 57ª legislatura pelos arquivos em lote; script idempotente. | worker | backlog | TASK09 | — |
| TASK11 | Placar em Next.js lendo do BFF | POL-019. Mesma interface do HTML; primeira carga abaixo de 2 s; teste Playwright do fluxo principal. | web, bff, core | backlog | TASK03, BFF-TASK01 | — |
| TASK12 | Página indexável por votação | POL-020. Rota /votacoes/[casa]/[id] com título e descrição de proposição, data e resultado. | web, bff | backlog | TASK11 | — |
| TASK13 | Lista de parlamentares | POL-021. Filtros por Casa, partido, UF e exercício, refletidos na URL. | web, bff | backlog | TASK06, BFF-TASK01 | — |
| TASK14 | Perfil do parlamentar | POL-022. Mandato, partido atual e histórico, votos recentes paginados, proposições de autoria, link oficial. | web, bff | backlog | TASK13, TASK07 | — |
| TASK15 | Como votou meu parlamentar | POL-023. Votos por tema e período, busca por nome com ou sem acento, exporta CSV. | web, bff | backlog | TASK14 | — |
| TASK16 | Busca de proposições | POL-024. Busca por tema, tipo, número, ano, autor, situação e Casa. | web, bff | backlog | TASK09, BFF-TASK01 | — |
| TASK17 | Ficha da proposição | POL-025. Ementa, autores, tramitação cronológica, votações com placar resumido, link para o texto. | web, bff | backlog | TASK16 | — |
| TASK18 | Busca global | POL-026. Full-text do Postgres em guias, glossário, proposições, parlamentares e votações, agrupada por tipo. | web, bff | backlog | TASK16, WEB-TASK02 | — |

## Fase 3 — Complementar

| ID | Título | Descrição | Projetos | Status | Dependências | Spec |
|----|--------|-----------|----------|--------|---------------|------|
| TASK19 | Ingestão de normas | POL-029. Normas federais via LexML ligadas à proposição de origem. | worker | backlog | TASK09 | — |
| TASK20 | Ficha da norma | POL-030. Link para o texto consolidado no Planalto; verificação semanal de links quebrados. | web, bff | backlog | TASK19 | — |
| TASK21 | Formato de eventos históricos | POL-031. Eventos em arquivos versionados; evento sem fonte quebra o build. | web | backlog | TASK03 | — |
| TASK22 | Páginas da linha do tempo | POL-032. Presidentes desde 1889, constituições e emendas à Constituição de 1988, navegação por década. | web | backlog | TASK21 | — |
| TASK23 | Comparador de parlamentares | POL-033. Concordância de votos entre dois ou mais parlamentares; fórmula publicada em Sobre os dados. | web, bff, core | backlog | TASK14 | — |
| TASK24 | Fidelidade partidária e presença | POL-034. Cálculo documentado por parlamentar e por partido, período selecionável. | web, bff, core | backlog | TASK14 | — |
| TASK25 | Votações de comissões | POL-035. Inclui votações de comissões no Placar com filtro por órgão. | worker, web, bff | backlog | TASK11 | — |
| TASK26 | Dados do TSE | POL-036. Candidatos e resultados por eleição; perfil mostra votos recebidos. | worker, web, bff | backlog | TASK14 | — |
| TASK27 | Alertas por e-mail | POL-037. Acompanhar proposição ou parlamentar; decisão sobre contas de usuário registrada antes de implementar. | web, bff, worker | backlog | TASK14 | — |

## Fase 4 — Polimento

| ID | Título | Descrição | Projetos | Status | Dependências | Spec |
|----|--------|-----------|----------|--------|---------------|------|
| TASK28 | Analytics sem cookies e privacidade | POL-010. Umami auto-hospedado e política de privacidade; nenhum cookie de terceiros. | web, infra | backlog | TASK02 | — |
| TASK29 | Alerta de sincronização atrasada | POL-027. Alerta quando a sincronização atrasar mais de 2 h em dia de sessão. | worker, infra | backlog | TASK05 | — |
