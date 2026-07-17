# 📖 Sumário de Documentação Técnica - Atlas HRMS

Este arquivo reúne todas as especificações técnicas, guias de infraestrutura e padrões de arquitetura necessários para o desenvolvimento, manutenção e validação da plataforma.

---

## 🗺️ Índice de Documentações Técnicas

Navegue pelos módulos de documentação abaixo para obter informações detalhadas sobre áreas específicas do projeto:

### 🏛️ [Arquitetura do Sistema](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/architecture.md)
_Entenda a estrutura organizacional e o fluxo de dados da aplicação._
- **Escopo**: Explicação sobre a organização em Monorepo orientada por **Turborepo** e a partição entre a Web App (`apps/web` em Next.js) e o Servidor de API (`apps/api` em NestJS).
- **Decisões Tecnológicas**: Detalhamento do ecossistema técnico e dos pacotes compartilhados em `packages/`.
- **Diagramas de Fluxo**: Diagrama visual que exemplifica o tráfego de requisições de ponta a ponta (Cliente ↔ Servidor ↔ Banco de Dados).

### 🗄️ [Modelagem de Banco de Dados](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/database.md)
_Consulte o esquema de tabelas e as relações de dados do domínio._
- **Esquema de Relações (ER)**: Diagrama completo de Entidade-Relacionamento no formato **Mermaid** mostrando chaves primárias, estrangeiras e cardinalidade (1:1, 1:N).
- **Dicionário do Schema**: Descrição dos modelos de dados fundamentais (`User`, `Employee`, `AuditLog`, `Department`, `Vacation`, `Document`, `Recruitment`, `Notification`).
- **Enums Globais**: Definição exata das constantes de status do sistema (como `UserRole` e `EmployeeStatus`).

### 🏢 [Estrutura Organizacional](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/organization.md)
_Consulte la hierarquia corporativa e o funcionamento do módulo de departamentos._
- **Modelo de Atributos**: Definição detalhada dos campos, chaves e relacionamentos de departamentos.
- **Workflow de Soft-Restore**: Descrição técnica e diagrama Mermaid mostrando a reativação de departamentos.
- **Regras de RBAC**: Restrições aplicadas nas rotas do CRUD organizacional.

### 💼 [Gestão de Cargos](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/positions.md)
_Consulte a modelagem, faixas salariais e regras de cargos (Positions)._
- **Atributos de Faixa Salarial**: Validações de salário mínimo e máximo.
- **Unicidade de Cargo**: Restrição de cargo único dentro de um mesmo departamento.
- **Restauração Inteligente**: Reativação de registros de cargos deletados.
- **Regras de RBAC**: Acesso restrito a cargos para Administradores e RH.

### 🔐 [Autenticação, Segurança e Permissões](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/authentication.md)
_O coração das diretrizes de conformidade e segurança do Atlas HRMS._
- **Fluxo JWT Híbrido**: Como o sistema protege os dados usando tokens de curta duração na memória do cliente e cookies HTTP-only de alta segurança para renovação (`Set-Cookie` com flags `Secure`, `HttpOnly`, `SameSite=Strict`).
- **Lógica de Lockout (Força Bruta)**: Parâmetros detalhados que bloqueiam temporariamente contas de usuários (10 ou 30 minutos) após repetidas tentativas falhas de login.
- **RBAC (Role Based Access Control)**: Restrição de rotas automatizada usando o `RolesGuard` integrado à injeção de metadata do NestJS.
- **Rate Limiting e Audit Trail**: Funcionamento do limite global contra DoS e a geração automática de logs de segurança.

### 🧪 [Testes e CI/CD](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/cicd-testing.md)
_Garantia de estabilidade da plataforma em ambientes locais e de nuvem._
- **Stack de Testes**: Como Jest, Supertest, `@nestjs/testing` e `@swc/jest` são configurados na API.
- **Git Hooks locais (Husky)**: Configurações de pré-commit para validar formatação (Prettier), regras de estilo (ESLint) e execução de testes obrigatórios antes de registrar alterações no Git.
- **Integração Contínua**: Guia completo sobre o pipeline do GitHub Actions executando no Node 24 (detalhando compilação com Webpack privado e bypass de linter no CI).

### 🗂️ [Módulo de Documentos](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/documents.md)
_Consulte as regras de upload direct-to-cloud e deleção do UploadThing._
- **Upload e Exclusão**: Processo assíncrono para apagar arquivos órfãos na nuvem via `UploadthingService`.
- **Controle de Acesso**: Trava RBAC para visualização privada de arquivos pessoais.

### 📢 [Recrutamento e ATS](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/recruitment.md)
_Entenda a estrutura de candidaturas públicas, portal de carreiras e admissão do funcionário._
- **Portal Público (Careers)**: Listagem e aplicação de currículos via multipart sem necessidade de autenticação.
- **Pipeline Completo**: Etapas seletivas detalhadas.
- **Conversão Automática**: Como uma candidatura aceita gera o perfil do funcionário (`Employee`) no banco.

### 📋 [Auditoria do Sistema](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/audit.md)
_Entenda o sistema de Audit Trail e como rastrear ações do sistema._
- **Endpoint Protegido**: Acesso restrito a `ADMIN` e `HR` via `AuthGuard` + `RolesGuard`.
- **Ações Tipadas**: Enum centralizado `AuditAction` com 7 ações rastreáveis.
- **Fluxo RBAC**: Diagrama de decisão para controle de acesso aos logs.

### 📊 [Dashboard de Métricas](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/dashboard.md)
_Consulte os agregadores e o funcionamento do painel consolidado do RH._
- **Endpoint Agregador**: Consolidação de 9 queries de contagem rodando em paralelo no Postgres via `Promise.all`.
- **RBAC**: Acesso restrito a `ADMIN`, `HR` e `MANAGER`.

### 🔔 [Notificações Internas](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/notifications.md)
_Consulte o ecossistema de disparo e consumo de notificações internas._
- **Filtro de Leitura**: Mapeamento do usuário autenticado no token JWT via `@CurrentUser()`.
- **RBAC**: Permissão de criação restrita a `ADMIN` e `HR`. Donos podem marcar como lidas.

### 🏖️ [Férias e Licenças](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/vacations-leaves.md)
_Consulte o regulamento do ciclo de férias CLT e afastamentos/atestados._
- **Período Aquisitivo**: Regra mínima de 1 ano completo de tempo de empresa para liberação de solicitações.
- **Atestados Legais**: Upload de comprovantes médicos e suporte a tipos customizados de afastamento.

### ⏰ [Controle de Ponto e Saldo](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/time-attendance.md)
_Consulte o funcionamento da marcação de horários de jornada e banco de horas._
- **Saldo Acumulado**: Registro de saldo de horas trabalhadas versus jornada padrão com controle de banco.
- **Ajustes e Correções**: Processamento de aprovação de inconsistências e justificativas por gestores.

### ☁️ [Integração UploadThing](https://github.com/gui-bus/Atlas-HRMS/blob/master/docs/uploadthing.md)
_Consulte os fluxos de integração de arquivos direto na nuvem._
- **Bucket Remoto**: Estrutura de storage e remoção limpa de arquivos órfãos via SDK do UploadThing.
- **API Wrapper**: Middleware NestJS para persistência de tokens e validações de tamanho de payloads.
