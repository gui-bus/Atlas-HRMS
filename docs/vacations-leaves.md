# Férias e Licenças (Vacations & Leaves)

Módulo responsável pela administração do ciclo de vida de ausências, afastamentos legais, férias regulamentares (CLT) e atestados médicos integrados a comprovações via UploadThing.

## Regras de Negócio e Lógica de Fluxo

### Férias (Vacations)
1. **Período Aquisitivo**: O funcionário deve possuir no mínimo 1 ano (365 dias) de tempo de contratação no sistema (calculado a partir de `hireDate` em `Employee`) para solicitar férias.
2. **Sobreposições**: A API impede solicitações de férias para períodos coincidentes em que já existam férias pendentes ou aprovadas para o mesmo funcionário.
3. **Decisão**: Apenas usuários com privilégios de `ADMIN`, `HR` ou `MANAGER` podem alterar o status de solicitações pendentes (`PENDING` -> `APPROVED` ou `REJECTED`). Se rejeitado, o preenchimento de `rejectionReason` torna-se obrigatório.

### Licenças e Atestados (Leaves)
1. **Atestados**: Utiliza o campo `attachmentUrl` para salvar o atestado assinado e criptografado enviado para o bucket do UploadThing.
2. **Tipos de Licença**: Classificadas sob o enum `LeaveType` (`MEDICAL`, `PARENTAL`, `LEGAL`, `UNPAID`, `OTHER`).
3. **Aprovação**: Semelhante às férias, afastamentos exigem avaliação e deferimento pelo RH/Admin antes de abonarem horas oficiais na escala de trabalho.

## Fluxo de Estados

```mermaid
stateDiagram-Obj
    [*] --> PENDING : Solicitação criada pelo Funcionário
    PENDING --> APPROVED : Avaliado e Deferido pelo RH/Gestor
    PENDING --> REJECTED : Indeferido (Motivo Obrigatório)
    PENDING --> CANCELLED : Cancelado pelo próprio solicitante
    APPROVED --> CANCELLED : Cancelamento excepcional pelo RH
```
