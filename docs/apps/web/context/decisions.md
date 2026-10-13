# Decisões — apps/web

Valem só dentro de `apps/web`; complementam `docs/context/decisions.md`.

## Stack
- Tipo: web. Framework: Next.js (App Router), TypeScript, ISR; Server Components por padrão.
- Estilização: Tailwind CSS (sem CSS Modules, sem styled-components); tokens do Nocturne via CSS variables, temas claro e escuro.
- Componentes: Nocturne (`packages/ui`) primeiro; Radix UI só para primitivos que o Nocturne não cobre (tooltip do glossário, dialog). Sem MUI, sem Chakra.
- Estado global: nenhum por enquanto (estado de UI local + `searchParams` para filtros refletidos na URL).
- Formulários: nenhuma lib por enquanto (form nativo + Server Action para contato; Zod se surgir necessidade).
- Data fetching: Server Components buscam do BFF; TanStack Query apenas nos componentes client interativos (Placar). Sem SWR.
- Ícones: <!-- a definir -->
- Guias em MDX versionado no repositório.

## Dados
- Dados vêm só do BFF (HTTP); `apps/web` nunca acessa o Postgres nem as fontes oficiais diretamente (CN-004). Exceção temporária: Placar HTML do MVP (POL-004), até a v1.

## Porta
- Desenvolvimento: **3400**. Convenção do projeto: porta padrão do framework + 400.

## Comandos de verificação
- Test: `pnpm --filter @votoaberto/web test`
- Type-check: `pnpm --filter @votoaberto/web type-check`
- Lint: `pnpm --filter @votoaberto/web lint`

## Decisões técnicas do scaffold (T4)
- **Next.js 16.4.0 + React 19.3.**
- **Tailwind CSS 4.3** via `@tailwindcss/postcss`.
- **Testes:** Jest 30 com `next/jest` e ambiente jsdom; React Testing Library 16 e jest-dom 7.
- **tsconfig** estende `nextjs.json` de `packages/config` com `types: [node, jest]`.
- **ESLint** ignora `.next`, `out`, `build` e `next-env.d.ts`.
- **`lang="pt-BR"`** no `<html>` do layout raiz, verificado por grep/curl.

## Packages internos consumidos
- `packages/ui`: design system Nocturne (AppShell, DataTable, StatCard).
- `packages/core`: normalização de votos, partidos e totais (TypeScript puro).
