# Changelog

Todos os registros de alterações relevantes para este projeto serão documentados neste arquivo, seguindo as diretrizes do padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e aderindo ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.8.2] - 2026-07-18

### Corrigido

- **Estabilidade de Sessão e Prevenção de Logouts na Navegação**:
  - **Zustand Persist**: Implementada a persistência de estado do `useAuthStore` no `localStorage` via middleware `persist` do Zustand. Isso impede que atualizações de página (F5) limpem os dados da sessão em memória, mantendo a autenticação ativa.
  - **Navegação Interna no Header**: Substituídas as tags HTML `<a>` por componentes `<Link>` do Next.js no `DesktopNav` e `MobileNav`. A navegação agora ocorre 100% via client-side (SPA), mantendo a integridade da store sem forçar reloads completos.
  - **Configuração Dinâmica do Cookie de Refresh**: A flag `secure` do cookie `refreshToken` agora é desabilitada no ambiente de desenvolvimento (`secure: false`) para permitir o envio correto sobre HTTP na comunicação local localhost cross-origin.
  - **Ordem de Resolução de Rotas (Vagas Administrativas)**: Reordenadas as rotas no `RecruitmentController` do NestJS para posicionar `GET /recruitments/admin` antes do wildcard `GET /recruitments/:slug`. Isso corrige a colisão de rotas onde `"admin"` era avaliado incorretamente como um slug público de vaga.
  - **Sintaxe de Diagramas Mermaid nos Docs**: Corrigidos erros de renderização nos diagramas Mermaid nos arquivos de documentação (`vacations-leaves.md` atualizado de `stateDiagram-Obj` para `stateDiagram-v2` e `notifications.md` simplificado para evitar conflitos de caracteres).

---

## [1.8.1] - 2026-07-18

### Corrigido

- **Quadro Kanban — Departamento exibindo "Sem Departamento"**: A rota `GET /recruitments/:id`, utilizada pelo painel administrativo para carregar os detalhes da vaga no Kanban, retornava o nome do departamento como um campo string flat (`departmentName`), enquanto o frontend consumia a propriedade como objeto aninhado (`vacancy.department?.name`). A propriedade sendo `undefined` fazia com que o texto de fallback "Sem Departamento" fosse exibido, mesmo para vagas com departamento associado.
  - **Backend** (`recruitment.service.ts` — `findBySlugPublic`): O retorno agora inclui o objeto aninhado `department: { name }` e `position: { title }`, além de manter `departmentName` e `positionTitle` para retrocompatibilidade.
  - **DTO** (`PublicRecruitmentResponseDto`): Documentados os novos campos `department` e `position` com `@ApiProperty()`.
  - **Testes** (`recruitment.service.spec.ts`): Mocks atualizados com `departmentId` e `positionId` para cobrir o novo contrato de retorno.
  - Todos os 247 testes de unidade e integração permanecem passando.

---

## [1.8.0] - 2026-07-17

### Adicionado

- **Quadro Kanban de Recrutamento**: A página de detalhes de uma vaga (`/recruitment/[id]`) foi completamente reescrita como um quadro Kanban funcional e interativo.
  - **Mudança de Fases por Botões**: Candidatos podem ser movidos entre as fases do funil (`SCREENING → HR_INTERVIEW → TECHNICAL_TEST → OFFER → HIRED → REJECTED`) através de setas direcionais nos cards.
  - **Atualizações Otimistas**: A interface atualiza imediatamente ao clicar nas setas, sem aguardar resposta do servidor. Em caso de erro, o estado é revertido automaticamente via mecanismo de rollback do TanStack Query.
  - **Sinalização Visual**: Cards compactos de fácil navegação com botões dedicados de controle e admissão direta.
- **Simplificação do Pipeline de Recrutamento (Backend & Frontend)**:
  - O enum `ApplicationStatus` do Prisma foi reduzido para incluir apenas os 6 estados essenciais: `SCREENING` (novo default), `HR_INTERVIEW`, `TECHNICAL_TEST`, `OFFER`, `HIRED` e `REJECTED`.
  - Remoção completa dos estados `SUBMITTED`, `TECHNICAL_INTERVIEW`, `FINAL_INTERVIEW`, `MANAGER_INTERVIEW` e `WITHDRAWN`.
  - Alinhamento de DTOs, mocks, testes de integração e seed do banco de dados na API.
- **Links de Portal Público de Vagas**:
  - Link de redirecionamento "Ver Portal de Vagas" integrado na seção "Funil de Recrutamento" do dashboard principal para administradores e RH.

### Alterado

- **Dashboard - Labels de Fases Traduzidos**: As labels das fases de candidatura na seção "Funil de Recrutamento" do dashboard (`stageLabels`) foram migradas de strings de texto hardcoded em português para chaves de internacionalização e reduzidas aos novos estágios simplificados.
- **Dashboard - Mensagem de Estado Vazio Traduzida**: A mensagem "Nenhuma candidatura ativa no momento." foi substituída por chave i18n (`noActiveApplications`).

### Internacionalização

- **Novo namespace `Recruitment.kanban`** (pt/en/es): `resumeLink`, `admit`, `admitting`, `notFound`, `funnelLabel`, `noDepartment`, `viewJobsPortal`, `portalLinkCopied`, `copyPortalLink`.
- **Novas chaves `Dashboard`** (pt/en/es): `viewJobsPortal`, `noActiveApplications`, `stageLabels.*` (cobre apenas as fases ativas no novo pipeline).

---

## [1.7.0] - 2026-07-17

### Adicionado

- **Componente Combobox (Shadcn/ui)**: Integração dos componentes popover e command do Shadcn/ui para disponibilizar um componente wrapper `<Combobox />` pesquisável.
- **Busca de Relações em Formulários**: Substituição do select tradicional de colaborador pelo novo Combobox interativo na tela de Envio de Documento (`documents/new/page.tsx`), e substituição dos selects de departamento e cargo na tela de Criação de Vagas (`recruitment/new/page.tsx`) e criação de Cargos (`positions/new/page.tsx`).

---

## [1.6.0] - 2026-07-17

### Adicionado

- **Ordenação Dinâmica no Backend (Server-side Sorting)**: Suporte à ordenação dinâmica adicionado às queries do Prisma para listagens paginadas (`page` e `limit`) através dos novos parâmetros globais `sortBy` e `sortOrder` em `QueryPaginationDto`.
- **Setas Interativas nas Colunas (Frontend Sorting)**: Atualização dos cabeçalhos das tabelas de Funcionários, Férias, Licenças, Quadro de Vagas, Departamentos, Cargos, Contas de Usuários e Documentos no frontend com setas de ordenação clicáveis e indicadores visuais (`CaretUp`, `CaretDown` e `CaretUpDown`) utilizando Phosphor Icons.
- **Componente PageHeader Reutilizável**: Criação e integração do componente `PageHeader` para padronizar os cabeçalhos de título, subtítulo e botões de ação nas listagens do sistema.
- **Componente FormHeader Reutilizável**: Criação e integração do componente `FormHeader` para padronizar os cabeçalhos de formulário (contendo botão de voltar, título, subtítulo e aviso de preenchimento obrigatório).
- **Componente FormActions Reutilizável**: Criação e integração do componente `FormActions` para padronizar as ações de rodapé (salvar/cancelar) com suporte a spinner de carregamento dinâmico.
- **Sincronização de Ordenação com a URL**: Estados de ordenação integrados à biblioteca `nuqs` para manter o estado atual refletido na URL e garantir consistência na paginação.
- **Remoção de Filtros Duplicados**: Correção dos cabeçalhos das tabelas para eliminar botões de ordenação redundantes (`ArrowsDownUp`) da primeira coluna, mantendo exclusivamente a ordenação dinâmica.

---

## [1.5.0] - 2026-07-17

### Adicionado

- **Integração com ViaCEP**: Busca automática de endereço (rua, bairro, cidade, estado) no formulário de cadastro de funcionário ao digitar um CEP válido de 8 dígitos.
- **Upload de Anexos em Solicitações de Afastamento**: Nova área de Dropzone interativa para upload de atestados médicos ou comprovantes de licença diretamente para o UploadThing através da nova rota `/upload` da API.
- **Campo de Tipo Customizado de Afastamento**: Quando selecionado "Outros Afastamentos", um novo campo "Nome do Tipo de Afastamento" é exibido no formulário e enviado para a coluna `customType` criada no modelo de banco de dados `Leave`.
- **Nova Rota de Upload na API**: Endpoint genérico `POST /upload` implementado no `UploadController` para upload de arquivos em geral.
- **Script de População do Banco (Seed)**: Implementação de um script de seed completo (`prisma/seed.ts`) que gera dados realistas em português para popular todo o sistema (departamentos, cargos, administradores, gestores, funcionários, solicitações de férias, atestados com anexos, vagas de recrutamento abertas, candidatos reais com currículos e marcações de ponto históricas com saldo no banco de horas).
- **Paginação de Tabelas Orientada por API**: Paginação de 10 itens por página adicionada às tabelas de Colaboradores, Histórico de Férias, Atestados/Afastamentos, Vagas de Emprego, Usuários, Departamentos, Cargos e Logs de Auditoria, consumindo parâmetros nativos da API.
- **Sincronização de Estado com a URL (nuqs)**: Integração da biblioteca `nuqs` para manter filtros e número de página atual sincronizados diretamente na barra de endereço da URL.
- **Componente de Paginação do Shadcn**: Desenvolvimento e integração do componente oficial de paginação do Shadcn UI (`apps/web/src/components/ui/pagination.tsx`) adaptado para utilizar ícones Phosphor.

### Alterado

- **Cadastro de Funcionário Sem Obrigatoriedade de Endereço/Dados Bancários**: O formulário e a API foram flexibilizados. Os blocos de Endereço e Dados Bancários não são mais obrigatórios no momento do cadastro inicial do colaborador.
- **Remoção do Campo URL do Avatar**: O campo de texto para URL do avatar foi removido do formulário de novo colaborador, deixando a responsabilidade de upload da foto de perfil para o próprio usuário na tela de Meu Perfil.
- **Tradução de Cargos no Perfil**: A label de Role (como ADMIN, EMPLOYEE, etc.) na página `/profile` agora é traduzida dinamicamente usando as chaves de internacionalização existentes.
- **Ajuste de Menus do Colaborador (EMPLOYEE)**: Renomeação dos itens de menu para remover pronomes possessivos de primeira pessoa ("Minhas Férias" -> "Férias", "Meus Atestados" -> "Atestados", "Meu Ponto" -> "Ponto").
- **Estilização de Botões e Alinhamentos**: O botão "Solicitar Ajuste" no histórico de ponto foi alterado para o estilo sólido primário padrão (fundo azul e texto branco). Na tela de solicitação de correção de ponto, os botões de ação foram alinhados à direita e o fluxo de cancelamento recebeu suporte correto à internacionalização da rota.
- **Busca Flexível de Vagas por ID ou Slug**: O endpoint de detalhes da vaga agora aceita tanto slugs tradicionais quanto UUIDs (`id`), permitindo visualizar vagas de qualquer status no painel de administração.
- **Correção da Tradução da Data de Rescisão**: Mapeamento da tradução da chave `terminationDate` nos arquivos JSON de tradução (`pt.json`, `en.json` e `es.json`).
- **Tratamento Seguro de Listas de Departamentos e Cargos**: Adicionada segurança nas requisições que alimentam comboboxes e filtros de cargos e departamentos, evitando exceções do tipo `departments.map is not a function` caso a API retorne a estrutura envelopada de paginação.
- **Correção de Erros de Variáveis Não Utilizadas na Compilação da API**: Corrigido o endpoint `findAll` em `users.controller.ts` para receber e passar adequadamente os argumentos de paginação, sanando o problema de compilação da API no CI.

---

## [1.4.0] - 2026-07-17

### Adicionado

- **Dashboard Administrativo Enriquecido**: A visão do painel para ADMIN, HR e MANAGER foi expandida com 3 novos cards operacionais — "Admissões do Mês" (colaboradores admitidos no mês corrente), "Correções de Ponto Pendentes" (aprovações de `TimeCorrectionRequest` em aberto) e "Ausências Ativas" (que já era retornado pela API mas não exibido no frontend).
- **Funil de Recrutamento no Dashboard**: Nova seção visual com barras proporcionais exibindo a distribuição de candidaturas por estágio do pipeline ATS (`applicationsByStage`), com destaque para contratados (verde) e recusados (cinza).
- **Endpoint `GET /dashboard/employee-summary`**: Novo endpoint disponível para todos os roles autenticados que retorna dados pessoais do colaborador logado — saldo do banco de horas, contagem de férias e licenças pendentes de aprovação, número de registros de ponto realizados hoje e lista das próximas férias aprovadas (até 3 registros).
- **Dashboard do Colaborador (EMPLOYEE)**: A visão do colaborador foi ampliada com 3 cards informativos abaixo do `ClockWidget` — "Banco de Horas" (saldo com cor dinâmica), "Próximas Férias" (data da próxima férias aprovada ou mensagem de ausência) e "Minhas Solicitações" (contagem de férias e licenças aguardando aprovação, com ícone de check quando limpo).
- **Seção `TimeAttendance` nos arquivos de i18n**: Adicionada nova seção de tradução nos três idiomas (`pt.json`, `en.json`, `es.json`) cobrindo todos os textos do `ClockWidget`.
- **Novas chaves de tradução em `Dashboard`**: Adicionadas ~30 novas chaves nos três idiomas para suportar o redesign do painel (saudações por período do dia, descrições dos cards, rótulos das ações rápidas, mensagens de estado vazio, etc.).

### Alterado

- **`DashboardStatsResponseDto`**: Adicionados 3 novos campos ao DTO de resposta — `newHiresThisMonth`, `pendingCorrections` e `applicationsByStage`.
- **`DashboardService.getStats()`**: Extendido com 3 novas queries paralelas no `Promise.all` — count de admissões do mês, count de correções de ponto pendentes e `groupBy` de candidaturas por estágio.
- **`ClockWidget`**: Todos os textos hardcoded em português foram migrados para `useTranslations("TimeAttendance")`, corrigindo violação das regras de i18n do projeto. Também foi corrigida a lógica do ícone de notificação — sucesso agora usa `CheckCircle` e erro usa `WarningCircle`.
- **`page.tsx` (Dashboard)**: Redesign completo da página — visão administrativa agora organiza os cards em 2 linhas (4 + 3) e inclui a seção de funil; visão do colaborador adiciona 3 cards informativos ao `ClockWidget`. Todos os textos migrados para i18n.

### Corrigido

- **Interface `DashboardStats` no frontend**: Atualizada para incluir os 3 novos campos retornados pela API, evitando incompatibilidade de tipos TypeScript.

---

## [1.3.1] - 2026-07-16

### Adicionado

- **Colunas de Perfil no Modelo User**: Adicionadas as propriedades `firstName`, `lastName` e `avatarUrl` diretamente ao modelo `User` no Prisma para permitir que administradores sem vínculo com colaboradores (`Employee`) possuam nome, sobrenome e avatar persistidos no banco de dados.

### Alterado

- **Decodificação de Sessão do AuthProvider**: O `AuthProvider` agora busca os dados de perfil via requisição para `/auth/me` na inicialização do app em vez de apenas decodificar o payload bruto do JWT, garantindo que o nome e o avatar sejam recuperados corretamente ao atualizar a página.
- **Zustand setAuth com Mesclagem**: A ação `setAuth` do Zustand agora mescla os estados do usuário para evitar perda de dados de perfil nas renovações silenciosas de token de acesso.
- **Dropdown do Usuário no Header**: O cabeçalho foi ajustado para exibir o avatar vindo do `User.avatarUrl` como fallback caso o relacionamento com `employee` não possua imagem.

### Corrigido

- **Persistência de Perfil de Administradores**: Correção em `updateProfile` na API para atualizar campos de perfil diretamente na tabela `users` se a conta logada for um administrador puro (sem `Employee`).
- **Garantia de Unicidade em Transações**: Substituição de métodos de escrita direta por `upsert` na edição de dados complementares de colaboradores no Prisma para evitar violações de integridade.

---

## [1.3.0] - 2026-07-16

### Adicionado

- **Página de Perfil do Colaborador**: Nova tela em `/profile` com formulário de edição de dados básicos, upload de avatar com pré-visualização instantânea e atualização de senha com máscara de visibilidade (olho) e validações robustas.
- **Área de Upload de Documentos nativa**: Refatorado o formulário em `/documents/new` para suportar upload de arquivos real via drag-and-drop utilizando `FormData` para a API.
- **Notificações Toast Customizadas**: Criação de `ToastProvider` e hook `useToast` disparando mensagens flutuantes para feedback imediato e elegante.
- **Componentes Select Adaptados para Tema Escuro**: Novos wrappers `Select` e `Option` customizados e utilizados em todos os formulários do sistema para legibilidade impecável no Dark Mode.

### Alterado

- **Substituição Geral de Ícones**: Migração de todos os ícones `lucide-react` para `@phosphor-icons/react` no frontend para homogeneidade visual.
- **Redimensionamento Inteligente de Tabelas**: Ajustado o grid de colunas para fazer com que a primeira coluna ocupe todo o espaço disponível (`w-full`) e as subsequentes ocupem apenas a largura estritamente necessária.
- **Criação de Usuário com Senha Padrão**: Lógica transacional no backend para criar automaticamente uma credencial com a senha `"Mudar@123"` criptografada por bcrypt ao cadastrar um novo funcionário sem userId associado.

### Corrigido

- **Validação de Tipos de Payload de Cargo**: Correção na conversão de faixas salariais para tipo float no envio de payloads na API de Cargos.

---

## [1.2.0] - 2026-07-16

### Adicionado

- **Proteção por RBAC no Frontend**: Componente de controle de acesso `<RbacGuard>` para interceptar e redirecionar acessos a rotas restritas baseadas nos privilégios do usuário.
- **Header Adaptativo (RBAC Dinâmico)**: Links do header e categorias megamenu agora renderizam links de navegação diretos em vez de dropdowns caso apenas um item esteja autorizado para o usuário.
- **Páginas de Formulários Dedicadas**: Eliminação completa de modais/diálogos em favor de páginas dedicadas a formulários para criação e edição de Departamentos, Cargos, Solicitação de Férias e Licenças, e Envio de Documentos.
- **Recurso TanStack Table Avançado**: Barra de pesquisa, ordenação dinâmica por clique nas colunas, e filtragem avançada por status local integrada às tabelas do sistema.
- **Páginas Separadas de Tabelas**: Divisão das telas de Ausências (Férias vs Atestados) e Organização (Departamentos vs Cargos) em caminhos de rotas individuais.
- **Interação Suave de Hover no Megamenu**: Corrigida a transição do mouse da barra superior para a caixa de conteúdo do megamenu, adicionando um debounce de 150ms para evitar fechamentos prematuros acidentais.
- **Central de Notificações no Frontend**: Componente `<NotificationDropdown>` com ícone de sino e contador de alertas não lidos no cabeçalho do sistema, integrado à API de notificações, permitindo marcar mensagens como lidas instantaneamente.
- **Módulo de Contas de Usuários no Frontend**: Página `/organization/users` exclusiva para administradores e RH com listagem de credenciais, papéis de acesso (role) e data de criação usando TanStack Table.
- **Módulo de Ponto Eletrônico (Backend)**: Adicionada infraestrutura completa e APIs sob o prefixo `/time-attendance` para batida sequencial inteligente, auditorias físicas (IP/User-Agent/Localização), banco de horas e solicitações de ajuste de jornada.

### Corrigido

- **Taxa Limite de Conexões no Login**: Ajustada a diretiva `@Throttle` nos endpoints de Login e Registro de `10` para `100` requisições por minuto, evitando bloqueios de rede indesejados e erros de conexão CORS em preflights.

---

## [1.1.0] - 2026-07-16

### Adicionado

- **Módulo de Estrutura Organizacional**: Listagem e gerenciamento completo de Departamentos e Cargos (Positions) com tabelas zebradas livres de bordas e modais interativos integrados.
- **Módulo de Gestão de Ausências**: Painel de controle de férias e licenças para RH/Gestores com aprovação e reprovação, e tela de autoatendimento do colaborador para solicitação de férias e upload de atestados médicos.
- **Módulo de Gestão de Documentos**: Repositório centralizado de arquivos enviados por colaboradores e RH com listagem zebrada e sem bordas, permitindo downloads e exclusões físicas e lógicas integradas.
- **Módulo de Recrutamento & Seleção (ATS)**: Fluxo completo de vagas e candidaturas, incluindo um pipeline de triagem visual (Kanban) para avançar candidatos de fase e botão de admissão imediata convertendo o candidato em funcionário.
- **Módulo de Auditoria**: Interface administrativa para visualização de logs de auditoria corporativa com pesquisa textual, paginação e detalhamento de dados JSON estruturados.
- **Componente FormSectionHeader**: Cabeçalho de subdivisão de formulário padronizado com suporte a ícones duotone do Phosphor Icons, títulos e descrições.
- **Aviso de Campos Obrigatórios**: Indicador visual global de campos obrigatórios (`* Os campos marcados com * são obrigatórios`) e asterisco vermelho nos labels dos formulários para melhor usabilidade.
- **Testes e Validações Gerais**: Suites de testes automatizados (`organization.spec.tsx`, `absences.spec.tsx`, `documents.spec.tsx`, `recruitment.spec.tsx` e `audit.spec.tsx`) com 100% de cobertura.

### Alterado

- **Substituição da Sidebar por Header Responsivo**: Removida a barra lateral e implementado um cabeçalho fixo minimalista com mega menus dropdowns, seletor de tema/idioma e avatar de usuário reestruturado com Base UI.
- **Página Inicial do Painel (Dashboard)**: Refatorada a página `/` para apresentar cartões de métricas reais integrados com o endpoint `/dashboard` da API (totalizadores de colaboradores, setores estruturados, processos seletivos e ausências pendentes) e atalhos de ações rápidas, respeitando o padrão estético sem bordas e sem sombras.
- **Polimento Visual "Sem Bordas e Sem Sombras"**: Removidos todos os componentes de abas, cartões, bordas e sombras das telas de listagem, cadastro e detalhes dos Colaboradores, adotando layouts fluidos em tela cheia (`w-full`).
- **Logotipos em SVG**: Excluídos os logotipos e ícones antigos em formato `.webp` e inseridas as novas versões vetoriais `.svg` para melhor fidelidade de renderização em todos os temas.

---

## [1.0.0] - 2026-07-16

### Adicionado

- **Módulo de Gestão de Pessoas (Core Employee)**: Implementação completa de listagem de colaboradores com TanStack Table, cadastro com validações Zod e edição de dados segmentada em abas.
- **Refatoração de Layout do Dashboard**: Criação de grupo de rotas Next.js `(dashboard)` com layout compartilhado para gerenciar de forma unificada e nativa a barra lateral (`AppSidebar`).
- **Componentes do Shadcn/UI**: Adicionados componentes de `Badge`, `Tabs` e `Dialog` no frontend para suportar a interface minimalista.
- **Integração de API e Schemas**: Implementados o `employeeService` para comunicação síncrona de CRUD e schemas Zod.

---

## [0.9.0] - 2026-07-15

### Adicionado

- **Testes Unitários de Autenticação**: Criados arquivos de testes unitários para redefinição de senha (`reset-password.spec.tsx`) e recuperação de acesso (`forgot-password.spec.tsx`) com cobertura de validações complexas e mock de parâmetros de consulta de URL via `URLSearchParams`.
- **E2E Autenticação Completo**: Adicionados fluxos de ponta a ponta no Playwright (`auth.e2e.spec.ts`) validando os fluxos de sucesso e comportamento com redirecionamento de contagem regressiva para esquecimento e redefinição de credenciais.

### Alterado

- **Layout de Autenticação Minimalista**: Otimizadas as páginas de `/login`, `/register` e `/forgot-password` removendo os contêineres de cards, fundos, bordas e sombras. As telas agora contam com o tema de fundo padrão integrado de forma limpa e logotipo aumentado (`h-20`).
- **ThemeProvider sem Scripts Inline**: Refatoração do `ThemeProvider.tsx` removendo `next-themes` do escopo de montagem de scripts do lado do servidor para corrigir por completo o erro de hidratação JSX / tags de script no Turbopack.
- **Seletor de Idiomas com SVG**: Alterado o componente `LanguageSwitcher.tsx` para consumir bandeiras em formato SVG localizadas em `/lang/`, com suporte a tradução dinâmica e localizada dos nomes dos idiomas.

---

## [0.8.0] - 2026-07-15

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
