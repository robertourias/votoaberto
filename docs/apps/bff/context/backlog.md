# Backlog — bff

> Gerado por `/backlog` em 2026-10-12. Tarefas que tocam apenas este projeto.
> Tarefas cross-project ficam em `docs/context/product-backlog.md`.
> Use `/spec apps/bff BFF-TASKXX` para gerar a especificação.

## Legenda de Status

| Status | Significado |
|--------|-------------|
| backlog | Aguardando especificação |
| spec-review | Spec + Tarefas geradas, aguardando aprovação humana |
| spec-approved | Spec aprovada, pronta para implementação |
| in-progress | Em implementação |
| done | Concluída |

---

## Fase 2 — Core

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| BFF-TASK01 | Endpoints de leitura do BFF | POL-018. Votações, parlamentares, proposições e busca com detalhe por id; paginação por cursor; OpenAPI; p95 abaixo de 300 ms. | backlog | TASK06, TASK07 | — |

## Fase 4 — Polimento

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| BFF-TASK02 | API pública de leitura | POL-028. Rate limit de 60 req/min por IP e página /api com exemplos. | backlog | BFF-TASK01 | — |
