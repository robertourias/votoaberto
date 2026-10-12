# Backlog — web

> Gerado por `/backlog` em 2026-10-12. Tarefas que tocam apenas este projeto.
> Tarefas cross-project ficam em `docs/context/product-backlog.md`.
> Use `/spec apps/web WEB-TASKXX` para gerar a especificação.

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

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| WEB-TASK01 | Publicar o Placar HTML | POL-004. placar-congresso.html em /ferramentas/placar dentro do layout; busca "PEC 14/2021" traz as duas Casas; CSV baixa. | backlog | TASK03 | — |
| WEB-TASK02 | Pipeline de guias em MDX | POL-005. Rota /guias/[slug], frontmatter (título, resumo, termos, atualizado em, fontes), índice, sitemap. | backlog | TASK03 | — |
| WEB-TASK03 | Glossário e tooltip | POL-006. /glossario com ≥ 40 termos, âncora por termo e componente de tooltip. | backlog | WEB-TASK02 | — |
| WEB-TASK04 | Escrever 6 guias | POL-007. Três Poderes; cargos e mandatos; como uma lei é feita; tipos de proposição; como funciona uma votação; sistema eleitoral. Checklist de neutralidade. | backlog | WEB-TASK02 | — |
| WEB-TASK05 | Página Sobre os dados | POL-008. Fontes com link, frequência, limites, método dos cálculos e contato para correções. | backlog | TASK03 | — |

## Fase 4 — Polimento

| ID | Título | Descrição | Status | Dependências | Spec |
|----|--------|-----------|--------|--------------|------|
| WEB-TASK06 | SEO base | POL-009. Metadados, Open Graph, sitemap.xml, robots.txt e dados estruturados nos guias. | backlog | WEB-TASK02 | — |
