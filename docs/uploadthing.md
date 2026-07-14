# Integração UploadThing - Armazenamento de Arquivos

O Atlas HRMS utiliza a plataforma **UploadThing** como infraestrutura principal de armazenamento para upload de arquivos em nuvem de forma segura e performática.

## Visão Geral do Módulo Reutilizável

Para evitar duplicação de lógicas de Multipart/Form-data, criamos um serviço agnóstico e compartilhado chamado `UploadthingService` dentro da pasta `common`:

- **Caminho**: [uploadthing.service.ts](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/apps/api/src/common/uploadthing/uploadthing.service.ts)
- **Token Global**: Registrado no `UploadthingModule` e atrelado como módulo global no [app.module.ts](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/apps/api/src/app.module.ts).

## Métodos Disponíveis no `UploadthingService`

```typescript
import { UploadthingService } from "../common/uploadthing/uploadthing.service";

// 1. Upload de Arquivo direto (via buffer)
const uploadResponse = await this.uploadthingService.uploadFile(file);
console.log(uploadResponse.url); // Link de acesso público seguro

// 2. Remoção de arquivo pelo identificador único (fileKey)
await this.uploadthingService.deleteFile(fileKey);
```

## Configuração do Ambiente

O serviço lê automaticamente as seguintes credenciais configuradas na raiz do projeto em `.env`:

```bash
# Token completo para operações internas
UPLOADTHING_TOKEN="eyJhcGlLZXkiOiJza19saXZlX..."

# Chave secreta de autenticação
UPLOADTHING_SECRET="sk_live_..."
```
## Decisão de Arquitetura: Direct-to-Cloud Upload

O projeto Atlas HRMS adota o padrão moderno de **Direct-to-Cloud Upload** (Upload Direto pelo Frontend para a Nuvem):

1. **Desempenho da API (NestJS)**: Evita que os servidores de backend processem buffers pesados de Multipart/Form-data. A API NestJS fica livre de gargalos de memória RAM/CPU e limites de timeout de rede durante uploads.
2. **Escala e Largura de Banda**: O tráfego de rede do upload vai diretamente da máquina do cliente (Frontend) para a CDN/Storage do UploadThing.
3. **Segurança Integrada**: O backend continua sendo o guardião da segurança, validando as permissões e retornando chaves/rotas assinadas para que o frontend possa concluir o upload. Na criação de registros (ex: `leaves`), o backend valida apenas a URL persistida no banco e gerencia a deleção física de arquivos órfãos via `UTApi`.

