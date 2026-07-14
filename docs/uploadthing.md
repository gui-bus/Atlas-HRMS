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
> [!IMPORTANT]
> Certifique-se de que a validação de Zod em `env.validation.ts` permaneça ativa para evitar que a API suba sem as chaves corretas de upload em produção.
