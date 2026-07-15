# Módulo de Documentos de Funcionários (Documents)

O módulo de **Documentos** gerencia o upload de arquivos e documentos pessoais dos funcionários (RG, CPF, Comprovante de Residência, Contratos) integrados ao **UploadThing**.

## Fluxo de Upload e Armazenamento (Direct-to-Cloud)

```mermaid
sequenceDiagram
    autonumber
    actor F as Frontend
    participant UT as UploadThing Storage
    participant B as Backend API (NestJS)
    participant DB as Banco de Dados (Postgres)

    F->>UT: Envia arquivo do documento direto via hook
    UT-->>F: Retorna URL final segura (https://utfs.io/f/...)
    F->>B: Envia requisição POST /documents com a URL do arquivo
    B->>DB: Persiste registro com a relação do funcionário
    B-->>F: Retorna sucesso 210
```

---

## Regras de Negócio e Permissões (RBAC)

### 1. Tipo de Documento
Toda inclusão deve categorizar o documento em um dos tipos válidos (`CONTRACT`, `IDENTIFICATION`, `EDUCATION`, `ADDRESS_PROOF`, `OTHER`).

### 2. Controle de Permissões
*   **Funcionários comuns (`EMPLOYEE`)**: Podem criar/enviar seus próprios documentos e listar os seus próprios documentos. Não podem visualizar nem gerenciar arquivos de terceiros.
*   **Gestores (`MANAGER`)**: Podem listar e pesquisar documentos de funcionários.
*   **RH e Administradores (`HR` / `ADMIN`)**: Possuem controle total. Apenas estes perfis têm permissão para deletar arquivos permanentemente (`DELETE /documents/:id`).

### 3. Deleção de Arquivos
Sempre que um documento é excluído da API, a URL é analisada, a chave exclusiva (`fileKey`) do arquivo é extraída e a API NestJS remove fisicamente o arquivo do bucket do UploadThing usando `UploadthingService.deleteFile()`.
