# Decisões do Projeto

Escolhas técnicas que substituem padrões gerais. Separadas por domínio.
Registradas aqui para que agentes não inventem convenções não acordadas.

## Backend

### Arquitetura
- **BFF em NestJS** é o único ponto de contato com as APIs externas (Câmara, Senado e demais fontes oficiais): nenhum app consome fonte externa diretamente. Exceção temporária: o Placar publicado como HTML no MVP (POL-004), até a v1
- Dados externos são copiados para o Postgres por jobs de ingestão (worker NestJS); o BFF serve as páginas lendo do Postgres, não das APIs das Casas em tempo real
- Clean Architecture com limites de camada estritos
- DI baseado em tokens: `{ provide: IUsersRepository, useClass: TypeOrmUsersRepository }`
- Entidades de domínio: classes TypeScript puras — zero imports NestJS
- Exceções de domínio tipadas que estendem as built-ins do NestJS

### ORM e banco
- `synchronize: false` em produção — migrations obrigatórias para toda mudança de schema
- ORM: <!-- definido por app -->
- Banco: PostgreSQL (Postgres central da VPS, schema próprio do produto) — migrations obrigatórias

### API
- REST com Swagger (`@nestjs/swagger`)
- Versionamento via prefixo: `/api/v1/`
- Paginação cursor-based preferida sobre offset em tabelas grandes
- API pública de leitura: rate limit de 60 req/min por IP e OpenAPI publicada

### Erros e logs
- Filtro global de exceções para erros inesperados — shape consistente de resposta
- Log sempre com contexto: `this.logger.error('msg', { entityId, error })`
- Ingestão: idempotente (rodar duas vezes não duplica registros); falha de uma fonte não bloqueia as outras; retry com backoff; toda execução registra início, fim, itens e erro
- Testes de contrato diários contra uma votação conhecida de cada fonte

### Fila
- Operações pesadas (email, PDF, imagem) vão para fila — nunca bloqueiam HTTP
- Solução de fila: <!-- definido por app -->

### Auth
- <!-- definido por app --> (sem contas de usuário no escopo atual)

### Cache
- <!-- definido por app -->

### Testes backend
- Unit: Jest com interfaces de repositório mockadas
- Integration: Supertest contra app NestJS real com banco de teste
- Cobertura mínima: use cases 90%, controllers 80%, repos 60%

---

## Frontend

### Design system e tokens
- Fonte dos tokens: design system **Nocturne** (pacote compartilhado de UI: AppShell, DataTable, StatCard), com tema claro e escuro; valores de cores e fontes <!-- a definir -->
- Categorias de voto (Sim, Não, Abstenção, Obstrução, Presidente, Ausente) nunca distinguidas só por cor

### Renderização
- App Router (Next.js) — sem Pages Router
- Server Components por padrão; `'use client'` apenas para interatividade ou browser APIs
- Server Actions para mutações internas — não API routes
- Dados em Server Components sempre que possível — evitar `useEffect` para fetch

### Estilização
- <!-- definido por app -->

### Componentes
- <!-- definido por app -->

### Estado global
- <!-- definido por app -->

### Formulários
- <!-- definido por app -->

### Data fetching no cliente
- <!-- definido por app -->

### Ícones
- <!-- definido por app -->

### Testes frontend
- React Testing Library + Jest — sem Enzyme
- MSW para mock de rede — sem mocks manuais de fetch
- Playwright para E2E
- Cobertura mínima: componentes 70%, hooks e utils 90%, fluxos P0 (E2E) 100%
