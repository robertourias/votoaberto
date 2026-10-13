# VotoAberto

> Entenda como o poder funciona no Brasil e veja, com dados oficiais, o que cada parlamentar fez.

Site de consulta política que reúne num só lugar três coisas: **aprender** (guias sobre os Três Poderes, processo legislativo e sistema eleitoral), **consultar** (proposições, normas, votações e parlamentares) e **analisar** (ferramentas interativas, como o Placar do Congresso). Os dados vêm das APIs oficiais da Câmara, do Senado e do TSE, e cada dado exibido aponta para a fonte oficial. O site descreve e mede; não recomenda voto nem classifica parlamentar.

**Estágio:** ideia. Nada está construído ainda; o Placar do Congresso existe apenas como protótipo HTML. O escopo completo e o backlog (POL-001..POL-037) estão em [`docs/Plataforma de Consulta Política — Descritivo e Backlog.md`](docs/Plataforma%20de%20Consulta%20Pol%C3%ADtica%20%E2%80%94%20Descritivo%20e%20Backlog.md).

## Stack

Monorepo Turborepo (detalhe em [`docs/architecture/overview.md`](docs/architecture/overview.md)).

| Camada     | Tecnologia                                               |
| ---------- | -------------------------------------------------------- |
| Frontend   | Next.js (App Router), ISR, guias em MDX                  |
| Backend    | NestJS: BFF + API pública de leitura; worker de ingestão |
| Monorepo   | Turborepo, TypeScript                                    |
| Banco      | PostgreSQL (schema próprio, Postgres central da VPS)     |
| Arquivos   | MinIO (S3-compatível)                                    |
| Hospedagem | VPS própria: Docker Compose, Traefik                     |
| CI/CD      | GitHub Actions (workflow `verify`)                       |

## Quick Start

Requer Node 22+ e pnpm (versão fixada em `packageManager`).

```bash
pnpm install       # instala as dependências do monorepo
pnpm dev           # web em http://localhost:3400 e bff em http://localhost:3401
pnpm build         # build de todos os apps/packages
pnpm lint          # lint
pnpm type-check    # verificação de tipos
pnpm test          # testes
```

Os comandos de verificação também estão registrados em [`docs/context/guardrails.md`](docs/context/guardrails.md).

## Desenvolvimento com IA

Este repositório usa o harness Claude Code em [`.claude/`](.claude/README.md). Toda decisão de produto é rastreável a `docs/`; toda decisão de fluxo, a `.claude/`.

| Comando           | Para quê                                              |
| ----------------- | ----------------------------------------------------- |
| `/spec [TASKXX]`  | Gera Spec + plano técnico em ondas (`Status: review`) |
| `/back [tarefa]`  | Agente backend                                        |
| `/front [tarefa]` | Agente frontend                                       |
| `/review`         | Revisão em dois estágios (funcional e qualidade)      |
| `/checkpoint`     | Grava o resumo da sessão no log do projeto            |
| `/retomar`        | Retoma o último histórico salvo                       |

**Gate de Spec:** nada é implementado sem a Spec em `Status: approved`; só o humano aprova (`/approve`).
