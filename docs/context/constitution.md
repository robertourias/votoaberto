# Constituição

> Princípios arquiteturais **não-negociáveis** deste projeto. Uma Spec que os
> viole não deve ser aprovada; um diff que os viole não deve passar na revisão.
>
> Carregado por **todos** os papéis. Mantenha em ≤ 40 linhas úteis —
> constituição longa não é lida, e o que não é lido não restringe nada.

---

## Divisão de responsabilidade

| Arquivo | Responde |
|---------|----------|
| `constitution.md` | **como o sistema deve ser construído** (estrutura, dependências, testes) |
| `guardrails.md` | **o que é proibido fazer** (comandos, caminhos, segredos, gate) |
| `conventions.md` | **como escrever** (nomes, imports, formatação) |
| `decisions.md` | **o que escolhemos** (libs, ORM, auth) — muda com o tempo |

Constituição muda por decisão deliberada e registrada, não por conveniência de
uma tarefa. Em conflito, `guardrails.md` (segurança) vence a constituição, que
vence convenções, que vencem preferência do agente.

---

## Princípios

Cada princípio recebe ID `CN-XXX` para que Specs e revisões possam citá-lo.

- **CN-001 — Direção das dependências.**
  Clean Architecture. Domínio não importa framework. Dependências apontam para dentro: presentation → application → domain. Infra (Prisma, BullMQ, clientes das APIs oficiais) implementa interfaces do domínio, nunca o contrário. `packages/core` (normalização de votos, partidos e totais) é TypeScript puro, sem Nest, Next ou ORM, e é usado por worker, BFF e front.

- **CN-002 — Testes junto da implementação.**
  Comportamento novo entra com teste no mesmo diff. Bug corrigido entra com teste de regressão que falha sem o fix. Normalização de votos e partidos exige cobertura ≥ 90%; fontes oficiais têm testes de contrato.

- **CN-003 — Rastreabilidade.**
  Toda decisão técnica é rastreável a um arquivo em `docs/`. Decisão implementada e não registrada é dívida, não pragmatismo.

- **CN-004 — Limite de acoplamento.**
  Apps e packages se comunicam só por interface pública (exports do package ou contrato HTTP do BFF); nenhum import atravessa camada interna de outro módulo. `apps/web` nunca acessa o Postgres nem as fontes oficiais diretamente, só o BFF (exceção temporária: Placar HTML do MVP, POL-004, até a v1). `packages/core` não depende de nenhum app.

- **CN-005 — Dado oficial imutável, derivado reproduzível.**
  O dado da fonte é gravado como veio (voto original intacto). Toda métrica derivada (voto normalizado, fidelidade, presença, concordância) é função pura em `packages/core`, com teste e fórmula publicada, e recalculável a partir do dado bruto.

---

## Como é usado

| Papel | Uso |
|-------|-----|
| `planner` | Spec que exija violar um `CN-XXX` **não é planejada** — escale ao humano antes |
| `backend` / `frontend` | Implementação que precise violar um `CN-XXX` → pare e reporte, não contorne |
| `reviewer` | Violação de `CN-XXX` é 🔴 BLOCKER no Estágio 1 |

## Como mudar

Princípio que atrapalha toda tarefa está errado — mas a saída é **emendar a
constituição** deliberadamente, com o motivo registrado em `decisions.md`, não
ignorá-lo caso a caso. Exceção pontual não vira precedente: ou o princípio vale,
ou ele muda.
