# Plataforma de Consulta Política — Descritivo e Backlog

Oct 10, 2026 · @Roberto Miyazaki Urias Nicoletti

## Visão do produto

Um site de consulta política que explica como o poder funciona no Brasil e mostra, com dados oficiais, o que cada Casa e cada parlamentar fez. A primeira entrega é o Placar do Congresso, já funcional como HTML; o resto do backlog constrói a plataforma em volta dele.

**Propósito.** Reduzir a distância entre o cidadão e a informação legislativa. Os dados existem (APIs da Câmara, do Senado, do TSE), mas estão espalhados, em formatos técnicos e sem contexto.

**Público.**

- Cidadão curioso que quer saber como seu deputado ou senador votou.
- Estudante, professor e quem se prepara para concurso, que precisa entender cargos, processo legislativo e história.
- Jornalista, pesquisador e desenvolvedor, que querem filtrar, comparar e exportar dados.

**Proposta de valor.** Três coisas no mesmo lugar: aprender (guias), consultar (proposições, normas, votações, parlamentares) e analisar (ferramentas interativas). Cada dado aponta para a fonte oficial.

**Princípios.**

1. **Fonte oficial sempre.** Todo número e todo voto mostra de onde veio, com link para a página da Casa ou do órgão.
2. **Neutralidade editorial.** O site descreve e mede; não recomenda voto, não classifica parlamentar como bom ou ruim, não usa adjetivos políticos.
3. **Transparência de método.** Cálculos como fidelidade partidária ou presença têm a fórmula publicada.
4. **Acessível a leigos.** Termos técnicos (PEC, PLP, quórum, destaque) têm definição a um clique, ligada ao glossário.
5. **Dados abertos de volta.** O que o site agrega pode ser baixado em CSV e consultado por API pública.

## Escopo por módulos

O site tem seis módulos, que compartilham um glossário e uma busca única. A ordem da tabela é a ordem sugerida de entrega.

| Módulo | O que oferece | Exemplos de página | Marco |
| --- | --- | --- | --- |
| Ferramentas | Consultas interativas sobre dados oficiais | Placar do Congresso; Como votou meu parlamentar; Comparador de parlamentares; Fidelidade partidária | MVP (Placar), v1 e v2 |
| Guias | Conteúdo educativo escrito, estável, com SEO forte | Os Três Poderes; Cargos e mandatos; Como uma lei é feita; Tipos de proposição (PL, PLP, PEC, MP, PDL); Sistema eleitoral; Glossário | MVP |
| Parlamentares | Perfil de cada deputado e senador em exercício | Mandato, partido, UF, votos recentes, proposições de autoria, presença | v1 |
| Proposições | Busca e acompanhamento de projetos de lei | Ficha da proposição com ementa, autores, tramitação, votações e texto | v1 |
| Normas | Consulta a leis, decretos e emendas constitucionais já em vigor | Ficha da norma com link para o texto consolidado no Planalto e a proposição de origem | v2 |
| Linha do tempo | Histórico de acontecimentos políticos | Governos e presidentes desde 1889; Constituições; Emendas à Constituição de 1988; marcos eleitorais | v2 |

**Transversal a todos os módulos:** glossário com tooltip, busca global, página "Sobre os dados" com fontes e método, e página de contato para correções.

**Fora do escopo** (pelo menos até a v2):

- Notícias, opinião ou análise editorial.
- Contas de usuário, comentários e fóruns.
- Dados de estados e municípios (assembleias e câmaras municipais).
- Previsões eleitorais ou pesquisas de intenção de voto.

## Fontes de dados

Câmara e Senado cobrem quase todo o MVP e a v1; foram testadas nesta conversa e respondem a chamadas do navegador sem autenticação. As demais entram na v2 e precisam ser validadas antes de virar história.

| Fonte | Usada para | Formato | Limites conhecidos | Status |
| --- | --- | --- | --- | --- |
| [API Dados Abertos da Câmara v2](https://dadosabertos.camara.leg.br/swagger/api.html) | Votações, votos, orientações, proposições, deputados, eventos | REST/JSON | Janela de datas em /votacoes de no máximo 3 meses; cabeçalho Accept customizado quebra o CORS; a lista de votos traz só quem votou | Testada |
| [API Dados Abertos Legislativos do Senado](https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html) | Votações com votos nominais, processos, senadores, agenda | REST/JSON (sufixo .json) | /votacao aceita intervalo de até 1 ano; até 10 requisições por segundo; vários serviços antigos marcados como descontinuados | Testada |
| Arquivos em lote da Câmara (dadosabertos.camara.leg.br/arquivos) | Carga histórica de votações e votos por ano | CSV/JSON | Arquivos grandes; usar só na ingestão do backend | A validar |
| LexML Brasil | Normas federais e vínculo norma ↔ proposição | SRU/XML | Consulta por URN; documentação esparsa | A validar |
| Portal da Legislação do Planalto | Texto consolidado de leis e decretos | HTML | Sem API; usar só como link de destino | A validar |
| Portal de Dados Abertos do TSE | Candidatos, resultados eleitorais, partidos | CSV em lote | Arquivos por eleição; volume alto | A validar (v2) |

**Regras para o uso das fontes:**

- Guardar sempre o identificador original (id da votação, código da matéria) e a URL de origem de cada registro.
- Registrar data e hora da última sincronização por fonte, exibida na página "Sobre os dados".
- Tratar divergência de siglas entre endpoints (ex.: orientações da Câmara usam siglas abreviadas como "Solidaried") com uma tabela de normalização de partidos.
- Votações simbólicas não têm voto individual; votações secretas do Senado só têm totais. A interface precisa explicar os dois casos.

## Arquitetura proposta

O site entra no monorepo Nico como mais um produto, com o mesmo padrão do FitFlow: front em Next.js, BFF em NestJS, Prisma e o Postgres central da VPS. A diferença está num worker de ingestão que copia os dados oficiais para o banco, para que as páginas não dependam das APIs das Casas em tempo real.

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Front | Next.js (App Router), páginas estáticas com revalidação (ISR) | Guias e fichas precisam de SEO e carregar rápido; dados mudam no máximo algumas vezes por dia |
| Conteúdo dos guias | MDX versionado no repositório | Revisão por pull request, histórico de alterações, sem CMS para manter |
| UI | Pacote compartilhado do design system Nocturne (AppShell, DataTable, StatCard) | Reuso do que já existe no monorepo |
| BFF / API | NestJS em `apps/<produto>-bff` sobre `packages/bff-core` | Mesmo padrão dos outros produtos; expõe também a API pública de leitura |
| Ingestão | Worker NestJS com filas BullMQ no Redis compartilhado | Agenda sincronizações, respeita limites de taxa, reprocessa falhas |
| Banco | Postgres central, schema próprio do produto, Prisma | Já existe na VPS, com backup automatizado |
| Busca | Full-text do Postgres com `unaccent` e dicionário português | Atende ao MVP sem serviço extra; Meilisearch fica como opção se a busca ficar lenta |
| Arquivos | Garage (S3) para exportações CSV e cargas em lote | Já configurado em s3.nico.dev.br |
| Deploy | Docker Compose em `/opt/docker/<produto>/`, Traefik com subdomínio de nico.dev.br e depois domínio próprio | Convenção atual da VPS |
| Observabilidade | Uptime Kuma, Dozzle e uma tabela de execuções de sincronização | Ferramentas já no stack de infra compartilhada |

**Fluxo de dados.** O worker busca as APIs em horários fixos e grava no Postgres. O BFF lê só do Postgres. O Next.js renderiza e revalida as páginas a partir do BFF. O Placar do Congresso hoje faz o caminho curto, chamando as APIs direto do navegador; na v1 ele passa a ler do BFF (ver a seção da ferramenta).

&#91;embedded content: arquitetura · 6 componentes, caminho do MVP tracejado\]

Os dados descem das fontes para o banco e chegam ao visitante sempre pelo BFF; só o Placar do MVP pega o atalho tracejado.

**Agenda de sincronização sugerida:**

- Votações e votos: a cada 30 minutos em dias de sessão, diária nos demais.
- Proposições alteradas: diária, usando os filtros de atualização recente de cada API.
- Parlamentares, partidos e mandatos: semanal.
- Carga histórica: uma vez, a partir dos arquivos em lote, depois incremental.

## Modelo de dados principal

Dez entidades sustentam o MVP e a v1, e duas entram na v2; todas têm `casa` (CD ou SF) quando se aplica, o id da fonte e a data da última sincronização. A votação é o centro: liga proposição, sessão e votos.

| Entidade | Campos principais | Relações |
| --- | --- | --- |
| Parlamentar | id interno, id na fonte, casa, nome parlamentar, nome civil, UF, sexo, foto | tem vários Mandatos e Votos; é autor de Proposições |
| Mandato | parlamentar, casa, legislatura, início, fim, titular ou suplente | pertence a Parlamentar |
| Filiação | parlamentar, partido, início, fim | liga Parlamentar a Partido no tempo |
| Partido | sigla normalizada, siglas alternativas, nome, número | tem Filiações e Orientações |
| Proposição | casa de origem, sigla do tipo, número, ano, ementa, palavras-chave, situação, data de apresentação, URL | tem Autorias, Tramitações e Votações; pode gerar uma Norma |
| Autoria | proposição, parlamentar ou órgão autor, ordem | liga Proposição a Parlamentar |
| Tramitação | proposição, data, órgão, descrição, situação | pertence a Proposição |
| Votação | casa, id na fonte, data e hora, órgão, descrição, resultado, tipo (nominal, simbólica, secreta), totais | pertence a Proposição; tem Votos e Orientações |
| Voto | votação, parlamentar, partido na data, UF na data, voto original, voto normalizado | liga Votação a Parlamentar |
| Orientação | votação, partido ou bloco ou liderança, orientação | pertence a Votação |
| Norma (v2) | tipo, número, data, ementa, URN LexML, URL do texto, proposição de origem | vinda de Proposição |
| Evento histórico (v2) | data, título, resumo, categoria, fontes, entidades relacionadas | ligado a Normas, Parlamentares, Partidos |

**Decisões de modelagem:**

- O voto guarda partido e UF da data da votação, porque parlamentares trocam de partido.
- Voto normalizado usa as categorias da ferramenta atual: Sim, Não, Abstenção, Obstrução, Presidente, Ausente ou outro. O voto original fica em outro campo.
- Guias não ficam no banco: são arquivos MDX, com frontmatter que lista termos do glossário e entidades relacionadas.
- Índice de busca: uma coluna `tsvector` em Proposição, Votação, Parlamentar e Norma, alimentada por gatilho.

## Ferramenta 1 — Placar do Congresso

O arquivo `placar-congresso.html` já funciona e pode ir ao ar no MVP como está, numa rota `/ferramentas/placar`. Na v1 ele é reescrito como página Next.js lendo do BFF, mantendo a mesma interface.

**O que o HTML atual faz (testado em 10/10/2026 com dados reais):**

- Carrega as votações de plenário das duas Casas nos últimos 90 dias, com opção de 6 ou 12 meses.
- Busca por tema (ementa, palavras-chave, descrição) e por número, como "PEC 14/2021", em qualquer data.
- Filtros: Câmara, Senado ou ambas; esta semana, última semana com votação, 30 dias; só nominais.
- Detalhe da votação: placar, tabela por partido com orientação da bancada e taxa de quem a seguiu (Câmara), lista por parlamentar com filtros e exportação CSV.

**Limites da versão atual:**

| Limite | Causa | Resolve em |
| --- | --- | --- |
| Primeira carga lenta (centenas de chamadas) | Busca uma ficha de proposição para cada votação da Câmara | v1, com dados no Postgres |
| Depende da disponibilidade das APIs das Casas | Chamadas feitas do navegador | v1, lendo do BFF |
| Sem URL própria por votação para SEO | Página única com estado no hash | v1, rota `/votacoes/[casa]/[id]` |
| Só plenário | Filtro fixo em PLEN | v2, incluir comissões |
| Busca por tema limitada ao período carregado | Índice montado no navegador | v1, busca full-text no banco |

**Plano de migração:**

1. MVP: publicar o HTML como página estática dentro do layout do site (cabeçalho, rodapé, link para "Sobre os dados").
2. v1: extrair a lógica de normalização (`normVote`, `parseTotais`, agrupamento por partido) para um pacote TypeScript compartilhado entre worker e front, com testes unitários.
3. v1: trocar as chamadas às APIs por chamadas ao BFF; manter a interface e as cores das categorias de voto.
4. v1: criar páginas de votação indexáveis e ligar cada parlamentar à sua página de perfil.

## Requisitos não funcionais

Cada requisito abaixo tem uma meta verificável, para virar critério de aceite das histórias.

| Área | Requisito | Meta |
| --- | --- | --- |
| Performance | Páginas de guia e fichas servidas estáticas ou revalidadas | LCP abaixo de 2,5 s em 4G; Lighthouse Performance ≥ 90 |
| Performance | Consultas do BFF | p95 abaixo de 300 ms com cache Redis |
| SEO | Metadados por página, sitemap, dados estruturados (schema.org Legislation, Person, Article) | Toda ficha com título, descrição e URL canônica únicos |
| Acessibilidade | WCAG 2.2 AA: contraste, foco visível, navegação por teclado, gráficos com texto alternativo | Lighthouse Accessibility ≥ 95; categorias de voto nunca só por cor |
| Responsividade | Funciona a partir de 360 px de largura | Tabelas largas com rolagem horizontal própria |
| Atualização | Data da última sincronização visível em cada página de dados | Atraso máximo de 2 h em dias de sessão |
| Confiabilidade | Falha de uma API não derruba o site | Páginas servem o último dado gravado e avisam o atraso |
| LGPD | Só dados públicos de agentes políticos; analytics sem cookies de rastreamento (ex.: Umami ou Plausible auto-hospedados) | Sem banner de cookies necessário; política de privacidade publicada |
| Neutralidade | Guia de estilo editorial: sem adjetivos valorativos, mesmo tratamento para todos os partidos | Revisão de todo guia por checklist antes de publicar |
| Rastreabilidade | Todo dado exibido leva à fonte oficial | Link de fonte em 100% das fichas e votações |
| API pública | Leitura aberta, com limite de taxa | 60 requisições por minuto por IP; documentação OpenAPI |
| Qualidade | Testes | Unitários na normalização de votos e partidos; e2e com Playwright nos fluxos principais |

## Backlog

São 37 histórias em 17 épicos, divididas em três marcos: MVP (10 histórias, site no ar com guias e o Placar), v1 (18, dados próprios no banco, parlamentares e proposições) e v2 (9, normas, linha do tempo e novas ferramentas). Cada critério de aceite pode ser verificado por teste ou inspeção.

### MVP — site no ar com guias e o Placar

| ID | Épico | História | Critérios de aceite | Prioridade | Status |
| --- | --- | --- | --- | --- | --- |
| POL-001 | Fundação | Criar o app web (Next.js) e o BFF (NestJS) no monorepo Turborepo | Build e lint passam no CI; `turbo dev` sobe os dois apps; README com comandos | Alta | A fazer |
| POL-002 | Fundação | Ambiente na VPS: Compose em `/opt/docker/<produto>/`, Traefik, subdomínio, schema no Postgres central | Deploy automático a cada push na main; HTTPS válido; healthcheck no Uptime Kuma | Alta | A fazer |
| POL-003 | Layout | Shell do site com o Nocturne: cabeçalho, menu dos módulos, rodapé com fontes, tema claro e escuro | Navegável por teclado; sem rolagem lateral em 360 px; Lighthouse Acessibilidade ≥ 95 | Alta | A fazer |
| POL-004 | Placar | Publicar `placar-congresso.html` em `/ferramentas/placar` dentro do layout | Carrega votações das duas Casas; busca "PEC 14/2021" traz as duas Casas; CSV baixa | Alta | A fazer |
| POL-005 | Guias | Pipeline de guias em MDX: rota `/guias/[slug]`, frontmatter (título, resumo, termos, atualizado em, fontes), índice | Guia novo publicado só com arquivo MDX e PR; metadados e sitemap gerados | Alta | A fazer |
| POL-006 | Guias | Glossário em `/glossario` e componente de tooltip usado em guias e ferramentas | ≥ 40 termos no lançamento (PEC, PLP, MP, quórum, destaque, obstrução…); cada termo com âncora própria | Alta | A fazer |
| POL-007 | Guias | Escrever 6 guias: Três Poderes; Cargos e mandatos; Como uma lei é feita; Tipos de proposição; Como funciona uma votação; Sistema eleitoral | Cada guia cita fontes oficiais e passa no checklist de neutralidade | Alta | A fazer |
| POL-008 | Transversal | Página "Sobre os dados": fontes, frequência, limites, método dos cálculos, contato para correções | Lista todas as fontes da seção Fontes de dados com link | Média | A fazer |
| POL-009 | Qualidade | SEO base: metadados, Open Graph, sitemap.xml, robots.txt, dados estruturados nos guias | Teste de rich results sem erros nas páginas de guia | Média | A fazer |
| POL-010 | Qualidade | Analytics sem cookies (Umami auto-hospedado) e política de privacidade | Nenhum cookie de terceiros; painel com páginas mais vistas | Baixa | A fazer |

### v1 — dados próprios, parlamentares e proposições

| ID | Épico | História | Critérios de aceite | Prioridade | Status |
| --- | --- | --- | --- | --- | --- |
| POL-011 | Ingestão | Worker com BullMQ: jobs, agenda, retry com backoff, tabela de execuções | Falha de uma fonte não bloqueia as outras; cada execução registra início, fim, itens e erro | Alta | A fazer |
| POL-012 | Ingestão | Sincronizar deputados, senadores, mandatos, partidos e filiações | 513 deputados e 81 senadores em exercício; siglas de partido normalizadas | Alta | A fazer |
| POL-013 | Ingestão | Sincronizar votações de plenário, votos e orientações da Câmara (janelas de 3 meses, sem cabeçalho Accept) | Votação 2611313-31 gravada com 396 votos e 15 orientações | Alta | A fazer |
| POL-014 | Ingestão | Sincronizar votações e votos do Senado via `/votacao` | PLP 74/2026 no Senado com 81 registros; votações secretas só com totais | Alta | A fazer |
| POL-015 | Ingestão | Sincronizar proposições votadas, com autorias e tramitação, nas duas Casas | Toda votação ligada à proposição quando a fonte informa | Alta | A fazer |
| POL-016 | Ingestão | Carga histórica desde a 57ª legislatura (2023) pelos arquivos em lote | Script idempotente: rodar duas vezes não duplica registros | Média | A fazer |
| POL-017 | Pacote core | Pacote compartilhado com normalização de votos, partidos e totais | Cobertura ≥ 90% nas funções de normalização; usado pelo worker e pelo front | Alta | A fazer |
| POL-018 | API | Endpoints do BFF: votações, parlamentares, proposições e busca, com detalhe por id | OpenAPI publicada; p95 abaixo de 300 ms; paginação por cursor | Alta | A fazer |
| POL-019 | Placar | Migrar o Placar para Next.js lendo do BFF, com a mesma interface | Primeira carga abaixo de 2 s; teste Playwright do fluxo buscar, abrir, filtrar, baixar CSV | Alta | A fazer |
| POL-020 | Placar | Página indexável por votação em `/votacoes/[casa]/[id]` | URL compartilhável; título e descrição com proposição, data e resultado | Média | A fazer |
| POL-021 | Parlamentares | Lista de parlamentares com filtros por Casa, partido, UF e exercício | Filtros combináveis e refletidos na URL | Alta | A fazer |
| POL-022 | Parlamentares | Perfil: mandato, partido atual e histórico, votos recentes, proposições de autoria, link oficial | Votos paginados; cada voto leva à página da votação | Alta | A fazer |
| POL-023 | Ferramentas | "Como votou meu parlamentar": votos de um parlamentar por tema e período | Busca por nome com ou sem acento; exporta CSV | Média | A fazer |
| POL-024 | Proposições | Busca por tema, tipo, número, ano, autor, situação e Casa | "reforma tributária" traz as PECs do tema no topo | Alta | A fazer |
| POL-025 | Proposições | Ficha da proposição: ementa, autores, tramitação, votações e link para o texto | Tramitação em ordem cronológica; cada votação com placar resumido | Alta | A fazer |
| POL-026 | Busca | Busca global (full-text do Postgres) em guias, glossário, proposições, parlamentares e votações | Resultados agrupados por tipo; "aposentadoria" encontra guia, PEC e votação | Média | A fazer |
| POL-027 | Qualidade | Alerta quando a sincronização atrasar mais de 2 h em dia de sessão | Alerta chega ao canal escolhido num teste forçado | Média | A fazer |
| POL-028 | API | API pública de leitura com limite de taxa e documentação | 60 requisições por minuto por IP; página `/api` com exemplos | Baixa | A fazer |

### v2 — normas, linha do tempo e novas ferramentas

| ID | Épico | História | Critérios de aceite | Prioridade | Status |
| --- | --- | --- | --- | --- | --- |
| POL-029 | Normas | Ingestão de normas federais via LexML, ligadas à proposição de origem | Lei gerada por uma proposição aparece nas duas fichas | Média | A fazer |
| POL-030 | Normas | Ficha da norma com link para o texto consolidado no Planalto | Verificação semanal aponta links quebrados | Média | A fazer |
| POL-031 | Linha do tempo | Formato de eventos históricos em arquivos versionados, com fonte obrigatória | Evento sem fonte quebra o build | Média | A fazer |
| POL-032 | Linha do tempo | Páginas: presidentes desde 1889, constituições, emendas à Constituição de 1988 | Navegação por década; cada evento com fonte | Média | A fazer |
| POL-033 | Ferramentas | Comparador: concordância de votos entre dois ou mais parlamentares | Fórmula publicada em "Sobre os dados" | Média | A fazer |
| POL-034 | Ferramentas | Fidelidade partidária e presença por parlamentar e por partido | Cálculo documentado; período selecionável | Média | A fazer |
| POL-035 | Placar | Incluir votações de comissões | Filtro por órgão na lista | Baixa | A fazer |
| POL-036 | Eleições | Dados do TSE: candidatos e resultados por eleição | Perfil do parlamentar mostra votos recebidos | Baixa | A fazer |
| POL-037 | Alertas | Acompanhar proposição ou parlamentar por e-mail | Decisão sobre contas de usuário registrada antes de implementar | Baixa | A fazer |

## Riscos, decisões em aberto e próximos passos

O maior risco é depender de APIs públicas que mudam sem aviso; a ingestão com cópia local e testes de contrato reduz o impacto.

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Mudança ou descontinuação de endpoints (o Senado já marca vários como descontinuados) | Sincronização quebra e páginas ficam desatualizadas | Testes de contrato diários contra uma votação conhecida; alerta de atraso; página mostra a data do último dado |
| Percepção de viés político | Perda de credibilidade | Guia de estilo e checklist de neutralidade; método publicado; canal de correções com prazo de resposta |
| Erro de dado exibido como fato | Desinformação | Link para a fonte em toda página; registro de correções público |
| Volume da carga histórica na VPS | Disco e tempo de ingestão | Começar pela 57ª legislatura; medir o tamanho antes de ampliar |
| Escopo grande para um desenvolvedor só | Atraso nos marcos | MVP com o Placar como está e só 6 guias; cada marco publicável sozinho |

**Decisões em aberto:**

- [ ] Nome do produto e domínio próprio (o subdomínio de nico.dev.br serve até lá).
- [ ] Apenas leitura ou contas de usuário para alertas (afeta POL-037 e a LGPD).
- [ ] Busca no Postgres basta ou entra o Meilisearch na v1.
- [ ] Quem revisa os guias além do autor (checklist sozinho ou revisor externo).
- [ ] Licença dos dados e do conteúdo dos guias (sugestão: CC BY 4.0 para os guias).

**Próximos passos:**

1. Fechar o nome e registrar o domínio.
2. Abrir o repositório do produto no monorepo e criar as histórias POL-001 a POL-010 no seu gerenciador de tarefas.
3. Publicar o Placar (POL-004) assim que o shell do site existir, para ter uma ferramenta no ar desde o primeiro deploy.
4. Escrever o guia de estilo editorial antes do primeiro guia (POL-007).
