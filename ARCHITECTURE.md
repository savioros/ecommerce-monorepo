# Architecture — E-commerce Petshop

## O que é este projeto

E-commerce de petshop com dois serviços independentes: um frontend em React
e uma API principal em Laravel que também processa pagamentos via Stripe.

## Os serviços

### web/ — React + Vite + TypeScript
Interface do usuário. SPA que consome a API do Laravel via HTTP.
Responsável por: listagem de produtos, checkout com Stripe Elements e tela
de confirmação. Demais telas são Fase 2.

### api/ — Laravel
Core do negócio. Organizado como Modular Monolith com os módulos
Catalog, Orders, Users e Notifications.
Responsável por: regras de negócio, persistência, filas e integração
com o Stripe via SDK oficial para PHP.

## Por que essa divisão

O Laravel concentra toda a lógica de negócio porque os módulos Catalog,
Orders e Users compartilham o mesmo banco e o mesmo ciclo de deploy —
não há razão para separá-los em microsserviços.

## Sobre o Spring Boot

O projeto começou com um microsserviço de pagamentos em Spring Boot,
isolado para separar responsabilidade financeira do core do negócio.
Ao integrar o Stripe Elements no frontend, o SDK oficial do Stripe para
PHP passou a resolver a parte de segurança que o Spring Boot isolaria —
o Stripe já lida com a complexidade de PCI compliance e nunca expõe
dados de cartão para o backend. Manter um microsserviço sem necessidade
real de negócio seria complexidade desnecessária. A decisão foi
simplificar para Laravel + Stripe diretamente.

## Como os serviços se comunicam

1. Usuário preenche checkout no React (dados pessoais, endereço e cartão via Stripe Elements)
2. React faz POST /api/orders para o Laravel com os dados do pedido (sem dados de cartão)
3. Laravel salva o pedido com status PENDENTE
4. Laravel usa o SDK do Stripe para criar um Payment Intent
5. Laravel retorna o client_secret para o React
6. React confirma o pagamento diretamente com o Stripe usando o client_secret
7. Stripe processa e responde ao React
8. React notifica o Laravel que o pagamento foi confirmado
9. Laravel atualiza o status do pedido para APROVADO ou REJEITADO
10. React exibe a tela de confirmação

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
├── docker-compose.yml
├── Makefile
├── .env.example
└── ARCHITECTURE.md

## Infraestrutura em produção

- web/ hospedado na Vercel
- api/ hospedado no Render
- Banco PostgreSQL no Supabase
- Pagamentos processados via Stripe (modo de teste)

## Como rodar localmente

make up        # sobe os serviços + banco
make migrate   # roda as migrations do Laravel
make test      # roda os testes
make down      # derruba os serviços

## Decisões da Fase 2

### Pagamentos
- Implementar webhook do Stripe para confirmação assíncrona e confiável
- Migrar de modo de teste para produção no Stripe

### Laravel e infra
- Adicionar Redis para filas de e-mail
- Autenticação com Laravel Sanctum

### Qualidade e deploy
- Testes automatizados
- CI/CD com GitHub Actions
- Observabilidade com OpenTelemetry

### Considerado e descartado
- Microsserviço de pagamentos em Spring Boot — descartado após integração
  com Stripe Elements tornar a separação desnecessária para o estágio
  atual do projeto. Pode ser revisitado se houver necessidade real de
  isolar lógica financeira de múltiplos providers de pagamento.