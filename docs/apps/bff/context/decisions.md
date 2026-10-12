# Decisões — apps/bff

Valem só dentro de `apps/bff`; complementam `docs/context/decisions.md`.

## Stack
- Tipo: api. Framework: NestJS, TypeScript; REST com Swagger/OpenAPI, prefixo `/api/v1/`, paginação por cursor.
- ORM: Prisma. Banco: PostgreSQL (herda o global; schema próprio do produto, full-text com `unaccent` e dicionário português).
- Auth: nenhuma por enquanto (leitura aberta; sem contas de usuário no escopo).
- Fila: nenhuma no BFF. BullMQ roda no `worker`; exportações pesadas, se necessárias, delegam a ele.
- Cache: Redis (compartilhado da VPS), também para o rate limit de 60 req/min por IP. Meta: p95 < 300 ms.

## Escopo
- O BFF só lê do Postgres; não chama as APIs oficiais. A ingestão fica no `worker` (ver `docs/context/decisions.md`, seção Backend).

## Porta
- Desenvolvimento: **3401**. Exceção à regra "porta padrão + 400" (daria 3400, já usada pelo `web`).

## Comandos de verificação
- Test: (não configurado)
- Type-check: (não configurado)
- Lint: (não configurado)
- Definir em POL-001 e refletir em `docs/context/guardrails.md`.

## Packages internos consumidos
- `packages/core`: normalização de votos, partidos e totais (TypeScript puro).
