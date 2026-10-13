# Visão Arquitetural

> Atualize sempre que uma decisão arquitetural significativa for tomada.

## Sistema

**Produto**: VotoAberto
**Status**: Desenvolvimento inicial (ideia; nada construído)
**Modo:** monorepo

**Packs de stack:** typescript, nextjs, nestjs, turborepo

## Stack

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Frontend | Next.js (App Router) | ISR para guias e fichas; guias em MDX versionado. Detalhe por app |
| Backend | NestJS | BFF + API pública de leitura; worker de ingestão. Detalhe por app |
| Monorepo | Turborepo | Builds incrementais, pacotes compartilhados |
| ORM | <!-- definido por app: ver /init-app --> | |
| Banco | PostgreSQL | Postgres central da VPS, schema próprio do produto; busca full-text com `unaccent` e dicionário português |
| Auth | <!-- definido por app: ver /init-app --> | Sem contas de usuário no escopo atual |
| Fila | <!-- definido por app: ver /init-app --> | |
| Cache | <!-- definido por app: ver /init-app --> | |
| Armazenamento de arquivos | MinIO (S3-compatível) | Exportações CSV e cargas em lote |
| Hospedagem | VPS própria | Docker Compose em `/opt/docker/votoaberto/`, Traefik, subdomínio de `nico.dev.br` e depois domínio próprio |
| CI/CD | GitHub Actions | CI de verificação + deploy automático a cada push na `main` |
| Observabilidade | Uptime Kuma, Dozzle | Mais tabela de execuções de sincronização |

## Projetos do Monorepo

| Path | Tipo | Propósito | Stack (se diferir da tabela acima) | Docs próprios |
|------|------|-----------|--------------------------------------|---------------|
| `apps/web` | app (web) | Site público: guias, glossário, ferramentas e fichas, lendo só do BFF | Tailwind CSS, Nocturne + Radix, TanStack Query (client); porta 3400 | `docs/apps/web/README.md` |
| `apps/bff` | app (api) | BFF e API pública de leitura sobre o Postgres (cursor, rate limit, OpenAPI) | Prisma, Redis (cache e rate limit); sem auth e sem fila; porta 3401 | `docs/apps/bff/README.md` |
| `packages/config` | package compartilhado | tsconfig, ESLint e Prettier compartilhados | | `docs/packages/config/README.md` |

Cada app/package ganha `docs/apps/[nome]/` (ou `docs/packages/[nome]/`),
com seu `README.md` de índice, criado por `/init-app` e `/init-package`;
`/spec`, `/back` e `/front` criam o que faltar como fallback (ver
`docs/context/conventions.md#documentação-em-monorepo-appspackages`).
`/checkpoint` e `/retomar` operam só na raiz. Toda a documentação gerada fica sob
`docs/` na raiz — nunca dentro de `apps/[nome]/` ou `packages/[nome]/`. O
`README.md` é o resumo (propósito, stack, link); detalhe completo (specs,
decisions, arquitetura) mora nas subpastas de `docs/apps/[nome]/` (ou
`docs/packages/[nome]/`).

Unidades previstas pelo descritivo (ainda não criadas): `apps/web` (Next.js), `apps/bff` (NestJS), worker de ingestão (NestJS + BullMQ), `packages/core` (normalização de votos/partidos/totais, compartilhado por worker e front) e pacote de UI (design system Nocturne).

## Fluxo de dados

```
Fontes oficiais (Câmara, Senado, ...) → Worker de ingestão → PostgreSQL
                                                              ↓
Visitante → Next.js (ISR/RSC) → BFF NestJS (lê só do Postgres)
```

O worker busca as APIs em horários fixos e grava no Postgres; o BFF lê só do Postgres; as páginas não dependem das APIs das Casas em tempo real. No MVP, o Placar publicado como HTML estático chama as APIs direto do navegador (atalho temporário até a v1).

## Bounded Contexts

- **Ingestão**: sincronização das fontes oficiais, normalização e registro de execuções.
- **Legislativo**: parlamentares, mandatos, filiações, partidos, proposições, votações, votos e orientações.
- **Conteúdo editorial**: guias (MDX), glossário e página "Sobre os dados" — fora do banco.
- **Normas e histórico (v2)**: normas e eventos históricos.

## Decisões registradas

| Decisão | Escolha | Data | Justificativa |
|---------|---------|------|---------------|
| Monorepo | Turborepo | — | Builds incrementais, pacotes compartilhados |
| Backend | NestJS | — | DI, modular, TypeScript-first |
| Frontend | Next.js | — | SSR, RSC, edge-ready |
| Arquitetura | Clean Architecture | — | Domínio testável sem dependência de framework |
| Banco | PostgreSQL central da VPS | 2026-10-12 | Já existe, com backup; full-text atende ao MVP |
| Cópia local dos dados | Worker grava no Postgres; BFF só lê dele | 2026-10-12 | Site não depende das APIs das Casas em tempo real |
| Conteúdo dos guias | MDX no repositório | 2026-10-12 | Revisão por PR, sem CMS |
| Hospedagem/CI | VPS + Compose + Traefik; GitHub Actions | 2026-10-12 | Convenção atual da VPS |

## Constraints conhecidos

- APIs oficiais mudam sem aviso (Senado marca endpoints como descontinuados): testes de contrato e alerta de atraso.
- Câmara: janela de datas em `/votacoes` de no máximo 3 meses; cabeçalho `Accept` customizado quebra o CORS. Senado: até 10 req/s.
- Divergência de siglas de partido entre endpoints exige tabela de normalização.
- Decisões em aberto: nome definitivo e domínio; busca só no Postgres vs Meilisearch; revisor dos guias; licença do conteúdo (sugestão CC BY 4.0).
