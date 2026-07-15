# 🔐 Autenticação, Segurança e Permissões

Esta seção documenta a arquitetura de segurança, autenticação e controle de privilégios implementada no **Atlas HRMS**.

---

## 🔑 Estratégia de Tokens JWT

Para garantir alta segurança e mitigar riscos de ataques XSS (Cross-Site Scripting) e CSRF (Cross-Site Request Forgery), adotamos a divisão de responsabilidade de tokens:

```mermaid
sequenceDiagram
    participant WebApp as Web App (Cliente)
    participant API as API Server (NestJS)

    WebApp->>API: POST /auth/login (Credenciais)
    Note over API: Valida credenciais e gera tokens
    API-->>WebApp: Retorna AccessToken (JSON body) + Injeta RefreshToken (Cookie HTTP-Only)
    Note over WebApp: Armazena AccessToken na memória local (React State)
    Note over WebApp: Cookies injetados automaticamente nas chamadas futuras
```

### 1. Access Token (`accessToken`)

- **Tempo de Expiração**: 15 minutos (curto ciclo de vida).
- **Armazenamento**: Mantido estritamente na **memória da aplicação** (React state/Zustand) no frontend. Nunca deve ser salvo no `localStorage` ou `sessionStorage`, eliminando a exposição a scripts maliciosos (XSS).

### 2. Refresh Token (`refreshToken`)

- **Tempo de Expiração**: 7 dias (longo ciclo de vida).
- **Armazenamento**: Injetado pelo servidor via cabeçalho `Set-Cookie` com as seguintes flags de segurança:
  - `HttpOnly`: Impede o acesso ao cookie via código JavaScript no cliente.
  - `Secure`: Garante que o cookie só seja trafegado por conexões seguras HTTPS (em desenvolvimento, aceita HTTP).
  - `SameSite=Strict`: Restringe o envio do cookie apenas para requisições que se iniciem no mesmo domínio, mitigando ataques de CSRF.
  - `Path=/auth/refresh`: O cookie é enviado pelo navegador exclusivamente para a rota de atualização, protegendo as demais rotas da API.

---

## 🧱 Mitigação de Ataques de Força Bruta (Account Lockout)

O sistema conta com proteção nativa contra ataques automatizados de adivinhação de senhas bloqueando temporariamente a conta de forma gradativa com base no número de tentativas inválidas consecutivas (`failedAttempts`):

| Tentativas Falhas | Ação Executada                          | Duração do Bloqueio              |
| :---------------- | :-------------------------------------- | :------------------------------- |
| **Até 4**         | Login rejeitado; contador incrementado. | Sem bloqueio.                    |
| **5 a 9**         | Conta é bloqueada temporariamente.      | **10 minutos** (`lockoutUntil`). |
| **10 ou mais**    | Bloqueio temporário estendido.          | **30 minutos** (`lockoutUntil`). |

_Nota: O contador de tentativas falhas é zerado imediatamente após um login bem-sucedido._

---

## 🚦 Limitador de Requisições (Rate Limiting)

Para evitar negação de serviço (DoS) e abuso das rotas sensíveis, o `ThrottlerGuard` é aplicado globalmente na API NestJS:

- **Baseline Global**: Máximo de **100 requisições** a cada **1 minuto** por endereço IP.
- **Rotas de Autenticação (`AuthModule`)**: Regra restritiva adicional permitindo no máximo **10 requisições** a cada **1 minuto** por IP para endpoints como login, registro e refresh.

---

## 🛡️ Controle de Acesso Baseado em Cargos (RBAC)

O controle de autorização é implementado através do decorador `@Roles()` combinado ao interceptor `RolesGuard` no NestJS:

```typescript
// Exemplo de rota restrita para Administradores ou Recursos Humanos
@Post('employee')
@Roles(UserRole.ADMIN, UserRole.HR)
@UseGuards(JwtAuthGuard, RolesGuard)
async createEmployee(@Body() dto: CreateEmployeeDto) {
  return this.employeeService.create(dto);
}
```

O `RolesGuard` lê o token JWT decodificado do usuário (`req.user.role`) e compara com as permissões exigidas no metadata da rota usando o `Reflector`. Caso o usuário não tenha o nível de cargo necessário, o servidor retorna automaticamente `403 Forbidden`.

---

## 📝 Logs de Auditoria (`AuditLog`)

Todas as ações críticas no ciclo de vida de autenticação e segurança são persistidas na tabela `audit_logs` pelo serviço `AuditService`:

- **Registro de Contas**: Loga a criação de novos usuários no sistema.
- **Logins com Sucesso**: Loga a entrada de usuários, permitindo histórico de logins.
- **Logins Falhos**: Registra cada tentativa inválida indicando o e-mail alvo.
- **Bloqueio de Contas (Lockout)**: Emite um log de alerta informando quando e por quanto tempo um usuário foi bloqueado.

---

## 💻 Integração e Fluxo no Frontend (Web App)

O front-end (`@atlas/web`) foi projetado de forma coesa com a API NestJS, utilizando as melhores práticas de segurança e de gerenciamento de sessão.

### 1. Gerenciamento de Estado de Autenticação (`useAuthStore`)

- **Tecnologia**: Zustand.
- **Funcionamento**: Centraliza as informações do usuário autenticado e o `accessToken` ativo em memória volátil.
- **Segurança**: O token de acesso **nunca** é persistido no `localStorage` ou `sessionStorage`, eliminando a superfície de ataques XSS.

### 2. Fluxo de Renovação de Sessão (Silent Refresh)

Para manter o usuário autenticado sem comprometer a segurança:

1. Ao inicializar o aplicativo, o front-end realiza uma chamada silenciosa para `POST /auth/refresh`.
2. Como o `refreshToken` reside no cookie seguro `HttpOnly`, o navegador o trafega de forma automática e segura.
3. Se válido, a API emite um novo `accessToken`, populando a store do Zustand.
4. Caso o refresh falhe ou expire, o estado do Zustand é reiniciado e o usuário é redirecionado ao login.

### 3. Proteção de Rotas (Guards de Autenticação)

As rotas são protegidas no Next.js com o wrapper do `AuthProvider`:

- Tentativas de acesso direto a rotas privadas sem autenticação ativa acionam o redirecionamento para o login injetando a query `?redirect=/caminho/original`.
- Após a autenticação bem-sucedida, o usuário é retornado automaticamente à página de destino pretendida.
- Os fluxos de transição utilizam navegação nativa do Next.js via componente `<Link>`, garantindo maior agilidade.

### 4. Sincronia de Tema nas Telas de Autenticação

- Para impedir cintilações visuais (flash do modo claro) ao acessar `/login` ou `/register` em modo escuro, o tema é lido síncronamente do `localStorage` e injetado diretamente como classe `.dark` via script no `<head>` do layout raiz.
- Isso previne inconsistências de estilo no lado do cliente independentemente do estado da sessão do usuário.

---

## 🔐 Novas Funcionalidades de Polimento

### 1. Rota de Restauração de Sessão (`GET /auth/me`)

Permite que o frontend recupere o perfil do usuário logado decodificando o token do cabeçalho `Authorization: Bearer <token>`. Retorna informações essenciais:

- ID, e-mail e cargo (Role).
- Foto do perfil (`avatarUrl`) mapeada diretamente do `EmployeePersonalData`.

### 2. Recuperação de Senha via Resend

Fluxo completo de alteração segura de senhas esquecidas:

- **Solicitação (`POST /auth/forgot-password`)**: Gera um token hexadecimal criptograficamente seguro e data de expiração de 15 minutos. Envia as instruções e o token via e-mail utilizando a plataforma **Resend**.
- **Redefinição (`POST /auth/reset-password`)**: Valida o token, atualiza o hash da senha (bcrypt), limpa os metadados do token temporário, reinicia contadores de tentativas falhas e registra a alteração em logs de auditoria.
