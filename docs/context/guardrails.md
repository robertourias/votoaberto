# Guardrails

> Limites que **nenhum agente pode cruzar** neste projeto. Diferente de
> `conventions.md` (como escrever código) e `decisions.md` (o que escolhemos),
> este arquivo diz **o que é proibido** e **o que precisa passar antes de dizer "pronto"**.
>
> Carregado por **todos** os papéis, em **toda** tarefa. Mantenha curto —
> se passar de ~60 linhas, algo aqui é convenção disfarçada de guardrail.

---

## 1. Comandos de verificação (obrigatórios)

Estes comandos definem "pronto". Nenhuma tarefa é concluída — nem checkbox de
Critério de Aceite marcado `[x]` — sem que eles passem, com a saída real colada
na resposta.

| Verificação | Comando | Quando rodar |
|-------------|---------|--------------|
| Type-check | `pnpm type-check` | toda tarefa que toca `.ts`/`.tsx` |
| Lint | `pnpm lint` | toda tarefa que toca código |
| Testes | `pnpm test` | toda tarefa com lógica |
| Build | `pnpm build` | antes de release |

> Se um comando ainda não existe no projeto, escreva `(não configurado)` —
> nunca invente um comando que não roda.

Parte disso é automatizada por `.claude/hooks/` (lint por arquivo editado,
type-check no fim do turno). O hook é a rede de segurança; a tabela acima
continua sendo a definição de "pronto" que o agente precisa satisfazer e
**evidenciar** — testes, em particular, nenhum hook roda por você.

---

## 2. Caminhos protegidos

Nunca editar sem pedido explícito do humano:

- migrations já aplicadas em produção (`**/prisma/migrations/**` ou equivalente, após o 1º deploy)
- `.github/workflows/` (CI e deploy)
- `infra/` e arquivos de deploy da VPS (`docker-compose*.yml`, configuração do Traefik)

Nunca ler, nunca imprimir no chat, nunca commitar:

- `.env` e variantes (exceto `.env.example`)
- chaves privadas (`*.pem`, `*.key`, `id_rsa*`)
- `~/.ssh/**` e credenciais SSH da VPS
- `deploy/**/*.key`
- credenciais do MinIO/S3 (`**/minio*.env`, `**/s3-credentials*`) e `**/secrets/**`

---

## 3. Operações proibidas

Bloqueadas em `.claude/settings.json` (`permissions.deny`) e reafirmadas aqui
porque a lista de permissões não cobre todo caminho possível:

- `git push --force`, `git reset --hard`, `git clean -fd` — destroem trabalho não commitado
- reset/drop de banco fora de ambiente local descartável (ex: `prisma migrate reset`)
- `npm publish` e equivalentes
- desabilitar hook de commit (`--no-verify`) ou regra de lint sem comentário justificando
- `docker compose down`/remoção de volumes na VPS de produção; `docker system prune`
- apagar ou sobrescrever registros de votação já gravados sem reprocessar a partir da fonte oficial

---

## 4. Regras de negócio invioláveis

Regras cuja violação corrompe dados ou quebra contrato com o usuário.
Fonte: `docs/context/product.md` / `docs/context/domains/`.

- **GR-001 (fonte oficial):** todo dado, número e voto exibido leva à fonte oficial; link de fonte em 100% das fichas e votações.
- **GR-002 (neutralidade):** nenhum texto ou UI recomenda voto, classifica parlamentar como bom/ruim, usa adjetivo valorativo ou trata partidos de forma desigual.
- **GR-003 (rastreabilidade):** todo registro guarda id original da fonte, URL de origem e data da última sincronização.
- **GR-004 (voto na data):** voto guarda partido e UF da data da votação; o voto original é preservado ao lado do normalizado.
- **GR-005 (sem voto inventado):** votação simbólica não tem voto individual e votação secreta do Senado só tem totais; nunca fabricar voto individual.
- **GR-006 (método público):** fidelidade, presença e concordância só são exibidos com a fórmula publicada em "Sobre os dados".
- **GR-007 (só dado público):** apenas dados públicos de agentes políticos; analytics sem cookies de rastreamento.
- **GR-008 (resiliência):** falha de API oficial não derruba o site; serve o último dado gravado e avisa o atraso.
- **GR-009 (ingestão idempotente):** rodar a ingestão duas vezes não duplica registros; nunca apagar votação já gravada sem reprocessar da fonte.

> Toda regra recebe ID para que Specs e Critérios de Aceite possam citá-la
> (`Cobre: GR-001`).

---

## 5. Escalar ao humano — parar e perguntar

Pare a execução e pergunte antes de prosseguir quando a tarefa envolver:

- alteração em fluxo de autenticação ou autorização
- migration destrutiva (`DROP`, `ALTER ... DROP COLUMN`) ou em tabela grande
- breaking change em contrato de API já publicado
- nova dependência de runtime ou serviço externo
- qualquer coisa que mova dinheiro ou exponha dado pessoal
- texto editorial (guias, glossário, qualquer copy que descreva partido ou parlamentar) — exige checklist de neutralidade
- fórmula de cálculo exibida (fidelidade, presença, concordância)
- nova fonte de dados externa, ou mudança de endpoint/janela de uma fonte oficial
- contas de usuário (POL-037) ou qualquer coleta de dado do visitante
- deploy ou alteração na VPS de produção (Compose, Traefik)

---

## 6. Gate de Spec

- Implementação só começa com Spec em `Status: approved`.
- **Somente humano** aprova: via `/approve <spec>` (valida e grava
  `Status: approved` + `Aprovado por`) ou editando o Status no editor. Agente
  que tentar aprovar via ferramenta cai em confirmação obrigatória do
  `spec-gate.mjs`. Se a Spec parece pronta, avise o humano para rodar
  `/approve` e pare — nunca edite o Status.
- Agente marca `[x]` num Critério de Aceite **apenas** com evidência de verificação
  (seção 1) na mesma resposta.
- **Mecânico, não só honra:** `.claude/hooks/spec-gate.mjs` aplica duas regras.
  (1) Qualquer edição via ferramenta que tire o Status de uma Spec de `review`
  (para `approved`, `done` ou outro valor) exige confirmação humana no prompt
  do hook. (2) Enquanto a Spec declarada em `**Spec ativo:**`
  (`docs/context/current-state.md`) estiver `Status: review`, edições aos
  arquivos declarados no `Arquivos:` de suas tarefas (todo código, se nenhum
  declarado) são bloqueadas. Depende desse campo estar atualizado — `/spec` o
  atualiza ao gerar a Spec.
