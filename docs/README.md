# 📖 Central de Documentação - Atlas HRMS

Bem-vindo à central de documentação técnica do **Atlas HRMS**, o sistema de gestão de recursos humanos corporativo. Este diretório reúne todas as especificações técnicas, guias de infraestrutura e padrões de arquitetura necessários para o desenvolvimento, manutenção e validação da plataforma.

---

## 🚀 Sobre o Projeto

O **Atlas HRMS** é construído sob uma arquitetura de monorepo estruturada para suportar múltiplos workspaces de forma integrada. O objetivo principal do projeto é oferecer um painel administrativo completo e altamente seguro para operações de RH, controle de funcionários, gestão de férias, recrutamentos e notificações.

---

## 🗺️ Índice de Documentações Técnicas

Navegue pelos módulos de documentação abaixo para obter informações detalhadas sobre áreas específicas do projeto:

### 🏛️ [Arquitetura do Sistema](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/architecture.md)

_Entenda a estrutura organizacional e o fluxo de dados da aplicação._

- **Escopo**: Explicação sobre a organização em Monorepo orientada por **Turborepo** e a partição entre a Web App (`apps/web` em Next.js) e o Servidor de API (`apps/api` em NestJS).
- **Decisões Tecnológicas**: Detalhamento do ecossistema técnico e dos pacotes compartilhados em `packages/`.
- **Diagramas de Fluxo**: Diagrama visual que exemplifica o tráfego de requisições de ponta a ponta (Cliente ↔ Servidor ↔ Banco de Dados).

### 🗄️ [Modelagem de Banco de Dados](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/database.md)

_Consulte o esquema de tabelas e as relações de dados do domínio._

- **Esquema de Relações (ER)**: Diagrama completo de Entidade-Relacionamento no formato **Mermaid** mostrando chaves primárias, estrangeiras e cardinalidade (1:1, 1:N).
- **Dicionário do Schema**: Descrição dos modelos de dados fundamentais (`User`, `Employee`, `AuditLog`, `Department`, `Vacation`, `Document`, `Recruitment`, `Notification`).
- **Enums Globais**: Definição exata das constantes de status do sistema (como `UserRole` e `EmployeeStatus`).

### 🔐 [Autenticação, Segurança e Permissões](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/authentication.md)

_O coração das diretrizes de conformidade e segurança do Atlas HRMS._

- **Fluxo JWT Híbrido**: Como o sistema protege os dados usando tokens de curta duração na memória do cliente e cookies HTTP-only de alta segurança para renovação (`Set-Cookie` com flags `Secure`, `HttpOnly`, `SameSite=Strict`).
- **Lógica de Lockout (Força Bruta)**: Parâmetros detalhados que bloqueiam temporariamente contas de usuários (10 ou 30 minutos) após repetidas tentativas falhas de login.
- **RBAC (Role Based Access Control)**: Restrição de rotas automatizada usando o `RolesGuard` integrado à injeção de metadata do NestJS.
- **Rate Limiting e Audit Trail**: Funcionamento do limite global contra DoS e a geração automática de logs de segurança.

### 🧪 [Testes e CI/CD](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/cicd-testing.md)

_Garantia de estabilidade da plataforma em ambientes locais e de nuvem._

- **Stack de Testes**: Como Jest, Supertest, `@nestjs/testing` e `@swc/jest` são configurados na API.
- **Git Hooks locais (Husky)**: Configurações de pré-commit para validar formatação (Prettier), regras de estilo (ESLint) e execução de testes obrigatórios antes de registrar alterações no Git.
- **Integração Contínua**: Guia completo sobre o pipeline do GitHub Actions executando no Node 24 (detalhando compilação com Webpack privado e bypass de linter no CI).

---

## 🛠️ Como Utilizar Esta Documentação

1. **Leitura Sequencial**: Se você é um desenvolvedor recém-chegado ao projeto, comece pela [Arquitetura](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/architecture.md) e siga para o guia de [Banco de Dados](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/database.md).
2. **Atualização de Regras**: Lembre-se de manter estes guias sempre atualizados ao modificar tabelas do Prisma, fluxos de autenticação ou mudar dependências na esteira de integração.
