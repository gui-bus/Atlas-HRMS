# Regras do Projeto - Atlas HRMS

## 1. Manutenção do Changelog

- Sempre que for concluída a implementação de uma nova funcionalidade (feature), correções importantes (bug fixes) ou configurações de infraestrutura/segurança relevantes, você deve atualizar o arquivo [CHANGELOG.md](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/CHANGELOG.md) na raiz do projeto.
- Siga estritamente o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e agrupe as mudanças sob a versão apropriada usando as seções corretas (`Adicionado`, `Alterado`, `Corrigido`, `Segurança`, etc.).
- O arquivo [CHANGELOG.md](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/CHANGELOG.md) deve ser escrito 100% em português.

## 2. Manutenção da Documentação do Sistema

- Sempre que uma funcionalidade estrutural for implementada (ex: autenticação, RBAC, fluxos de banco de dados, fluxos de CI/CD), você deve criar ou atualizar o arquivo correspondente na pasta `/docs` na raiz do projeto.
- Garanta que diagramas de arquitetura e entidade-relacionamento estejam descritos no formato Mermaid para renderização nativa de diagramas no GitHub.
- Ao criar ou alterar controllers e DTOs da API, sempre decore as propriedades com `@ApiProperty()` (incluindo `example` e `description`) e as rotas com `@ApiResponse()`, informando detalhadamente os tipos e respostas esperadas para manter a documentação interativa (Swagger/Scalar) 100% preenchida.
- Não utilize um DTO de erro genérico único para todas as rotas e códigos de status. Cada status de erro (ex: 400, 401, 403, 404, 409) deve utilizar DTOs específicos cujos exemplos reflitam fielmente as mensagens e estruturas reais de retorno daquele contexto (observando exceções intencionais de segurança, como ocultar detalhes específicos de credenciais no fluxo de login).

## 3. Diretriz de Código Limpo (Comentários)

- Evite incluir comentários explicativos ou redundantes no código de produção ou testes. Priorize código limpo, legível e autoexplicativo.

## 4. Cobertura de Testes Obrigatória

- Sempre que criar um novo endpoint, serviço, controller ou refatorar lógica essencial, você **deve** atualizar ou criar os testes unitários (`.spec.ts`) e de integração correspondentes.
- Garanta que todos os testes passem com `pnpm --filter api test` antes de concluir a execução de qualquer tarefa.

