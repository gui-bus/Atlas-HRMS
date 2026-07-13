# Changelog

Todos os registros de alterações relevantes para este projeto serão documentados neste arquivo, seguindo as diretrizes do padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e aderindo ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [0.2.0] - 2026-07-13

### Adicionado

- **Autenticação JWT Completa**: Implementação de fluxos de login (`POST /auth/login`), cadastro (`POST /auth/register`), renovação de tokens via cookies seguros (`POST /auth/refresh`) e encerramento de sessão (`POST /auth/logout`).
- **Armazenamento Seguro de Tokens**: Injeção do `refreshToken` em cookies HTTP-only, secure e same-site no backend, mantendo o `accessToken` apenas em memória no cliente para mitigar ataques XSS.
- **Validação de Força de Senha**: Regras granulares integradas ao DTO de registro exigindo letras maiúsculas, minúsculas, dígitos e símbolos.
- **Proteção contra Brute Force (Account Lockout)**: Lógica no banco de dados bloqueando temporariamente contas após 5 tentativas de login incorretas (10 minutos de bloqueio) e 10 tentativas (30 minutos de bloqueio).
- **Limitador de Requisições (Rate Limiting)**: Registro global do `ThrottlerGuard` com regras de baseline (100 requisições/min) e regras restritivas para autenticação (10 requisições/min por IP).
- **Filtro de Exceções Global**: Tratamento centralizado de erros (`AllExceptionsFilter`) retornando respostas JSON amigáveis e stack traces detalhados apenas em modo de desenvolvimento.

### Alterado

- **CORS e Middleware de Segurança**: Ajuste nas políticas de Content Security Policy (CSP) do Helmet para permitir que o Scalar API Docs carregue corretamente recursos visuais de CDN externos.
- **Estrutura de Rotas do Frontend**: Substituição de componentes de teste da landing page por um layout de painel limpo e preparado para a integração de dados dinâmicos.

---

## [0.1.0] - 2026-07-13

### Adicionado

- **Setup do Monorepo**: Estrutura profissional baseada em Turborepo, pnpm Workspaces, Next.js 16/Turbopack no frontend e NestJS 11 no backend.
- **Banco de Dados Local**: Configuração de container Docker PostgreSQL e modelagem das entidades iniciais (`User`, `Employee`, `AuditLog`, etc.) via Prisma 7.
- **Adapter Nativo do Postgres**: Integração do driver `@prisma/adapter-pg` e `pg` com injeção do Pool de conexões do Node no Prisma.
- **Internacionalização**: Estrutura do `next-intl` integrada ao Next.js 16 para suportar rotas e traduções dinâmicas multi-idiomas.
- **Compatibilidade TypeScript 7**: Adaptação de tsconfigs globais e exclusão de parâmetros desatualizados (como `baseUrl`) para adequar todos os pacotes à versão mais recente do TypeScript.
