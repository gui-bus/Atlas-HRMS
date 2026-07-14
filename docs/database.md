# 🗄️ Modelagem de Banco de Dados

O banco de dados do **Atlas HRMS** é modelado usando PostgreSQL e abstraído com o **Prisma ORM**. Todas as migrações de dados e tabelas são coordenadas através do arquivo de configuração do Prisma localizado em `apps/api/prisma/schema.prisma`.

---

## 📊 Diagrama de Entidade-Relacionamento (ER)

Abaixo está a representação visual das tabelas do banco de dados e suas respectivas chaves e relacionamentos:

```mermaid
erDiagram
    users ||--o| employees : "userId (1:1)"
    users ||--o{ audit_logs : "userId (1:N)"
    users ||--o{ notifications : "userId (1:N)"
    employees }|--|| departments : "departmentId (N:1)"
    employees ||--o{ vacations : "employeeId (1:N)"
    employees ||--o{ documents : "employeeId (1:N)"
    departments ||--o{ recruitments : "departmentId (1:N)"
    departments }|--o| employees : "managerId (N:1)"
    employees }|--o| positions : "positionId (N:1)"
    positions }|--|| departments : "departmentId (N:1)"

    users {
        string id PK
        string email UK
        string password
        UserRole role
        boolean isActive
        int failedAttempts
        datetime lockoutUntil
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    employees {
        string id PK
        string firstName
        string lastName
        string email UK
        string phone
        EmployeeStatus status
        datetime hireDate
        datetime terminationDate
        decimal salary
        string userId FK
        string departmentId FK
    }

    departments {
        string id PK
        string name UK
        string code UK
        string description
        boolean active
        string managerId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    positions {
        string id PK
        string title
        string description
        decimal salaryRangeMin
        decimal salaryRangeMax
        boolean active
        string departmentId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    audit_logs {
        string id PK
        string action
        string details
        datetime timestamp
        string userId FK
    }

    vacations {
        string id PK
        datetime startDate
        datetime endDate
        VacationStatus status
        string employeeId FK
        string approvedById
    }

    documents {
        string id PK
        string name
        string type
        string url
        string employeeId FK
    }

    recruitments {
        string id PK
        string title
        RecruitmentStatus status
        string description
        decimal salary
        string departmentId FK
    }

    notifications {
        string id PK
        string message
        boolean read
        string userId FK
    }
```

---

## 🔐 Definições Principais de Domínio

### Enums Importantes:

- **`UserRole`**: Define a hierarquia do RBAC no sistema de autenticação.
  - `ADMIN`: Administrador com plenos poderes de acesso e auditoria.
  - `HR`: Operador de recursos humanos (gestão de funcionários, férias e vagas).
  - `MANAGER`: Gestor de equipe.
  - `EMPLOYEE`: Funcionário regular (acesso às suas próprias férias e dados).
- **`EmployeeStatus`**: `ACTIVE`, `INACTIVE`, `ON_LEAVE`, `SUSPENDED`.
- **`VacationStatus`**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
- **`RecruitmentStatus`**: `OPEN`, `CLOSED`, `ON_HOLD`, `DRAFT`.
