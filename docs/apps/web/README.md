# web

**Tipo:** app (web)
**Propósito:** Site público do VotoAberto: renderiza guias (MDX), glossário, ferramentas (Placar) e fichas de parlamentares e proposições, lendo dados só do BFF.
**Stack:** Next.js (App Router, ISR), TypeScript, Tailwind CSS; componentes do Nocturne (`packages/ui`) com Radix UI de apoio; TanStack Query só nos componentes client interativos.
**Porta de desenvolvimento:** 3400
**Comandos de verificação:** test, type-check, lint `(não configurado)` — definir em POL-001.

Docs locais (specs, decisions, arquitetura): nesta mesma pasta —
`context/`, `architecture/`, `specs/`.
