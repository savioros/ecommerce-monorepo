# Petshop E-commerce

E-commerce completo de petshop com SPA em React e API REST em Laravel integrada ao Stripe para processamento de pagamentos.

---

## Fluxo de compra

### Etapa 1 — Home

![Etapa 1 – Home](docs/screenshots/home.png)

### Etapa 2 — Dados de contato

![Etapa 2 – Dados de contato](docs/screenshots/checkout-step1.png)

### Etapa 3 — Dados de pagamento

![Etapa 3 – Pagamento](docs/screenshots/checkout-step2.png)

> Os dados do cartão são digitados diretamente no Stripe Elements. O backend nunca recebe ou armazena dados do cartão.

### Etapa 4 — Revisão do pedido

![Etapa 4 – Revisão](docs/screenshots/checkout-step3.png)

### Confirmação

![Confirmação do pedido](docs/screenshots/checkout-step4.png)

---

## Funcionalidades

- **Checkout em 3 etapas** — endereço, pagamento e revisão antes de finalizar
- **Stripe Elements** — tokenização do cartão acontece inteiramente no cliente; dados de cartão nunca chegam ao backend
- **Payment Intents** — criação do PaymentIntent no servidor com confirmação do pagamento no cliente via `stripe.confirmCardPayment()`
- **Confirmação segura** — o backend verifica o status do PaymentIntent diretamente na API do Stripe antes de marcar o pedido como aprovado
- **Modular Monolith** — API Laravel organizada em módulos independentes (Catalog, Orders, Users, Notifications)
- **Contrato tipado** — Laravel API Resources no backend e interfaces TypeScript no frontend mantêm o contrato de request/response explícito
- **Ambiente de dev containerizado** — Docker Compose com hot reload em ambos os serviços
- **Stack pronta para produção** — hospedada na Vercel, Render e Supabase

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| Pagamentos | Stripe Elements, Stripe PHP SDK v20 |
| Backend | Laravel 13, PHP 8.3 |
| Banco de dados | PostgreSQL 16 |
| Infra (dev) | Docker, Docker Compose |
| Infra (prod) | Vercel · Render · Supabase |

---

## Estrutura do projeto

```
ecommerce-monorepo/
├── web/                        # SPA React
│   └── src/
│       ├── components/         # Componentes de UI reutilizáveis
│       ├── pages/              # Páginas por rota (CheckoutPage, etc.)
│       ├── services/           # Cliente Axios e funções de serviço tipadas
│       ├── store/              # Estado global
│       └── types/              # Tipos TypeScript compartilhados
│
├── api/                        # API REST Laravel
│   └── app/
│       ├── Enums/              # Enums PHP 8.1+ (OrderStatus)
│       ├── Exceptions/         # Exceções de domínio (StripeIntegrationException)
│       └── Modules/
│           ├── Orders/         # Controller → Service → Repository + Resource + FormRequest
│           ├── Catalog/
│           ├── Users/
│           └── Notifications/
│
├── docs/
│   └── screenshots/            # Prints do fluxo de compra
├── docker-compose.yml
├── Makefile
└── ARCHITECTURE.md
```

Cada módulo em `api/app/Modules/` é autocontido:

```
Orders/
├── Controllers/OrderController.php
├── Services/OrderService.php
├── Repositories/OrderRepository.php
├── Requests/StoreOrderRequest.php
├── Resources/OrderResource.php
└── Exceptions/PaymentNotConfirmedException.php
```

---

## Como rodar localmente

### Pré-requisitos

- Docker e Docker Compose
- Conta no [Stripe](https://stripe.com) (chaves de teste)

### 1. Clone e configure

```bash
git clone https://github.com/seu-usuario/ecommerce-monorepo.git
cd ecommerce-monorepo

cp .env.example .env
# Preencha VITE_STRIPE_PUBLISHABLE_KEY e STRIPE_SECRET_KEY no .env
# Preencha api/.env com credenciais do banco e STRIPE_SECRET_KEY
```

### 2. Suba os serviços

```bash
make up        # Build das imagens e start do web (5173), api (8000) e PostgreSQL
make migrate   # Roda as migrations do Laravel
```

### 3. Acesse

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8000 |

### Outros comandos

```bash
make test      # Roda a suite de testes PHP
make down      # Para e remove os containers
```

---

## Fluxo de pagamento

Como React, Laravel e Stripe se comunicam durante o checkout:

```
Frontend (React)               Backend (Laravel)              Stripe API
      │                               │                           │
      │  POST /api/orders             │                           │
      │  { cliente, endereço, valor } │                           │
      │ ─────────────────────────────►│                           │
      │                               │  paymentIntents.create()  │
      │                               │ ─────────────────────────►│
      │                               │◄─────────────────────────
      │                               │  { id, client_secret }    │
      │◄─────────────────────────────                             │
      │  { order, client_secret }     │                           │
      │                               │                           │
      │  stripe.confirmCardPayment()  │                           │
      │  (não passa pelo backend)     │                           │
      │ ─────────────────────────────────────────────────────────►│
      │◄─────────────────────────────────────────────────────────
      │  { status: 'succeeded' }      │                           │
      │                               │                           │
      │  PATCH /api/orders/{id}/confirm-payment                   │
      │ ─────────────────────────────►│                           │
      │                               │  paymentIntents.retrieve()│
      │                               │ ─────────────────────────►│
      │                               │◄─────────────────────────
      │                               │  Verifica status=succeeded│
      │◄─────────────────────────────                             │
      │  { order: { status: APROVADO }}│                          │
```

> O backend nunca recebe dados do cartão. O Stripe trata a tokenização e a conformidade PCI inteiramente.

---

## Endpoints da API

### Criar pedido

```
POST /api/orders
```

**Body:**

```json
{
  "customer_name": "João Silva",
  "customer_email": "joao@exemplo.com",
  "street": "Rua das Flores",
  "street_number": "42",
  "complement": "Apto 3",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01310-100",
  "payment_method": "credit_card",
  "installments": 1,
  "amount": 19900
}
```

**Resposta `201`:**

```json
{
  "order": {
    "id": 1,
    "status": "PENDENTE",
    "payment_method": "credit_card",
    "installments": 1,
    "amount": 19900,
    "customer_name": "João Silva",
    "customer_email": "joao@exemplo.com",
    "created_at": "2026-06-17T00:00:00.000Z"
  },
  "client_secret": "pi_xxx_secret_xxx"
}
```

> `amount` é em centavos (BRL). `19900` = R$ 199,00.

---

### Confirmar pagamento

```
PATCH /api/orders/{id}/confirm-payment
```

Verifica o status do PaymentIntent diretamente no Stripe antes de atualizar o pedido. Retorna `409` se o pagamento ainda não foi confirmado.

**Resposta `200`:**

```json
{
  "id": 1,
  "status": "APROVADO",
  ...
}
```

---

## Decisões de arquitetura

### Por que Modular Monolith?

Catalog, Orders, Users e Notifications compartilham o mesmo banco PostgreSQL e fazem deploy juntos. Não há padrão de tráfego, fronteira de time ou restrição de escala que justifique separá-los em serviços hoje. Os limites de módulo impõem a mesma separação de responsabilidades que microsserviços imporiam — sem a complexidade de sistemas distribuídos.

### Padrão de integração com o Stripe

Os dados do cartão vão do browser diretamente para o Stripe. O backend recebe apenas um `payment_method_id` (token opaco) e o `stripe_payment_intent_id` necessário para verificar a cobrança. Isso mantém o backend completamente fora do escopo PCI.

---

## Roadmap — Fase 2

- [ ] **Stripe Webhooks** — substituir o polling de `confirm-payment` por evento assíncrono confiável do Stripe (`payment_intent.succeeded`)
- [ ] **Autenticação** — Laravel Sanctum para contas de usuário e histórico de pedidos
- [ ] **Filas com Redis** — disparo assíncrono de e-mails transacionais via Laravel Queues
- [ ] **CI/CD** — pipeline no GitHub Actions com gates de teste e lint em todo PR
- [ ] **Observabilidade** — logging estruturado e tracing com OpenTelemetry

---

## Licença

MIT

---

Desenvolvido por [Savio](https://linkedin.com/in/saviorian) · [rsavio.dev@gmail.com](mailto:rsavio.dev@gmail.com)
