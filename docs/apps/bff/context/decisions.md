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

## Decisões técnicas do scaffold (T3)
- **NestJS 11.x, não 12:** o 12 é ESM-only e não compila com o tsconfig `node16` de `packages/config`. Migrar exige decisão humana.
- **Testes:** Jest 30 + ts-jest 29.4 com `isolatedModules`; configuração em `jest.config.ts`.
- **TypeScript 5.9.x:** o peer do `packages/config` limita a `<6.1`.
- **`AllExceptionsFilter` (global):** 4xx mantém status e message (array de validação juntado por `"; "`). Todo o resto, inclusive `HttpException` 5xx, vira 500 com `"Erro interno do servidor"`; stack só no log do servidor, nunca na resposta.
- **`PORT` via `process.env`:** sem `@nestjs/config`/`ConfigService` e sem `ValidationPipe`/`class-validator`, por serem novas dependências de runtime; decidir quando surgir o primeiro DTO ou configuração. Valor inválido cai em 3401 com aviso no log.
- **Script `start` extra** (além dos exigidos pela Spec) para rodar o build compilado.
- **`bootstrap.ts` / `configureApp(app)`:** concentra prefixo `api/v1`, filtro global e Swagger (`/api/docs`); usado por `main.ts` e pelo e2e, para o teste exercitar a mesma configuração de produção.

## Comandos de verificação
- Test: (não configurado)
- Type-check: (não configurado)
- Lint: (não configurado)
- Definir em POL-001 e refletir em `docs/context/guardrails.md`.

## Packages internos consumidos
- `packages/core`: normalização de votos, partidos e totais (TypeScript puro).
