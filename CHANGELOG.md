# Changelog

Todos os registros de alterações relevantes para este projeto serão documentados neste arquivo, seguindo as diretrizes do padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e aderindo ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [0.2.2] - 2026-07-13

### Corrigido

- **Queda do Backend por Conexão Ociosa**: Adicionado tratamento de erro (`pool.on("error")`) no pool de conexões do `pg` no `PrismaService` para evitar crash do backend do NestJS quando conexões do banco caem.
- **Feedback de Login no Frontend**: Adicionado log de erros no console e tratamento específico de erros de rede/conexão na página de login, apresentando uma mensagem descritiva caso o servidor esteja fora do ar.
- **Cintilação de Tema (Flash de Modo Claro)**: Introduzido script bloqueante inline no `<head>` do layout raiz para resolver a cintilação do tema ao atualizar a página e garantir a aplicação correta do tema escuro nas telas de login e cadastro.

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

- **Layout Constraint**: Added `max-w-[110rem]` constraint to primary layout container and updated sidebar to use `variant="inset"` ensuring it respects the max width on large screens.
- Updated `page.tsx` and `app-sidebar.tsx` to reflect new layout behavior.

### Adicionado

- **Setup do Monorepo**: Estrutura profissional baseada em Turborepo, pnpm Workspaces, Next.js 16/Turbopack no frontend e NestJS 11 no backend.
- **Banco de Dados Local**: Configuração de container Docker PostgreSQL e modelagem das entidades iniciais (`User`, `Employee`, `AuditLog`, etc.) via Prisma 7.
- **Adapter Nativo do Postgres**: Integração do driver `@prisma/adapter-pg` e `pg` com injeção do Pool de conexões do Node no Prisma.
- **Internacionalização**: Estrutura do `next-intl` integrada ao Next.js 16 para suportar rotas e traduções dinâmicas multi-idiomas.
- **Compatibilidade TypeScript 7**: Adaptação de tsconfigs globais e exclusão de parâmetros desatualizados (como `baseUrl`) para adequar todos os pacotes à versão mais recente do TypeScript.
