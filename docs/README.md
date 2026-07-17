# 🗺️ Atlas HRMS - Sistema de Gestão de Pessoas e ATS

Atlas HRMS é um sistema completo, seguro e modular de gestão de recursos humanos e recrutamento corporativo (ATS - Applicant Tracking System). Construído como um monorepo escalável, o sistema integra de ponta a ponta as rotinas diárias do departamento de pessoal, controle de jornada dos colaboradores, solicitações internas e portal de vagas público.

---

## 🚀 Principais Módulos do Sistema

- **Portal de Carreiras Público (ATS)**: Divulgação e candidatura a vagas corporativas filtradas por senioridade, regime de contratação (CLT/PJ) e modalidade de trabalho, integrado com upload assíncrono de currículos em PDF direto na nuvem.
- **Quadro Kanban Interativo**: Processo seletivo dinâmico arrasta-e-solta (drag-and-drop) baseado no `@dnd-kit/core` com atualizações otimistas e fluxos automatizados de contratação e admissão.
- **Ponto Digital & Banco de Horas**: Registro eletrônico integrado de batidas de jornada, cálculo automático de saldo e painel de aprovação e ajuste retroativo de inconsistências por gestores.
- **Ausências & Férias**: Fluxo completo de solicitações de períodos de descanso baseados em conformidade legal aquisitiva e upload de atestados ou licenças médicas.
- **Diretório de Organização Corporativa**: Gestão de organograma organizacional contendo departamentos estruturados, vínculos de cargos e faixas salariais.
- **Segurança & Auditoria**: Rastreabilidade total das ações do sistema via Audit Trail (Logs de Auditoria), políticas de segurança e autenticação robusta.

---

## 🛠️ Tecnologias e Ecossistema

### Frontend (Web App)
- **Framework**: Next.js (App Router, Turbopack)
- **Estilização**: TailwindCSS / Componentes Tailwind baseados em Shadcn/UI
- **Internacionalização**: `next-intl` (suporte completo e traduzido para Português, Inglês e Espanhol)
- **Gestão de Estado & Queries**: TanStack Query (React Query) & Zustand
- **Interações**: `@dnd-kit/core` para interações de arrastar e soltar (Kanban)

### Backend (Server API)
- **Framework**: NestJS (TypeScript)
- **ORM & Banco de Dados**: Prisma ORM, PostgreSQL & UploadThing (Direct Storage)
- **Autenticação**: JWT híbrido (Tokens de acesso em memória e cookies HTTP-only)
- **Testes**: Jest (Unitários) & Supertest (Integração)

---

## 📚 Estrutura e Links de Documentação

Todas as especificações técnicas adicionais do monorepo, regras de segurança e detalhes de banco de dados podem ser encontradas no [Sumário Técnico (INDEX.md)](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/docs/INDEX.md).
