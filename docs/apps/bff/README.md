# bff

**Tipo:** app (api)
**Propósito:** BFF do VotoAberto: serve ao `web` e à API pública de leitura os dados legislativos lidos do Postgres (votações, parlamentares, proposições, busca), com paginação por cursor, rate limit e OpenAPI.
**Stack:** NestJS, TypeScript, Prisma sobre PostgreSQL; Redis para cache e rate limit; sem auth e sem fila. Ingestão das APIs externas fica no `worker`.
**Porta de desenvolvimento:** 3401
**Comandos de verificação:** test, type-check, lint `(não configurado)` — definir em POL-001.

Docs locais (specs, decisions, arquitetura): nesta mesma pasta —
`context/`, `architecture/`, `specs/`.
