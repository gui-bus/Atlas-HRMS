# 🗺️ Atlas HRMS — Sistema de Gestão de Pessoas e ATS Corporativo

O **Atlas HRMS** é um ecossistema corporativo completo de gerenciamento de recursos humanos e rastreamento de candidatos (ATS - Applicant Tracking System). Projetado sobre uma arquitetura de monorepo moderna e escalável, o sistema integra de ponta a ponta as rotinas operacionais de departamento pessoal, ponto eletrônico digital com banco de horas, gerenciamento de ausências por conformidade CLT, controle de cargos/departamentos estruturados e um portal público de vagas integrado.

Este repositório foi construído para servir como uma referência técnica de código limpo, aplicação estrita de segurança corporativa, testes automatizados e design system premium.

---

## 🛠️ Tecnologias Utilizadas

<div align="center">
  <img alt="TypeScript" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Typescript.svg" title="TypeScript">
  <img alt="NodeJS" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NodeJS.svg" title="Node.js">

  <img alt="Next.js" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NextJS.svg" title="Next.js">
  <img alt="React" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/React.svg" title="React">
  <img alt="TailwindCSS" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/TailwindCSS.svg" title="TailwindCSS">
  <img alt="Shadcn/UI" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/ShadcnUI.svg" title="Shadcn/UI">
  <img alt="React Query" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/ReactQuery.svg" title="React Query / TanStack Query">
  <img alt="Zustand" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Zustand.svg" title="Zustand">
  <img alt="Phosphor Icons" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Phosphor%20Icons.svg" title="Phosphor Icons">
  <img alt="Zod" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Zod.svg" title="Zod">
  <img alt="nuqs" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/nuqs.svg" title="nuqs">
  <img alt="React Hook Form" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/React%20Hook%20Form.svg" title="React Hook Form">
  <img alt="next-intl" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/nextintl.svg" title="next-intl">

  <img alt="NestJS" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/NestJS.svg" title="NestJS">
  <img alt="Prisma" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/PrismaORM.svg" title="Prisma ORM">
  <img alt="PostgreSQL" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Postgresql.svg" title="PostgreSQL">
  <img alt="JWT" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/JWT.svg" title="JSON Web Tokens (JWT)">
  <img alt="Axios" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Axios.svg" title="Axios">
  <img alt="UploadThing" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Uploadthing.svg" title="UploadThing">
  <img alt="Resend" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Resend.svg" title="Resend Email Service">
  <img alt="Scalar" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Scalar.svg" title="Scalar API Docs / Swagger">

  <img alt="Turborepo" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Turborepo.svg" title="Turborepo">
  <img alt="pnpm" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/pnpm.svg" title="pnpm">
  <img alt="GIT" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/GIT.svg" title="Git">
  <img alt="Github" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Github.svg" title="GitHub">

  <img alt="Jest" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Jest.svg" title="Jest">
  <img alt="Vitest" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Vitest.svg" title="Vitest">
  <img alt="Playwright" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Playwright.svg" title="Playwright (E2E Testing)">
  <img alt="ESLint" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/ESLint.svg" title="ESLint">
  <img alt="Prettier" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Prettier.svg" title="Prettier">
  <img alt="Husky" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Husky.svg" title="Husky">
  <img alt="Github Actions" height="50" width="50" src="https://github.com/gui-bus/TechIcons/blob/main/Dark/Github%20Actions.svg" title="GitHub Actions">
</div>

---

## 🏛️ Arquitetura do Sistema e Monorepo

O projeto está estruturado como um monorepo gerenciado pelo **Turborepo**, permitindo compilações paralelas otimizadas, cache remoto de etapas de build e compartilhamento dinâmico de tipos de domínio:

```mermaid
flowchart TD
    subgraph Monorepo [Turborepo Workspaces]
        A["apps/web (Next.js App)"]
        B["apps/api (NestJS API Server)"]
        C["packages/types (Shared Typings)"]
        D["packages/tsconfig (Global TS Configs)"]
        E["packages/eslint-config (ESLint Configs)"]
    end
    A -->|Importa tipos compartilhados| C
    B -->|Importa tipos compartilhados| C
    A -->|Consome endpoints REST| B
```

---

## 🚀 Módulos e Detalhes Técnicos

### 1. Portal de Carreiras e ATS Integrado (Público & Privado)

- **Portal Público de Vagas**: Listagem responsiva em grid de 100% de largura, com filtros dinâmicos rápidos por **Senioridade**, **Modelo de Trabalho** e **Regime de Contratação**, sem necessidade de autenticação.
- **Formulário de Candidatura**: Envio de dados pessoais e upload assíncrono de currículos em formato PDF integrado diretamente à infraestrutura na nuvem via **UploadThing SDK**.
- **Quadro Kanban de Recrutamento (ATS)**: Interface interativa baseada em `@dnd-kit/core` permitindo mover candidatos entre as fases seletivas (`Triagem`, `Entrevista RH`, `Teste Técnico`, `Proposta`, `Contratado` ou `Recusado`) com atualizações otimistas no frontend e suporte a reversão (rollback) automática em caso de falhas na rede.
- **Conversão Automática**: A contratação de um candidato aceito transiciona automaticamente seus dados em um registro ativo de colaborador (`Employee`) vinculado ao cargo da vaga.

### ⏰ 2. Controle de Ponto Digital e Banco de Horas

- **Marcação Digital**: Registro eletrônico integrado de batidas diárias (Entrada, Almoço, Retorno, Saída) com captura de horário oficial do servidor.
- **Banco de Horas Automático**: Cálculo automático de saldos de jornada acumulada no banco de horas por colaborador.
- **Ajustes de Inconsistências**: Módulo administrativo protegido por RBAC permitindo que gestores aprovem ou recusem solicitações retroativas de correções de batidas feitas por colaboradores.

### 🏖️ 3. Gestão de Férias e Ausências por Conformidade

- **Controle Aquisitivo**: Trava de segurança que impede solicitações de férias para colaboradores com menos de 1 ano de tempo de serviço ativo.
- **Central de Atestados**: Fluxo de upload de justificativas médicas com comprovantes armazenados em storage na nuvem.

### 🏢 4. Estrutura de Cargos e Departamentos

- **Organograma Corporativo**: CRUD estruturado de setores organizacionais e definição hierárquica de cargos.
- **Unicidade de Cargo**: Trava no banco de dados impedindo nomes duplicados de cargos no mesmo departamento.
- **Workflow de Soft-Restore**: Mecanismo inteligente de segurança que reativa automaticamente vínculos de cargos e departamentos marcados como excluídos via soft-delete.

---

## 🔐 Segurança e Conformidade Corporativa

O Atlas HRMS foi projetado com rígidos padrões de segurança e compliance:

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário
    participant W as Web App (Next.js)
    participant A as API Server (NestJS)
    participant DB as Postgres Database

    U->>W: Insere Credenciais
    W->>A: POST /auth/login
    Note over A: Verifica Lockout por Tentativas Falhas
    A->>DB: Consulta hash de senha
    DB-->>A: Retorna Hash
    Note over A: Valida credenciais com Bcrypt
    A-->>W: Retorna AccessToken (em memória) e Set-Cookie RefreshToken (HTTP-only)
    Note over W: Sessão iniciada de forma híbrida e segura
```

- **Tokens JWT Híbridos**: O token de acesso (`AccessToken`) é guardado apenas em memória de curto prazo (variável de estado no cliente), enquanto o token de renovação (`RefreshToken`) é trafegado exclusivamente via **Cookie HTTP-only** com as flags de segurança ativas (`Secure`, `HttpOnly`, `SameSite=Strict`), bloqueando vulnerabilidades de XSS.
- **Lockout por Tentativas Falhas**: Bloqueio temporário e progressivo de login de contas de usuários (10 ou 30 minutos) após repetidas falhas de autenticação como proteção contra ataques de força bruta.
- **RBAC (Role Based Access Control)**: Restrição automatizada de endpoints baseada em funções (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`) injetadas via decorators e verificadas por guards no pipeline do NestJS.
- **Logs de Auditoria (Audit Trail)**: Rastreabilidade total de todas as ações de escrita executadas no banco de dados (ex: `EMPLOYEE_CREATED`, `VACATION_APPROVED`, `CANDIDATE_STATUS_CHANGED`), identificando usuário executor, IP e payload da mudança.

---

## 🧪 Qualidade de Código e CI/CD

- **Testes Automáticos**: Cobertura obrigatória de testes unitários (`.spec.ts`) e testes de integração com banco de dados em memória (`supertest`).
- **Garantia de Estilo e Padronização**: Linter (ESLint) e formatador de código (Prettier) integrados.
- **Git Hooks (Husky)**: Bloqueio local automático que impede commits se houver lints pendentes ou falhas em testes de integração executados em pre-commit.
- **GitHub Actions**: Workflow de CI integrado rodando build, lint e testes a cada Pull Request.

---

## 📚 Documentação Técnica Completa

Todas as especificações técnicas, diagramas adicionais e guias de infraestrutura detalhados do monorepo estão divididos nos seguintes artigos na pasta `/docs`:

### [📖 Sumário e Índice Técnico Geral (INDEX.md)](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/INDEX.md)

_Contém o mapa de todos os arquivos de documentação técnica do sistema._

### [🏛️ Arquitetura do Monorepo & Fluxos](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/architecture.md)

_Explicação detalhada sobre a estrutura em Monorepo, divisão de pacotes Turborepo e diagramas de fluxo de tráfego de dados entre cliente e servidor._

### [🗄️ Modelo de Entidade-Relacionamento e Dicionário de Banco de Dados](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/database.md)

_Diagrama de banco de dados interativo (Mermaid ER), cardinalidades, restrições e dicionário das tabelas e enums do PostgreSQL._

### [🔐 Autenticação JWT, Lockout de Segurança e RBAC](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/authentication.md)

_Explicação do fluxo JWT híbrido (Cookie HTTP-Only), algoritmo Bcrypt, lógica de proteção anti-força bruta (Lockout) e controle de permissões por perfil._

### [⏰ Módulo de Controle de Ponto Digital](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/time-attendance.md)

_Lógica de processamento de batidas diárias, cálculo e integração do banco de horas, e workflow de aprovação de ajustes pelos gestores._

### [🏖️ Módulo de Férias e Ausências CLT](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/vacations-leaves.md)

_Regras de conformidade do período aquisitivo de 1 ano para férias, envio e validação de atestados e afastamentos médicos legais._

### [📢 Estrutura de Candidaturas e Fluxo ATS](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/recruitment.md)

_Funcionamento do portal público de vagas, upload de currículos PDF na nuvem, transição de fases no Kanban e workflow de contratação de candidatos._
