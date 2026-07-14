# 💼 Gestão de Cargos - Módulo de Positions

O módulo de cargos (`Position`) define as funções e faixas salariais dos funcionários dentro do **Atlas HRMS**. Cada cargo está obrigatoriamente associado a um departamento (`Department`) e serve como agrupador para os funcionários (`Employee`).

---

## 🗺️ Modelo de Dados (Atributos)

Os cargos contêm as seguintes propriedades descritas em banco de dados:

| Campo            | Tipo            | Descrição                                                    | Restrição               |
| :--------------- | :-------------- | :----------------------------------------------------------- | :---------------------- |
| `id`             | `String (UUID)` | Identificador exclusivo do cargo.                            | Chave Primária          |
| `title`          | `String`        | Título profissional do cargo (ex: "Desenvolvedor Frontend"). | Obrigatório             |
| `description`    | `String`        | Detalhamento das atribuições da função.                      | Opcional                |
| `salaryRangeMin` | `Decimal`       | Limite inferior da faixa salarial para a função.             | Obrigatório (min: 0)    |
| `salaryRangeMax` | `Decimal`       | Limite superior da faixa salarial para a função.             | Obrigatório (min: 0)    |
| `active`         | `Boolean`       | Determina se o cargo está ativo.                             | Padrão: `true`          |
| `departmentId`   | `String (UUID)` | ID do departamento ao qual o cargo pertence.                 | Chave Estrangeira (N:1) |
| `createdAt`      | `DateTime`      | Data de criação automática.                                  | Obrigatório             |
| `updatedAt`      | `DateTime`      | Data de última modificação.                                  | Obrigatório             |
| `deletedAt`      | `DateTime`      | Data de exclusão lógica (Soft-Delete).                       | Opcional                |

---

## 🔄 Regras de Negócio e Validações

O módulo implementa restrições cruciais para garantir integridade fiscal e corporativa:

1. **Validação de Faixa Salarial**:
   - O valor de `salaryRangeMin` nunca pode exceder o valor de `salaryRangeMax` (ex: disparará `400 Bad Request`).
2. **Unicidade de Título por Departamento**:
   - Dentro de um mesmo departamento, é proibido duplicar títulos de cargos ativos. Títulos iguais são permitidos se estiverem em departamentos diferentes.
3. **Mecanismo de Soft-Restore (Reativação)**:
   - Se um cargo com o mesmo título já existir em estado de exclusão lógica (`deletedAt !== null`) no departamento de destino, o sistema restaura o registro existente, limpando o `deletedAt` e atualizando os campos com o novo payload.
4. **Proteção Contra Órfãos na Exclusão**:
   - Um cargo não pode ser excluído se houver funcionários ativos vinculados a ele (disparará `400 Bad Request`). Se livre de funcionários, aplica-se a exclusão lógica (`deletedAt = now`).

---

## 🔐 Controle de Acesso (RBAC)

O acesso às rotas do controlador de cargos é protegido por controle de papéis (`RolesGuard`):

- **Leitura (`GET /positions` e `GET /positions/:id`)**:
  - **Papéis Permitidos**: `ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`.
- **Escrita (`POST`, `PUT`, `DELETE`)**:
  - **Papéis Permitidos**: `ADMIN`, `HR`.
