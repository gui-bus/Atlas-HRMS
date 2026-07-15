# Changelog

Todos os registros de alterações relevantes para este projeto serão documentados neste arquivo, seguindo as diretrizes do padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e aderindo ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [0.7.0] - 2026-07-15

### Adicionado

- **Sistema de Notificações Internas**: Módulo completo para criação, listagem e marcação de alertas em banco de dados para os usuários.
- **Segurança de Notificações (JWT/RBAC)**: Proteção em todas as rotas limitando leitura apenas ao proprietário (`userId === req.user.sub`) usando `@CurrentUser()`. Endpoint `POST` para disparo de novas mensagens restrito a perfis administrativos (`ADMIN` e `HR`).
- **Testes e Documentação de Notificações**: Testes unitários (`notifications.service.spec.ts`, `notifications.controller.spec.ts`) e testes de integração (`notifications.integration.spec.ts`) validando regras de propriedade e JWT. Documentação detalhada criada em `docs/notifications.md` e indexada no README central.
- **Polimento e Otimização do Backend**:
  - Paginação e busca insensível a maiúsculas (Query Params) implementadas nas rotas de listagem de funcionários (`GET /employees`) e logs de auditoria (`GET /audit`).
  - Geração e disparo automático de notificações internas nos fluxos de negócios (férias aprovadas/rejeitadas, licenças avaliadas e boas-vindas pós-admissão).
  - Otimização e limpeza automática de arquivos físicos órfãos hospedados no UploadThing para licenças médicas canceladas ou rejeitadas pelo RH.


## [0.6.0] - 2026-07-15

### Adicionado

- **Visualização de Logs de Auditoria**: Endpoint `GET /audit` protegido com `AuthGuard` + `RolesGuard`, restrito exclusivamente a usuários `ADMIN` e `HR`. Retorna a lista cronológica de todas as ações de auditoria do sistema, incluindo o relacionamento com o usuário executor (tratando ações públicas/anônimas com `user: null`).
- **DTO de Resposta de Auditoria**: `AuditLogResponseDto` com campos `id`, `action`, `details`, `timestamp` e `user` (nullable), decorados com `@ApiProperty` para documentação Swagger interativa.
- **Testes do Módulo de Auditoria**: Testes unitários (`audit.controller.spec.ts`) e testes de integração (`audit.integration.spec.ts`) com 10 cenários validando RBAC (ADMIN e HR permitidos, MANAGER e EMPLOYEE bloqueados com 403), autenticação obrigatória (401), e tratamento de logs com/sem usuário vinculado.
- **Documentação Técnica de Auditoria**: Página `docs/audit.md` com diagrama de arquitetura Mermaid, modelo de dados, especificação do endpoint, fluxo RBAC e tabela de referência das ações tipadas do enum `AuditAction`.
- **Módulo de Dashboard de Métricas**: Endpoint agregador `GET /dashboard` que realiza 9 consultas de agregação de forma paralela usando `Promise.all` para retornar estatísticas de funcionários ativos, departamentos, ausências atuais de escala e funil de recrutamento. Acesso restrito a perfis administrativamente habilitados (`ADMIN`, `HR` e `MANAGER`).
- **Testes e Documentação do Dashboard**: Testes unitários e de integração (`dashboard.service.spec.ts`, `dashboard.integration.spec.ts`) com 11 cenários de cobertura, e documentação detalhada em `docs/dashboard.md`.


## [0.5.0] - 2026-07-14

### Adicionado

- **Módulo ATS/Recrutamento Completo (Backend)**: Implementação de ponta a ponta do sistema de recrutamento (Applicant Tracking System) com modelos Prisma enriquecidos: `Recruitment` (com slug, tipo de contratação, modelo de trabalho, senioridade, faixa salarial, localização, visualizações, expiração), `Candidate` (cadastro único por e-mail) e `Application` (candidatura com restrição única por candidato+vaga e pipeline de 10 estágios).
- **Portal Público de Carreiras**: Rotas públicas sem autenticação para listagem paginada de vagas abertas (`GET /recruitments`) com filtros por departamento, senioridade, modelo de trabalho e tipo de contratação, busca textual insensível a maiúsculas, e detalhamento de vaga por slug (`GET /recruitments/:slug`) com contador de visualizações e controle de expiração automática.
- **Candidatura Multipart (Apply)**: Endpoint público `POST /recruitments/:slug/apply` com upload de currículo via Multer + UploadThing, cadastro/upsert automático de candidato, prevenção de candidatura duplicada via constraint `@@unique([candidateId, recruitmentId])`.
- **Administração de Vagas (RBAC)**: Endpoints autenticados para criação, edição e soft-delete de vagas (`POST/PUT/DELETE /recruitments/admin`), restritos a Admin e RH, com geração automática de slug, associação do criador (`createdById`), e publicação automática com `publishedAt`.
- **Pipeline de Candidaturas**: Listagem paginada de candidaturas por vaga (`GET /recruitments/admin/:id/applications`), atualização de status no pipeline de 10 estágios (`PUT /recruitments/applications/:id/status`), e ação explícita de admissão (`POST /recruitments/applications/:id/hire`) que converte candidato em funcionário oficial com validação de duplicidade de e-mail.
- **Controle de Visibilidade Salarial**: Campo `isSalaryVisible` que omite `salaryMin`/`salaryMax` das respostas públicas quando desabilitado.
- **Auditoria de Recrutamento**: Enum centralizado `AuditAction` com 7 ações tipadas para rastreabilidade de criação, publicação, fechamento de vagas, recebimento de candidaturas, mudança de status e conversão de candidato em funcionário.
- **Expansão do Schema Prisma**: 4 novos enums (`EmploymentType`, `WorkModel`, `Seniority`, `ApplicationStatus`), 3 modelos com índices de performance (`@@index`) e restrição de unicidade composta.
- **Testes de Recrutamento**: Testes unitários (`recruitment.service.spec.ts`, `recruitment.controller.spec.ts`) e testes de integração (`recruitment.integration.spec.ts`) com 49 cenários cobrindo rotas públicas, RBAC, validação de payload, pipeline de candidaturas e fluxo de contratação.

## [0.4.0] - 2026-07-14

### Adicionado

- **Módulo de Documentos (Backend)**: Implementado o CRUD completo para gestão de documentos de funcionários (`Document`), com validação de tipo via Enum (`CONTRACT`, `IDENTIFICATION`, `EDUCATION`, `ADDRESS_PROOF`, `OTHER`), integração com UploadThing para upload direto na nuvem e deleção automática de arquivos órfãos.
- **RBAC Granular para Documentos**: Regras de permissão diferenciadas — funcionários podem criar e visualizar apenas seus próprios documentos; Gestores, RH e Admin podem visualizar todos; apenas Admin e RH podem excluir documentos.
- **DTOs e Swagger de Documentos**: DTOs de criação (`CreateDocumentDto`) e resposta (`DocumentResponseDto`) com validações `class-validator` e decoradores Swagger detalhados para documentação interativa.
- **Testes do Módulo de Documentos**: Testes unitários (`documents.service.spec.ts`, `documents.controller.spec.ts`) cobrindo ownership RBAC e integração com UploadThing, e testes de integração (`documents.integration.spec.ts`) com supertest validando permissões JWT para todos os cargos.

## [0.3.0] - 2026-07-14

### Adicionado

- **Refatoração Modular de Funcionários**: Reestruturação do modelo `Employee` no banco de dados, separando os dados em tabelas correlacionadas `1:1` e `1:N` para otimizar desempenho (`employee_personal_data`, `employee_addresses`, `employee_bank_accounts` e `emergency_contacts`).
- **Validação com Algoritmo de CPF**: Validador algorítmico personalizado de CPF em NestJS que rejeita números repetidos ou inválidos matematicamente.
- **CRUD e API de Funcionários**: Endpoints transacionais `/employees` completos, protegidos por RBAC (`ADMIN`, `HR`, `MANAGER`) e decorados com dados ricos para Swagger.
- **Suíte de Testes para Funcionários**: Testes unitários (`employees.service.spec.ts`, `employees.controller.spec.ts`) e testes de integração de ponta a ponta (`employees.integration.spec.ts`).
- **Documentação de Funcionários**: Criação do guia `docs/employees.md` detalhando as relações de banco e acessos RBAC.

- **Módulo de Departamentos (Backend)**: Implementado o CRUD completo (`Department`) no NestJS com validações no payload (`class-validator`), segurança baseada em cargos (RBAC) e DTOs de erros específicos para documentação da API.
- **Workflow de Soft-Restore**: Lógica inteligente capaz de restaurar departamentos logicamente deletados em vez de violar chaves únicas do banco.
- **Testes Unitários de Departamentos**: Cobertura robusta de testes para `DepartmentsService` e `DepartmentsController`.
- **Módulo de Cargos (Backend)**: Implementado o CRUD completo (`Position`) no NestJS com restrições e faixas salariais, reativação via Soft-Restore, validação de unicidade de título dentro do mesmo departamento, segurança RBAC e documentação com DTOs granulares.
- **Testes Unitários de Cargos**: Bateria de testes Jest para `PositionsService` e `PositionsController`.

## [0.2.2] - 2026-07-13

### Corrigido

- **Queda do Backend por Conexão Ociosa**: Adicionado tratamento de erro (`pool.on("error")`) no pool de conexões do `pg` no `PrismaService` para evitar crash do backend do NestJS quando conexões do banco caem.
- **Feedback de Login no Frontend**: Adicionado log de erros no console e tratamento específico de erros de rede/conexão na página de login, apresentando uma mensagem descritiva caso o servidor esteja fora do ar.
- **Cintilação de Tema (Flash de Modo Claro)**: Introduzido script bloqueante inline no `<head>` do layout raiz para resolver a cintilação do tema ao atualizar a página e garantir a aplicação correta do tema escuro nas telas de login e cadastro.

### Adicionado

- **Suíte de Testes no Frontend**: Configuração do Vitest, React Testing Library e MSW para testes de unidade e integração no front-end, com testes adicionais cobrindo força de senha, e-mail duplicado e alternância de exibição de senha.
- **Testes E2E com Playwright**: Estruturação de testes de navegador de ponta a ponta (E2E) cobrindo fluxos de login com sucesso/falha interceptados com `page.route`, e usabilidade.
- **Garantia de Qualidade no Pre-commit**: Configurado Git hook do Husky para executar automaticamente os testes rápidos de integração front-end (`vitest`) junto com os testes do backend antes de cada commit.
- **Diretriz de Código Limpo**: Adicionada nova regra em `.agents/AGENTS.md` restringindo o uso de comentários explicativos/redundantes no código.
- **Migração do Banco de Dados**: Adicionado campo `description` opcional e relacionamento de gerente (`manager`) no modelo `Department` no Prisma schema e executada a migração do banco de dados correspondente.

### Alterado

- **Redirecionamento Pós-Login**: Usuários que tentam acessar rotas privadas sem autenticação agora são redirecionados de volta à rota original após o login bem-sucedido (utilizando parâmetro `?redirect` na URL).
- **Navegação Client-side no Fluxo de Autenticação**: Substituídos links `<a>` por `<Link>` do Next.js nas páginas de login e registro, permitindo transições instantâneas sem recarregamento de página.

## [0.2.0] - 2026-07-13

### Adicionado

- **Autenticação JWT Completa**: Implementação de fluxos de login (`POST /auth/login`), cadastro (`POST /auth/register`), renovação de tokens via cookies seguros (`POST /auth/refresh`) e encerramento de sessão (`POST /auth/logout`).
- **Armazenamento Seguro de Tokens**: Injeção do `refreshToken` em cookies HTTP-only, secure e same-site no backend, mantendo o `accessToken` apenas em memória no cliente para mitigar ataques XSS.
- **Validação de Força de Senha**: Regras granulares integradas ao DTO de registro exigindo letras maiúsculas, minúsculas, dígitos e símbolos.
- **Proteção contra Brute Force (Account Lockout)**: Lógica no banco de dados bloqueando temporariamente contas após 5 tentativas de login incorretas (10 minutos de bloqueio) e 10 tentativas (30 minutos de bloqueio).
- **Limitador de Requisições (Rate Limiting)**: Registro global do `ThrottlerGuard` com regras de baseline (100 requisições/min) e regras restritivas para autenticação (10 requisições/min por IP).
- **Filtro de Exceções Global**: Tratamento centralizado de erros (`AllExceptionsFilter`) retornando respostas JSON amigáveis e stack traces detalhados apenas em modo de desenvolvimento.
- **Controle de Acesso Baseado em Cargos (RBAC)**: Criação do decorador `@Roles()` e do `RolesGuard` integrado à injeção do `Reflector` do NestJS para autorizar rotas seletivamente.
- **Validação de Variáveis de Ambiente**: Integração de esquema de validação estrita com Zod no startup da API, garantindo que o servidor crashe no boot caso parâmetros de configurações do JWT ou URL do Postgres estejam incorretos ou ausentes.
- **Testes Unitários de Autenticação**: Cobertura de 100% de testes unitários Jest para `AuthService` e `AuthController` simulando fluxos com dados mockados de forma isolada.
- **Transpilador SWC nos Testes**: Substituição do `ts-jest` pelo `@swc/jest` para suporte ao TypeScript 7 e ganho dramático na velocidade de execução dos testes.
- **Git Hooks de Pré-commit**: Configuração do Husky local para executar automaticamente a bateria de testes de API e linter a cada tentativa de commit local, bloqueando commits caso ocorra falha.
- **Integração Contínua (CI)**: Configuração do workflow GitHub Actions em `.github/workflows/ci.yml` para compilar e testar toda a aplicação a cada push/pull request na branch master.
- **Autenticação no Frontend**: Interface premium para cadastro `/register` e login `/login` com validações React Hook Form + Zod e indicador visual de força de senha.
- **Bootstrapping de Sessão e Interceptador HTTP**: Mecanismo de persistência que faz refresh silencioso de sessão via cookie em background em caso de expiração ou boot do app sem interromper o fluxo do usuário.
- **Roteamento Protegido e RBAC no Frontend**: Guard de rotas no Next.js impedindo acesso a páginas privadas por usuários deslogados e suporte preliminar à renderização condicional baseada no cargo (`UserRole`).

### Alterado

- **CORS e Middleware de Segurança**: Ajuste nas políticas de Content Security Policy (CSP) do Helmet para permitir que o Scalar API Docs carregue corretamente recursos visuais de CDN externos.
- **Estrutura de Rotas do Frontend**: Substituição de componentes de teste da landing page por um layout de painel limpo e preparado para a integração de dados dinâmicos.

---

## [0.2.1] - 2026-07-13

### Alterado

- **Restrição de Layout (Layout Constraint)**: Adicionada a restrição `max-w-[110rem]` ao contêiner principal de layout e atualizada a sidebar para usar `variant="inset"`, garantindo o respeito ao limite de largura máxima em telas grandes.
- Atualizados os arquivos `page.tsx` e `app-sidebar.tsx` para refletir o novo comportamento de layout.

### Adicionado

- **Setup do Monorepo**: Estrutura profissional baseada em Turborepo, pnpm Workspaces, Next.js 16/Turbopack no frontend e NestJS 11 no backend.
- **Banco de Dados Local**: Configuração de container Docker PostgreSQL e modelagem das entidades iniciais (`User`, `Employee`, `AuditLog`, etc.) via Prisma 7.
- **Adapter Nativo do Postgres**: Integração do driver `@prisma/adapter-pg` e `pg` com injeção do Pool de conexões do Node no Prisma.
- **Internacionalização**: Estrutura do `next-intl` integrada ao Next.js 16 para suportar rotas e traduções dinâmicas multi-idiomas.
- **Compatibilidade TypeScript 7**: Adaptação de tsconfigs globais e exclusão de parâmetros desatualizados (como `baseUrl`) para adequar todos os pacotes à versão mais recente do TypeScript.
