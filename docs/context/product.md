# Product Context

> **Purpose**: Help AI agents understand the product domain, user needs, and business rules. Update this as the product evolves.
> Fonte de origem: `docs/Plataforma de Consulta Política — Descritivo e Backlog.md`.

## Product Overview

**Product name**: VotoAberto (nome de trabalho — nome definitivo e domínio próprio seguem em aberto)
**Tagline**: Entenda como o poder funciona no Brasil e veja, com dados oficiais, o que cada parlamentar fez.
**Stage**: Ideia (nada construído; o Placar do Congresso existe apenas como protótipo HTML)

Site de consulta política que explica como o poder funciona no Brasil e mostra, com dados oficiais, o que cada Casa e cada parlamentar fez. Reúne num só lugar três coisas: aprender (guias), consultar (proposições, normas, votações, parlamentares) e analisar (ferramentas interativas). Os dados existem nas APIs da Câmara, do Senado e do TSE, mas estão espalhados, em formato técnico e sem contexto; cada dado exibido aponta para a fonte oficial.

## Target Users

### Primary User
- **Who**: Cidadão curioso (eleitor)
- **Goal**: Saber como seu deputado ou senador votou
- **Pain point**: Os dados oficiais existem, mas estão espalhados, em formatos técnicos e sem contexto
- **Technical level**: Non-technical (leigo — termos técnicos precisam de definição a um clique)

### Secondary User (if any)
- **Who**: Estudante, professor e quem se prepara para concurso
- **Goal**: Entender cargos, processo legislativo e história política
- **Who**: Jornalista, pesquisador e desenvolvedor
- **Goal**: Filtrar, comparar e exportar dados (CSV e API pública)

## Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| Ferramentas | Consultas interativas sobre dados oficiais: Placar do Congresso (MVP), Como votou meu parlamentar, Comparador de parlamentares, Fidelidade partidária | Planejado (MVP, v1, v2) |
| Guias | Conteúdo educativo em MDX versionado: Três Poderes, cargos e mandatos, como uma lei é feita, tipos de proposição, sistema eleitoral, glossário | Planejado (MVP) |
| Parlamentares | Perfil de cada deputado e senador em exercício: mandato, partido, UF, votos recentes, proposições de autoria, presença | Planejado (v1) |
| Proposições | Busca e ficha de projetos de lei com ementa, autores, tramitação, votações e texto | Planejado (v1) |
| Normas + Linha do tempo | Leis, decretos e emendas em vigor com link ao texto consolidado; histórico político desde 1889 | Planejado (v2) |

Transversais a todos os módulos: glossário com tooltip, busca global, página "Sobre os dados" (fontes e método), contato para correções, exportação CSV e API pública de leitura.

## Business Rules

> Critical business logic that AI agents must never violate. These are non-negotiable constraints.

- **Fonte oficial sempre**: todo dado, número e voto exibido leva à fonte oficial (link em 100% das fichas e votações).
- **Neutralidade editorial**: o site descreve e mede; não recomenda voto, não classifica parlamentar como bom ou ruim, não usa adjetivos valorativos e dá o mesmo tratamento a todos os partidos.
- **Rastreabilidade do registro**: todo registro guarda o id original da fonte, a URL de origem e a data da última sincronização.
- **Voto no contexto da data**: o voto guarda partido e UF da data da votação (parlamentares trocam de partido); o voto original é preservado ao lado do normalizado.
- **Sem voto inventado**: votação simbólica não tem voto individual e votação secreta do Senado só tem totais; a interface explica os dois casos.
- **Cálculo com método público**: fidelidade partidária, presença e concordância só aparecem com a fórmula publicada em "Sobre os dados".
- **Só dados públicos**: apenas dados públicos de agentes políticos; analytics sem cookies de rastreamento.
- **Resiliência**: falha de API oficial não derruba o site — serve o último dado gravado e avisa o atraso.

## Restrições Não-Funcionais

- **Escala esperada**: não definida; infraestrutura é uma VPS única mantida por um desenvolvedor. Páginas estáticas/revalidadas (ISR) e cache Redis absorvem a leitura.
- **Compliance / regulação**: LGPD — só dados públicos de agentes políticos, analytics sem cookies de rastreamento (sem banner de cookies), política de privacidade publicada.
- **Disponibilidade**: best-effort, sem SLA formal; atraso máximo de sincronização de 2 h em dias de sessão.
- **Performance**: LCP < 2,5 s em 4G; Lighthouse Performance ≥ 90; p95 do BFF < 300 ms com cache.
- **Acessibilidade**: WCAG 2.2 AA; Lighthouse Accessibility ≥ 95; categorias de voto nunca só por cor; funciona a partir de 360 px.
- **API pública**: leitura aberta, 60 requisições por minuto por IP, documentação OpenAPI.

## Domain Glossary

> Use these terms consistently in code, documentation, and conversations.

| Term | Definition |
|------|-----------|
| Casa | Câmara dos Deputados (CD) ou Senado Federal (SF) |
| Votação | Evento de deliberação ligado a uma proposição e a uma sessão; tipo nominal, simbólica ou secreta |
| Voto normalizado | Categoria padronizada do voto: Sim, Não, Abstenção, Obstrução, Presidente, Ausente ou outro; o voto original fica em campo separado |
| Orientação | Posição indicada por partido, bloco ou liderança antes da votação |
| Proposição | Projeto submetido ao Legislativo (PL, PLP, PEC, MP, PDL etc.), identificado por tipo, número e ano |
| Mandato | Período de exercício de um parlamentar numa Casa e legislatura, como titular ou suplente |
| Filiação | Vínculo de um parlamentar a um partido, com início e fim |
| Fidelidade partidária | Percentual de votos alinhados à orientação do partido; fórmula publicada |
| Sincronização | Cópia dos dados das APIs oficiais para o Postgres, com data da última execução registrada |
| Fonte oficial | API ou portal da Câmara, Senado, TSE, LexML ou Planalto de onde o dado se origina |

## User Journeys

<!-- a definir -->

## Metrics & Success Criteria

- **Primary metric**: Visitantes únicos mensais (Umami auto-hospedado, sem cookies)
- **Secondary metrics**: <!-- a definir -->
- **Current targets**: <!-- a definir -->
- **Metas de qualidade** (não são métrica de sucesso): Lighthouse Perf ≥ 90 e Accessibility ≥ 95; atraso de sincronização ≤ 2 h em dia de sessão; link de fonte em 100% das fichas.

## Out of Scope

> Features or behaviors explicitly NOT part of this product (prevents scope creep).

- Notícias, opinião ou análise editorial.
- Contas de usuário, comentários e fóruns (alertas por e-mail, POL-037, dependem de decisão futura registrada antes de implementar).
- Dados de estados e municípios (assembleias e câmaras municipais).
- Previsões eleitorais e pesquisas de intenção de voto.
- Recomendar voto ou classificar parlamentar como bom ou ruim.

## Competitive Context

<!-- a definir -->

## Roadmap (High Level)

| Marco | Tema | Key Deliverables |
|-------|------|-----------------|
| MVP | Site no ar com guias e o Placar | App web + BFF, ambiente na VPS, shell com design system Nocturne, Placar (HTML publicado), 6 guias em MDX, glossário, "Sobre os dados", SEO, analytics |
| v1 | Dados próprios, parlamentares e proposições | Worker de ingestão (BullMQ), pacote core de normalização, API do BFF, Placar em Next.js, perfis de parlamentares, busca de proposições, busca global, API pública |
| v2 | Normas, linha do tempo e novas ferramentas | Normas (LexML), linha do tempo, comparador, fidelidade partidária, votações de comissões, dados do TSE, alertas |

Backlog detalhado (POL-001..POL-037) no descritivo de origem; será reorganizado por `/backlog`.
