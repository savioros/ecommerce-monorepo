# Architecture — E-commerce Petshop

## O que é este projeto

E-commerce de petshop com três serviços independentes: um frontend em React,
uma API principal em Laravel e um microsserviço de pagamentos em Spring Boot.

## Os serviços

### web/ — React + Vite + TypeScript
Interface do usuário. SPA que consome a API do Laravel via HTTP.
Responsável por: listagem de produtos, checkout e tela de confirmação. Demais telas são Fase 2.

### api/ — Laravel
Core do negócio. Organizado como Modular Monolith com os módulos
Catalog, Orders, Users e Notifications.
Responsável por: regras de negócio, persistência, filas e comunicação
com o serviço de pagamentos.

### payments/ — Spring Boot
Microsserviço isolado de pagamentos.
Responsável por: processar transações e responder o status para o Laravel.

> Em estudo. Implementação definida após aprofundamento no Spring Boot.
> O serviço existe na arquitetura por uma razão concreta: isolar
> responsabilidade financeira do core do negócio.

## Por que essa divisão

O Laravel concentra toda a lógica de negócio porque os módulos Catalog,
Orders e Users compartilham o mesmo banco e o mesmo ciclo de deploy —
não há razão para separá-los em microsserviços.

O Spring Boot existe isolado por uma razão concreta: separação de
responsabilidade financeira. Nenhum outro serviço manipula dados de
transação. Isso facilita auditoria e permite evoluir o gateway de
pagamento sem tocar no core do negócio.

## Como os serviços se comunicam

1. Usuário interage com o React
2. React faz POST /api/orders para o Laravel com os dados do pedido (sem dados de cartão)
3. Laravel salva o pedido com status PENDENTE
4. Laravel faz POST /api/payments para o Spring Boot com amount e dados de cartão
5. Spring Boot processa e responde com APROVADO ou REJEITADO
6. Laravel atualiza o status do pedido no banco
7. Laravel retorna o pedido atualizado para o React
8. React exibe a tela de confirmação

## Estrutura de pastas

ecommerce-monorepo/
├── web/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── types/
├── api/
│   └── app/
│       └── Modules/
│           ├── Catalog/
│           │   ├── Controllers/
│           │   ├── Services/
│           │   ├── Repositories/
│           │   └── Models/
│           ├── Orders/
│           │   ├── Controllers/
│           │   ├── Services/
│           │   ├── Repositories/
│           │   └── Models/
│           ├── Users/
│           │   ├── Controllers/
│           │   ├── Services/
│           │   ├── Repositories/
│           │   └── Models/
│           └── Notifications/
│               ├── Jobs/
│               └── Mail/
├── payments/
│   └── src/main/java/com/ecommerce/payments/
│       ├── controller/
│       ├── service/
│       └── model/
├── docker-compose.yml
├── Makefile
├── .env.example
└── ARCHITECTURE.md

## Como rodar localmente

make up        # sobe os três serviços + banco + redis
make migrate   # roda as migrations do Laravel
make test      # roda os testes dos três serviços
make down      # derruba os serviços

## Decisões da Fase 2

### Spring Boot (após estudo)
- Definir e implementar o fluxo completo do microsserviço de pagamentos
- Integração real com Stripe ou Mercado Pago
- Migrar H2 para PostgreSQL dedicado

### Laravel e infra
- Migrar SQLite para PostgreSQL
- Adicionar Redis para filas de e-mail
- Autenticação com Laravel Sanctum

### Qualidade e deploy
- Testes automatizados nos três serviços
- CI/CD com GitHub Actions
- Observabilidade com OpenTelemetry