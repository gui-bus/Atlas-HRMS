# Regras do Projeto - Atlas HRMS

## 1. Manutenção do Changelog

- Sempre que for concluída a implementação de uma nova funcionalidade (feature), correções importantes (bug fixes) ou configurações de infraestrutura/segurança relevantes, você deve atualizar o arquivo [CHANGELOG.md](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/CHANGELOG.md) na raiz do projeto.
- Siga estritamente o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e agrupe as mudanças sob a versão apropriada usando as seções corretas (`Adicionado`, `Alterado`, `Corrigido`, `Segurança`, etc.).
- O arquivo [CHANGELOG.md](file:///c:/Users/Guilherme/Desktop/PROJETOS/atlas-hrms/CHANGELOG.md) deve ser escrito 100% em português.

## 2. Manutenção da Documentação do Sistema

- Sempre que uma funcionalidade estrutural for implementada (ex: autenticação, RBAC, fluxos de banco de dados, fluxos de CI/CD), você deve criar ou atualizar o arquivo correspondente na pasta `/docs` na raiz do projeto.
- Garanta que diagramas de arquitetura e entidade-relacionamento estejam descritos no formato Mermaid para renderização nativa de diagramas no GitHub.
- Ao criar ou alterar controllers e DTOs da API, sempre decore as propriedades com `@ApiProperty()` (incluindo `example` e `description`) e as rotas com `@ApiResponse()`, informando detalhadamente os tipos e respostas esperadas para manter a documentação interativa (Swagger/Scalar) 100% preenchida.
