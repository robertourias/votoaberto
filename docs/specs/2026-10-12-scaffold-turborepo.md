# Spec & Plan: Scaffold Turborepo (web + bff) com CI

**Status:** approved
**Aprovado por:** Roberto Nicoletti em 2026-10-12
**Data:** 2026-10-12
**Autor:** Claude (planner) — origem: TASK01 / POL-001

---

## 1. Problema e Visão Geral

O repositório só tem documentação e harness: não há `package.json`, apps, lint, testes nem CI. Sem isso, nenhum comando de verificação existe (`docs/context/guardrails.md` seção 1 está `(não configurado)`), os hooks `verify-file`/`verify-project` ficam inertes e os Critérios de Aceite de qualquer tarefa seguinte viram autodeclaração.

Esta Spec cria o esqueleto executável do monorepo: Turborepo com pnpm, `apps/web` (Next.js) e `apps/bff` (NestJS) mínimos, configuração compartilhada em `packages/config`, testes, pre-commit e CI no GitHub Actions. Ao final, `pnpm dev` sobe os dois apps, `pnpm build/lint/type-check/test` passam, e os guardrails passam a apontar comandos reais. Nenhuma funcionalidade de produto entra aqui.

---

## 2. Cenários de Usuário

- **P1 (crítico):** Como desenvolvedor, quero rodar `pnpm dev` e ver `web` (3400) e `bff` (3401) no ar, para começar a construir features.
- **P1 (crítico):** Como desenvolvedor/agente, quero `pnpm type-check`, `pnpm lint`, `pnpm test` e `pnpm build` funcionando na raiz, para provar que o código funciona.
- **P1 (crítico):** Como mantenedor, quero um CI que bloqueie PR com falha de type-check, lint, teste ou build, para proteger a `main`.
- **P2 (importante):** Como desenvolvedor, quero lint e formatação automáticos no commit, para não subir código fora do padrão.
- **P3 (nice-to-have):** Como novo colaborador, quero um README com os comandos reais, para entrar no projeto sem abrir `.claude/`.

---

## 3. Requisitos Funcionais

- **FR-001:** A raiz é um workspace pnpm (`apps/*`, `packages/*`) com Turborepo; `turbo.json` define as tarefas `build`, `dev`, `lint`, `type-check` e `test`; `package.json` raiz expõe scripts de mesmo nome que delegam ao `turbo`; Node (`.nvmrc`) e pnpm (`packageManager`) estão fixados.
- **FR-002:** `packages/config` exporta tsconfig base estrito (`strict: true`), configuração ESLint (flat config) e Prettier compartilhados, consumidos por `web` e `bff`.
- **FR-003:** `apps/bff` é um app NestJS na porta 3401 (`PORT` configurável), com prefixo global `/api/v1`, `GET /api/v1/health` retornando `{ "status": "ok" }`, Swagger em `/api/docs` e filtro global de exceções com shape de resposta consistente.
- **FR-004:** `apps/web` é um app Next.js (App Router, TypeScript, Tailwind CSS) na porta 3400, com página inicial provisória exibindo o nome "VotoAberto" e a tagline do produto.
- **FR-005:** Jest está configurado em `bff` (unitário + e2e com Supertest) e em `web` (Jest + React Testing Library), cada um com testes reais do que o app expõe; `pnpm test` na raiz roda ambos.
- **FR-006:** `pnpm dev` na raiz sobe `web` e `bff` em paralelo nas portas 3400 e 3401.
- **FR-007:** Husky + lint-staged rodam ESLint e Prettier nos arquivos staged no pre-commit; `.gitattributes` e Prettier forçam fim de linha LF.
- **FR-008:** Workflow GitHub Actions `verify.yml` roda em PR e push na `main`: install com lockfile congelado, type-check, lint, test e build.
- **FR-009:** README raiz traz os comandos reais; `docs/context/guardrails.md` seção 1 e as permissões em `.claude/settings.json` passam a usar os comandos reais; `.env.example` documenta `PORT` e a URL do BFF; os `decisions.md` de `web` e `bff` registram os comandos de verificação.

---

## 4. Fora do Escopo & Riscos

- **Fora do Escopo:** `packages/core`, `packages/ui` e `apps/worker` (TASK04, TASK03, TASK05); Dockerfile, Compose, Traefik e deploy (TASK02); Prisma, Postgres, Redis e qualquer lógica de dados; shell Nocturne e design tokens (TASK03); Playwright/E2E de navegador (TASK11); Placar e conteúdo de produto.
- **Premissa:** repositório GitHub remoto existe para o CI rodar (`origin`: robertourias/votoaberto). O registro de `packages/config` na documentação (CN-003) é feito pela T2 (ver Emendas). Versões de Next.js, NestJS e demais dependências são as estáveis atuais, fixadas na instalação e conferidas na documentação oficial (Context7) pelos agentes.
- **Premissa:** o time autoriza, ao aprovar esta Spec, as novas dependências de runtime/dev do scaffold (gatilho de escalação do guardrails: nova dependência).
- **Risco:** desenvolvimento em Windows gera CRLF e quebra Prettier/lint no CI (Linux) → Mitigação: `.gitattributes` com `eol=lf`, `endOfLine: "lf"` no Prettier e critério de CI verde.
- **Risco:** duas tarefas rodando `pnpm install` em paralelo corrompem lockfile e `node_modules` → Mitigação: instalações serializadas por onda (ver plano; `web` e `bff` não são paralelos).
- **Risco:** hooks `verify-file`/`verify-project` passam a ser ativados e podem barrar edições → Mitigação: T6 valida que o projeto está verde antes de fechar a Spec.
- **Risco:** Jest com Next.js/TypeScript e Nest tem pegadinhas de ESM/paths → Mitigação: usar os presets oficiais (`next/jest`, `ts-jest`) e manter só testes de fumaça reais.

---

## 5. Contratos de API (Se aplicável)

- `GET /api/v1/health`
  - **Request:** sem corpo.
  - **Response:** `200 {"status":"ok"}`.
- `GET /api/docs`
  - **Response:** UI do Swagger (OpenAPI do BFF; o JSON em `/api/docs-json`).
- **Shape de erro (filtro global):** `{ "statusCode": number, "error": string, "message": string, "path": string, "timestamp": string (ISO 8601) }`. Erro inesperado devolve `500` com `message` genérica, sem stack trace.

---

## 6. Plano de Implementação (Tarefas)

Estrutura do BFF segue a CN-001: código HTTP em `src/presentation/`; camadas `domain/`, `application/` e `infrastructure/` são criadas pelas features que precisam delas (nenhuma regra de negócio entra aqui).

### Ordem de Execução & Dependências

`web` e `bff` não são paralelos de propósito: ambos alteram `pnpm-lock.yaml` e `node_modules` na mesma working tree.

| Onda | Tarefas (paralelas) | Pré-requisito |
|------|---------------------|---------------|
| 1    | T1                  | —             |
| 2    | T2                  | T1            |
| 3    | T3                  | T2            |
| 4    | T4                  | T3            |
| 5    | T5, T6              | T4            |
| 6    | T7                  | T5, T6        |

### Tarefa 1: Raiz do workspace
- **Tipo:** chore
- **Agente:** backend
- **Depende de:** — (nenhuma)
- **Paralelizável com:** nenhuma
- **Arquivos:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.gitattributes`, `.nvmrc`, `.env.example`, `pnpm-lock.yaml`
- **Cobre:** FR-001, FR-007 (LF), FR-009 (`.env.example`), CN-003
- **Descrição:** Cria o workspace pnpm + Turborepo (nome `votoaberto`, `private: true`), fixa `packageManager` e Node LTS, define os scripts raiz (`dev`, `build`, `lint`, `type-check`, `test`) delegando ao `turbo`, `.gitignore` (node_modules, `.next`, `dist`, `.turbo`, `.env*` exceto `.env.example`, coverage), `.gitattributes` com `* text=auto eol=lf`, e `.env.example` com `PORT` do BFF (3401) e `NEXT_PUBLIC_BFF_URL`/`BFF_URL` (http://localhost:3401). Não toca `.claude/` nem `docs/`.
- **Critérios de Aceite:**
  - [ ] Dado o repositório limpo, quando rodo `pnpm install`, então conclui sem erro e gera `pnpm-lock.yaml`. — cobre FR-001, verificado por `pnpm install`
  - [ ] Dado `turbo.json`, quando rodo `pnpm exec turbo run build --dry=json`, então lista as tarefas `build`, `dev`, `lint`, `type-check` e `test` configuradas. — cobre FR-001, verificado por `pnpm exec turbo run build --dry=json`
  - [ ] Dado `.gitignore`, quando crio `.env` e `.env.example`, então `git check-ignore .env` retorna o caminho e `git check-ignore .env.example` não retorna nada. — cobre FR-009, verificado por `git check-ignore -v .env .env.example`
  - [ ] Dado `.gitattributes`, quando consulto `git check-attr eol package.json`, então retorna `eol: lf`. — cobre FR-007, verificado por `git check-attr eol package.json`

### Tarefa 2: packages/config
- **Tipo:** chore
- **Agente:** backend
- **Depende de:** T1
- **Paralelizável com:** nenhuma
- **Arquivos:** `packages/config/package.json`, `packages/config/tsconfig/base.json`, `packages/config/tsconfig/nestjs.json`, `packages/config/tsconfig/nextjs.json`, `packages/config/eslint/base.mjs`, `packages/config/eslint/nestjs.mjs`, `packages/config/eslint/nextjs.mjs`, `packages/config/prettier/index.mjs`, `.prettierignore`, `pnpm-lock.yaml`, `docs/architecture/overview.md`, `docs/packages/config/README.md`
- **Cobre:** FR-002, FR-007 (Prettier LF), CN-003, CN-004
- **Descrição:** Package `@votoaberto/config` (privado) exportando tsconfigs (base estrito `strict: true`, variantes Nest e Next), ESLint flat config (TypeScript, regra de não desabilitar sem justificativa, base + Nest + Next) e Prettier (`endOfLine: "lf"`). Só configuração; sem código de produto e sem depender de nenhum app (CN-004). Registra o package (CN-003): linha em "Projetos do Monorepo" de `docs/architecture/overview.md` (`packages/config` | package compartilhado | tsconfig, ESLint e Prettier compartilhados | `docs/packages/config/README.md`) e `docs/packages/config/README.md` pelo template mínimo de `conventions.md`.
- **Critérios de Aceite:**
  - [ ] Dado o package, quando rodo `pnpm --filter @votoaberto/config exec prettier --check .`, então não há arquivo fora do padrão. — cobre FR-002, verificado por esse comando
  - [ ] Dado `tsconfig/base.json`, quando inspeciono, então contém `"strict": true`. — cobre FR-002, verificado por `grep -n '"strict": true' packages/config/tsconfig/base.json`
  - [ ] Dado o Prettier compartilhado, quando consulto a config, então `endOfLine` é `lf`. — cobre FR-007, verificado por `pnpm --filter @votoaberto/config exec prettier --find-config-path packages/config/prettier/index.mjs` e leitura do arquivo
  - [ ] Dado o registro do package, quando leio `docs/architecture/overview.md`, então a tabela "Projetos do Monorepo" tem a linha de `packages/config` e `docs/packages/config/README.md` existe. — cobre CN-003, verificado por `grep -n "packages/config" docs/architecture/overview.md` e `ls docs/packages/config/README.md`
  - [ ] Dado `packages/config/package.json`, quando listo dependências, então não referencia `apps/*`. — cobre CN-004, verificado por `grep -c "apps/" packages/config/package.json` retornando 0

### Tarefa 3: apps/bff (NestJS)
- **Tipo:** feature
- **Agente:** backend
- **Depende de:** T2
- **Paralelizável com:** nenhuma
- **Arquivos:** `apps/bff/package.json`, `apps/bff/tsconfig.json`, `apps/bff/tsconfig.build.json`, `apps/bff/nest-cli.json`, `apps/bff/eslint.config.mjs`, `apps/bff/jest.config.ts`, `apps/bff/test/jest-e2e.json`, `apps/bff/src/main.ts`, `apps/bff/src/app.module.ts`, `apps/bff/src/presentation/health/health.controller.ts`, `apps/bff/src/presentation/health/health.controller.spec.ts`, `apps/bff/src/presentation/filters/all-exceptions.filter.ts`, `apps/bff/src/presentation/filters/all-exceptions.filter.spec.ts`, `apps/bff/test/health.e2e-spec.ts`, `pnpm-lock.yaml`
- **Cobre:** FR-003, FR-005, FR-006 (porta), CN-001, CN-002
- **Descrição:** App NestJS `@votoaberto/bff` consumindo `@votoaberto/config`. `main.ts`: `PORT` (default 3401), `setGlobalPrefix('api/v1')`, Swagger em `/api/docs`, `AllExceptionsFilter` global. `HealthController` com `GET /health`. Scripts `dev`, `build`, `lint`, `type-check`, `test`, `test:e2e`. Testes escritos junto (CN-002). Sem banco, Redis, fila ou auth.
- **Critérios de Aceite:**
  - [ ] Dado o BFF no ar, quando chamo `GET /api/v1/health`, então recebe `200` e `{"status":"ok"}`. — cobre FR-003, verificado por `pnpm --filter @votoaberto/bff test:e2e` (`apps/bff/test/health.e2e-spec.ts`)
  - [ ] Dado uma rota inexistente, quando chamo `GET /api/v1/nao-existe`, então recebe `404` com o shape `{statusCode,error,message,path,timestamp}`. — cobre FR-003, verificado por `apps/bff/test/health.e2e-spec.ts`
  - [ ] Dado uma exceção não tratada no handler, quando o filtro a captura, então responde `500` com `message` genérica e sem stack trace. — cobre FR-003, verificado por `apps/bff/src/presentation/filters/all-exceptions.filter.spec.ts`
  - [ ] Dado o BFF no ar, quando abro `GET /api/docs`, então responde `200` com a UI do Swagger. — cobre FR-003, verificado por `apps/bff/test/health.e2e-spec.ts`
  - [ ] Dado `PORT` ausente, quando subo o app, então escuta em 3401. — cobre FR-003, verificado por `pnpm --filter @votoaberto/bff dev` e `curl -s localhost:3401/api/v1/health`
  - [ ] Dado o app, quando rodo `pnpm --filter @votoaberto/bff type-check`, `lint`, `test` e `build`, então todos passam. — cobre FR-005, verificado por esses comandos

### Tarefa 4: apps/web (Next.js)
- **Tipo:** feature
- **Agente:** frontend
- **Depende de:** T3
- **Paralelizável com:** nenhuma
- **Arquivos:** `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/eslint.config.mjs`, `apps/web/postcss.config.mjs`, `apps/web/jest.config.ts`, `apps/web/jest.setup.ts`, `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`, `apps/web/src/app/page.test.tsx`, `pnpm-lock.yaml`
- **Cobre:** FR-004, FR-005, FR-006 (porta), CN-002
- **Descrição:** App Next.js `@votoaberto/web` (App Router, TypeScript, Tailwind CSS, Server Components por padrão) consumindo `@votoaberto/config`. Scripts `dev` (`next dev -p 3400`), `build`, `start`, `lint`, `type-check`, `test`. Página inicial provisória com `<h1>` "VotoAberto" e a tagline do produto; `<html lang="pt-BR">`. Jest via `next/jest` + React Testing Library. Sem design tokens, Nocturne nem fetch ao BFF.
- **Critérios de Aceite:**
  - [ ] Dado a página inicial renderizada, quando consulto o DOM, então há um `h1` "VotoAberto" e a tagline "Entenda como o poder funciona no Brasil e veja, com dados oficiais, o que cada parlamentar fez.". — cobre FR-004, verificado por `apps/web/src/app/page.test.tsx`
  - [ ] Dado o layout, quando inspeciono, então `<html>` tem `lang="pt-BR"`. — cobre FR-004, verificado por `apps/web/src/app/page.test.tsx` ou `grep -n 'lang="pt-BR"' apps/web/src/app/layout.tsx`
  - [ ] Dado o app em dev, quando subo `pnpm --filter @votoaberto/web dev`, então `curl -s localhost:3400` retorna `200` com "VotoAberto". — cobre FR-004, verificado por esse comando
  - [ ] Dado o app, quando rodo `pnpm --filter @votoaberto/web type-check`, `lint`, `test` e `build`, então todos passam. — cobre FR-005, verificado por esses comandos
  - [ ] Dado `apps/web`, quando listo dependências, então não importa nada de `apps/bff`. — cobre CN-004, verificado por `grep -rn "apps/bff\|@votoaberto/bff" apps/web --include=*.ts --include=*.tsx --include=package.json` sem resultado

### Tarefa 5: Pre-commit (Husky + lint-staged)
- **Tipo:** chore
- **Agente:** backend
- **Depende de:** T4
- **Paralelizável com:** T6
- **Arquivos:** `.husky/pre-commit`, `lint-staged.config.mjs`, `package.json`, `pnpm-lock.yaml`
- **Cobre:** FR-007
- **Descrição:** Instala Husky e lint-staged; script `prepare` em `package.json`; `pre-commit` roda `lint-staged`, que aplica ESLint (`--fix`, `--max-warnings=0`) e Prettier (`--write`) nos arquivos staged de `apps/**` e `packages/**`. Hooks não podem ser pulados (`--no-verify` é proibido pelo guardrails).
- **Critérios de Aceite:**
  - [ ] Dado um arquivo `.ts` staged com erro de lint, quando tento `git commit`, então o commit é bloqueado e o erro aparece. — cobre FR-007, verificado por teste manual descrito na seção 8 (arquivo descartável, depois revertido)
  - [ ] Dado um arquivo staged mal formatado, quando faço `git commit`, então o Prettier o reescreve. — cobre FR-007, verificado por teste manual descrito na seção 8
  - [ ] Dado `lint-staged.config.mjs`, quando rodo `pnpm exec lint-staged --help`, então o binário resolve sem erro. — cobre FR-007, verificado por `pnpm exec lint-staged --help`

### Tarefa 6: CI e documentação/guardrails
- **Tipo:** chore
- **Agente:** backend
- **Depende de:** T4
- **Paralelizável com:** T5
- **Arquivos:** `.github/workflows/verify.yml`, `README.md`, `docs/context/guardrails.md`, `.claude/settings.json`, `docs/apps/web/context/decisions.md`, `docs/apps/bff/context/decisions.md`
- **Cobre:** FR-008, FR-009, CN-003
- **Descrição:** Monta `verify.yml` a partir de `.claude/templates/ci/verify.yml`: pnpm (`pnpm/action-setup`, `cache: pnpm`, `pnpm install --frozen-lockfile`), `node-version-file: .nvmrc`, passos `type-check`, `lint`, `test` e `build` com os comandos reais, branch `main`. Atualiza o README (Quick Start com os comandos reais), `guardrails.md` seção 1 (remove `(não configurado)` e o aviso de projeto sem código), `settings.json` (`permissions.allow` com `pnpm type-check/lint/test/build/dev`), e a seção "Comandos de verificação" dos `decisions.md` de `web` e `bff`. `.github/workflows/` e `.claude/settings.json` estão em `ask`: o agente deve pedir confirmação antes de editar.
- **Critérios de Aceite:**
  - [ ] Dado `verify.yml`, quando valido a sintaxe, então é YAML válido e referencia `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm lint`, `pnpm test` e `pnpm build`. — cobre FR-008, verificado por `node -e "require('node:fs').readFileSync('.github/workflows/verify.yml','utf8')"` e `grep -c "pnpm" .github/workflows/verify.yml`
  - [ ] Dado um PR com a Spec implementada, quando o workflow `verify` roda no GitHub, então termina verde. — cobre FR-008, verificado por `gh run list --workflow=verify.yml` (ou pelo check do PR)
  - [ ] Dado `guardrails.md`, quando leio a seção 1, então Type-check, Lint, Testes e Build têm comandos reais e nenhum `(não configurado)`. — cobre FR-009, verificado por `grep -c "não configurado" docs/context/guardrails.md` retornando 0 na seção 1
  - [ ] Dado `settings.json`, quando valido, então é JSON válido e `permissions.allow` contém os comandos `pnpm` de verificação. — cobre FR-009, verificado por `node -e "JSON.parse(require('node:fs').readFileSync('.claude/settings.json','utf8'))"`
  - [ ] Dado o README, quando leio o Quick Start, então os comandos listados existem como scripts em `package.json`. — cobre FR-009, verificado por `grep -n "pnpm" README.md` conferido contra `package.json`

### Tarefa 7: Validação integrada
- **Tipo:** chore
- **Agente:** ambos
- **Depende de:** T5, T6
- **Paralelizável com:** nenhuma
- **Arquivos:** — (não altera arquivos; só executa e reporta)
- **Cobre:** FR-001, FR-006, FR-008
- **Descrição:** A partir de um clone limpo (ou `git clean` seguro de artefatos, sem tocar rastreados), roda toda a verificação da raiz e sobe os dois apps juntos. Qualquer falha volta para a tarefa dona do arquivo.
- **Critérios de Aceite:**
  - [ ] Dado a raiz, quando rodo `pnpm install --frozen-lockfile`, `pnpm type-check`, `pnpm lint`, `pnpm test` e `pnpm build`, então todos terminam com código 0. — cobre FR-001, verificado por esses comandos
  - [ ] Dado a raiz, quando rodo `pnpm dev`, então `curl -s localhost:3401/api/v1/health` devolve `{"status":"ok"}` e `curl -s -o /dev/null -w "%{http_code}" localhost:3400` devolve `200`. — cobre FR-006, verificado por esses comandos
  - [ ] Dado o PR aberto, quando o CI termina, então o check `verify` está verde. — cobre FR-008, verificado por `gh pr checks`

---

## 7. Rastreabilidade

| FR | Coberto por | Verificado por |
|----|-------------|-----------------|
| FR-001 | T1, T7 | `pnpm install`, `pnpm exec turbo run build --dry=json`, validação integrada |
| FR-002 | T2 | `prettier --check` em `packages/config`, `grep '"strict": true'` |
| FR-003 | T3 | `apps/bff/test/health.e2e-spec.ts`, `all-exceptions.filter.spec.ts` |
| FR-004 | T4 | `apps/web/src/app/page.test.tsx` |
| FR-005 | T3, T4 | `pnpm --filter ... test` em cada app, `pnpm test` na raiz |
| FR-006 | T3, T4, T7 | `curl` em 3400 e 3401 com `pnpm dev` |
| FR-007 | T1, T2, T5 | `git check-attr eol`, Prettier `endOfLine`, teste manual do pre-commit |
| FR-008 | T6, T7 | `verify.yml` verde no PR (`gh pr checks`) |
| FR-009 | T1, T6 | `git check-ignore`, `grep` em `guardrails.md`, `settings.json` válido |

---

## 8. Verificação

Estado atual de `docs/context/guardrails.md` seção 1: **todos os comandos `(não configurado)`**. Enquanto T6 não terminar, os Critérios de Aceite de T1 a T5 são verificados pelos comandos específicos listados em cada critério (que passam a existir ao longo das tarefas), não pelos comandos de guardrails. A partir de T6 valem os comandos abaixo.

| O quê | Comando | Saída esperada |
|-------|---------|----------------|
| Type-check | `pnpm type-check` | sem erros |
| Lint | `pnpm lint` | sem erros nem warnings |
| Testes | `pnpm test` | todos passando, incluindo `health.e2e-spec`, `all-exceptions.filter.spec` e `page.test` |
| Build | `pnpm build` | `web` e `bff` compilam |
| Manual (pre-commit) | em arquivo descartável: introduzir erro de lint em `apps/bff/src/tmp.ts`, `git add` e `git commit -m test`; depois um arquivo mal formatado; reverter tudo (`git reset`, remover o arquivo) | commit bloqueado com a mensagem do ESLint; Prettier reescreve o arquivo mal formatado |
| Manual (dev) | `pnpm dev` e abrir `http://localhost:3400` e `http://localhost:3401/api/docs` | página "VotoAberto"; Swagger carregado |

> Nenhum Critério de Aceite é marcado `[x]` sem a saída real destes comandos
> na conversa. Ver `docs/context/guardrails.md`, seção 1.

---

## Notas de Review

<!-- Preenchido pelo /hands-on: achados 🟢/💡 da review por onda e da final,
no formato `- [onda N] arquivo:linha — texto`. Não é normativo. -->

---

## Emendas

<!-- Mudança normativa depois da aprovação (FR, tarefa, contrato, critério).
Formato: `- YYYY-MM-DD — <o que mudou> — <por quê> — <quem>`.
FR novo ou removido não é emenda: pare e escale ao humano. -->

- 2026-10-12 — T2 passa a registrar `packages/config` (linha em `overview.md` e `docs/packages/config/README.md`), com arquivos e critério novos; premissa de `/init-package config` prévio removida — `/hands-on` iniciado sem o registro; humano escolheu registrar dentro da T2 — Roberto Nicoletti

---

<!-- 
GATE DE APROVAÇÃO
Revise as regras de negócio e as tarefas técnicas.
Se tudo estiver correto, rode `/approve` com o caminho desta Spec para liberar a implementação (ou altere o Status para approved no editor).
-->
