# config

**Tipo:** package compartilhado
**Propósito:** tsconfig, ESLint (flat config) e Prettier compartilhados por `apps/web` e `apps/bff` (`@votoaberto/config`, privado, só configuração).
**Stack:** ESLint 9 flat config + typescript-eslint; `eslint-config-next` para o preset Next (exige `next` instalado no app consumidor); Prettier com `endOfLine: "lf"`.

Docs locais (specs, decisions, arquitetura): nesta mesma pasta —
`context/`, `architecture/`, `specs/`.
