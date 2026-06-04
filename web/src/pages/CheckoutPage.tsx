import { useState } from 'react';
import {
  PawPrint,
  ArrowLeft,
  Lock,
  Shield,
  Truck,
  RotateCcw,
  Check,
  CreditCard,
  QrCode,
  FileText,
  ChevronRight,
  Tag,
} from 'lucide-react';
import type { Product } from '../types/product';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'shipping' | 'payment' | 'review';
type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

interface ShippingData {
  email: string;
  fullName: string;
  address: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zip: string;
  saveInfo: boolean;
}

interface PaymentData {
  method: PaymentMethod;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
  installments: string;
}

interface CheckoutPageProps {
  product: Product;
  onBack: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: 'shipping', label: 'Envio' },
  { key: 'payment', label: 'Pagamento' },
  { key: 'review', label: 'Revisão' },
];

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
];

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: React.ReactNode; hasDiscount: boolean }[] = [
  { key: 'credit_card', label: 'Cartão de Crédito', icon: <CreditCard className="w-4 h-4" />, hasDiscount: false },
  { key: 'pix',         label: 'PIX',               icon: <QrCode className="w-4 h-4" />,    hasDiscount: true },
  { key: 'boleto',      label: 'Boleto',             icon: <FileText className="w-4 h-4" />,  hasDiscount: true },
];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de Crédito',
  pix:         'PIX',
  boleto:      'Boleto Bancário',
};

// ─── Mask Utilities ───────────────────────────────────────────────────────────

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function maskExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function maskCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

// ─── Discount Logic ───────────────────────────────────────────────────────────

function computeDiscount(price: number, payment: PaymentData): number {
  const eligible =
    payment.method === 'pix' ||
    payment.method === 'boleto' ||
    (payment.method === 'credit_card' && payment.installments === '1');
  return eligible ? price * 0.1 : 0;
}

// ─── UI Atoms ─────────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <div key={step.key} className="flex items-center min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  isDone
                    ? 'bg-gray-900 text-white'
                    : isActive
                    ? 'bg-amber-400 text-white'
                    : 'border-2 border-gray-200 text-gray-400 bg-white'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" strokeWidth={2.5} /> : idx + 1}
              </div>
              <span
                className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  isActive ? 'text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 min-w-3 mx-1.5 sm:mx-3 transition-colors ${
                  idx < currentIdx ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">{children}</h3>
  );
}

function FormInput({
  label,
  optional,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; optional?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label}
        {optional && <span className="font-normal text-gray-400 ml-1">(Opcional)</span>}
      </label>
      <input
        {...props}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors placeholder-gray-400"
      />
    </div>
  );
}

// ─── Step 1: Envio ────────────────────────────────────────────────────────────

function ShippingStep({
  data,
  onChange,
  onNext,
}: {
  data: ShippingData;
  onChange: (updates: Partial<ShippingData>) => void;
  onNext: () => void;
}) {
  const isValid = !!(
    data.email.trim() &&
    data.fullName.trim() &&
    data.address.trim() &&
    data.number.trim() &&
    data.city.trim() &&
    data.state &&
    data.zip.replace(/\D/g, '').length === 8
  );

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Informações de Contato</SectionTitle>
        <FormInput
          label="E-mail"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </div>

      <div>
        <SectionTitle>Endereço de Entrega</SectionTitle>
        <div className="space-y-3">
          <FormInput
            label="Nome Completo"
            placeholder="João da Silva"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FormInput
                label="Rua / Avenida"
                placeholder="Rua das Flores"
                value={data.address}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </div>
            <FormInput
              label="Número"
              placeholder="123"
              value={data.number}
              onChange={(e) => onChange({ number: e.target.value })}
            />
          </div>
          <FormInput
            label="Complemento"
            optional
            placeholder="Apto 4B, Bloco C..."
            value={data.complement}
            onChange={(e) => onChange({ complement: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Cidade"
              placeholder="São Paulo"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">Estado</label>
              <select
                value={data.state}
                onChange={(e) => onChange({ state: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer"
              >
                <option value="">Selecione</option>
                {BR_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <FormInput
            label="CEP"
            placeholder="00000-000"
            inputMode="numeric"
            value={data.zip}
            onChange={(e) => onChange({ zip: maskCEP(e.target.value) })}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange({ saveInfo: !data.saveInfo })}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
            data.saveInfo
              ? 'bg-gray-900 border-gray-900'
              : 'border-gray-300 group-hover:border-gray-500'
          }`}
        >
          {data.saveInfo && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <span className="text-sm text-gray-600">Salvar informações para a próxima compra</span>
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!isValid}
        className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        Continuar para Pagamento
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 2: Pagamento ────────────────────────────────────────────────────────

function PaymentStep({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: PaymentData;
  onChange: (updates: Partial<PaymentData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isValid =
    data.method !== 'credit_card' ||
    !!(
      data.cardNumber.replace(/\D/g, '').length === 16 &&
      data.cardName.trim() &&
      data.cardExpiry.replace(/\D/g, '').length === 4 &&
      data.cardCvv.length >= 3
    );

  const creditCardHasDiscount = data.method === 'credit_card' && data.installments === '1';

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Método de Pagamento</SectionTitle>
        <div className="flex gap-2">
          {PAYMENT_METHODS.map((m) => {
            const isActive = data.method === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onChange({ method: m.key })}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-colors cursor-pointer relative ${
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                }`}
              >
                {m.hasDiscount && (
                  <span
                    className={`absolute -top-2 -right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-400 text-white' : 'bg-amber-400 text-white'
                    }`}
                  >
                    10% OFF
                  </span>
                )}
                {m.icon}
                <span className="hidden sm:block">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {data.method === 'credit_card' && (
        <div className="space-y-3">
          <FormInput
            label="Número do Cartão"
            placeholder="0000 0000 0000 0000"
            inputMode="numeric"
            value={data.cardNumber}
            onChange={(e) => onChange({ cardNumber: maskCardNumber(e.target.value) })}
          />
          <FormInput
            label="Nome no Cartão"
            placeholder="COMO APARECE NO CARTÃO"
            value={data.cardName}
            onChange={(e) => onChange({ cardName: e.target.value.toUpperCase() })}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Validade"
              placeholder="MM/AA"
              inputMode="numeric"
              value={data.cardExpiry}
              onChange={(e) => onChange({ cardExpiry: maskExpiry(e.target.value) })}
            />
            <FormInput
              label="CVV"
              placeholder="000"
              inputMode="numeric"
              value={data.cardCvv}
              onChange={(e) => onChange({ cardCvv: maskCVV(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Parcelas</label>
            <select
              value={data.installments}
              onChange={(e) => onChange({ installments: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={String(n)}>
                  {n === 1 ? '1x sem juros — 10% de desconto' : `${n}x sem juros`}
                </option>
              ))}
            </select>
            <p
              className={`text-xs flex items-center gap-1 transition-colors ${
                creditCardHasDiscount ? 'text-amber-600' : 'text-gray-400'
              }`}
            >
              <Tag className="w-3 h-3 shrink-0" />
              {creditCardHasDiscount
                ? 'Desconto de 10% aplicado para pagamento à vista'
                : 'Desconto disponível apenas no pagamento à vista (1x)'}
            </p>
          </div>
        </div>
      )}

      {data.method === 'pix' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-36 h-36 bg-white border-2 border-gray-200 rounded-xl p-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {([
                [0,0,30,30],[40,0,10,10],[60,0,10,10],[70,0,30,10],
                [0,10,10,10],[30,10,10,10],[50,10,10,10],[70,10,20,10],
                [0,20,30,10],[40,20,20,10],[70,20,30,10],
                [0,30,10,10],[20,30,20,10],[50,30,10,10],[70,30,10,10],[90,30,10,10],
                [0,40,30,20],[40,40,10,10],[60,40,10,10],[80,40,20,20],
                [0,60,10,10],[20,60,10,10],[40,60,20,10],[70,60,10,10],
                [0,70,30,10],[50,70,10,10],[70,70,30,30],
                [0,80,10,10],[20,80,20,10],[50,80,10,20],
                [0,90,30,10],
              ] as [number,number,number,number][]).map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} fill="#111827" rx="2" />
              ))}
            </svg>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <Tag className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-700">10% de desconto aplicado no PIX</p>
          </div>
          <p className="text-sm text-gray-600 text-center max-w-xs">
            Escaneie o QR code com o app do seu banco para pagar instantaneamente.
          </p>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-400 truncate font-mono">
              00020126580014br.gov.bcb.pix0136a1b2c3d4...
            </span>
            <button
              type="button"
              className="text-xs font-semibold text-gray-900 shrink-0 hover:underline cursor-pointer"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {data.method === 'boleto' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
            <Tag className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-700">10% de desconto aplicado no Boleto</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900 mb-1">Boleto Bancário</p>
            <p className="text-sm text-gray-500 max-w-xs">
              O boleto será gerado após a confirmação. Prazo de pagamento: 3 dias úteis. Após o vencimento, o pedido é cancelado automaticamente.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Revisar Pedido
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Revisão ──────────────────────────────────────────────────────────

function ReviewStep({
  shipping,
  payment,
  onBack,
  onFinalize,
}: {
  shipping: ShippingData;
  payment: PaymentData;
  onBack: () => void;
  onFinalize: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Dados de Entrega</SectionTitle>
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p className="text-sm font-semibold text-gray-900">{shipping.fullName}</p>
          <p className="text-sm text-gray-500">{shipping.email}</p>
          <p className="text-sm text-gray-600">
            {shipping.address}, {shipping.number}
            {shipping.complement && `, ${shipping.complement}`}
          </p>
          <p className="text-sm text-gray-600">
            {shipping.city} – {shipping.state} · CEP {shipping.zip}
          </p>
        </div>
      </div>

      <div>
        <SectionTitle>Pagamento</SectionTitle>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0 text-gray-500">
            {payment.method === 'credit_card' && <CreditCard className="w-5 h-5" />}
            {payment.method === 'pix' && <QrCode className="w-5 h-5" />}
            {payment.method === 'boleto' && <FileText className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{PAYMENT_LABELS[payment.method]}</p>
            {payment.method === 'credit_card' && payment.cardNumber && (
              <p className="text-sm text-gray-500">
                •••• •••• •••• {payment.cardNumber.replace(/\s/g, '').slice(-4)} · {payment.installments}x sem juros
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 leading-relaxed">
          Ao clicar em <strong>Finalizar Compra</strong>, você confirma que as informações acima estão corretas e concorda com nossos{' '}
          <a href="#" className="underline underline-offset-2">Termos de Uso</a>.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onFinalize}
          className="flex-1 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Finalizar Compra
          <Check className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary({
  product,
  discount,
  total,
}: {
  product: Product;
  discount: number;
  total: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
      <h2 className="text-base font-bold text-gray-900">Resumo do Pedido</h2>

      <div className="flex gap-3 items-start">
        <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          <svg
            className="w-8 h-8 text-gray-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</p>
          <span className="inline-block mt-1 bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5 mt-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount})</span>
          </div>
          <p className="text-sm font-bold text-gray-900 mt-1.5">R${product.price.toFixed(2)}</p>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium text-gray-900">R${product.price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Frete</span>
          <span className="font-semibold text-green-600">Grátis</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Desconto (10%)
            </span>
            <span className="font-medium text-amber-600">-R${discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-900">Total</span>
        <span className="font-bold text-xl text-gray-900">R${total.toFixed(2)}</span>
      </div>

      <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: <Shield className="w-5 h-5" />, label: 'Compra Segura' },
          { icon: <Truck className="w-5 h-5" />, label: 'Frete Grátis' },
          { icon: <RotateCcw className="w-5 h-5" />, label: 'Devolução Fácil' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <span className="text-gray-400">{icon}</span>
            <span className="text-[10px] text-gray-500 leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function CheckoutPage({ product, onBack }: CheckoutPageProps) {
  const [step, setStep] = useState<Step>('shipping');
  const [shipping, setShipping] = useState<ShippingData>({
    email: '',
    fullName: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zip: '',
    saveInfo: false,
  });
  const [payment, setPayment] = useState<PaymentData>({
    method: 'credit_card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    installments: '1',
  });

  const discount = computeDiscount(product.price, payment);
  const total = product.price - discount;

  const handleFinalize = () => {
    const orderData = {
      produto: {
        id: product.id,
        nome: product.name,
        categoria: product.category,
        preco: product.price,
      },
      envio: {
        email: shipping.email,
        nomeCompleto: shipping.fullName,
        endereco: `${shipping.address}, ${shipping.number}${shipping.complement ? `, ${shipping.complement}` : ''}`,
        cidade: shipping.city,
        estado: shipping.state,
        cep: shipping.zip,
        salvarInformacoes: shipping.saveInfo,
      },
      pagamento: {
        metodo: payment.method,
        ...(payment.method === 'credit_card' && {
          numeroCartao: payment.cardNumber,
          nomeNoCartao: payment.cardName,
          validade: payment.cardExpiry,
          parcelas: Number(payment.installments),
        }),
      },
      resumo: {
        subtotal: product.price,
        desconto: discount,
        frete: 0,
        total,
      },
    };
    console.log('Pedido finalizado:', JSON.stringify(orderData, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-base text-gray-900">
            <PawPrint className="w-5 h-5" strokeWidth={2.2} />
            E-pets
          </a>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            Checkout Seguro
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-10">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a loja
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Form */}
          <div className="flex-1 min-w-0 w-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
            <div className="mb-6">
              <StepIndicator current={step} />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {step === 'shipping' && (
                <ShippingStep
                  data={shipping}
                  onChange={(u) => setShipping((p) => ({ ...p, ...u }))}
                  onNext={() => setStep('payment')}
                />
              )}
              {step === 'payment' && (
                <PaymentStep
                  data={payment}
                  onChange={(u) => setPayment((p) => ({ ...p, ...u }))}
                  onNext={() => setStep('review')}
                  onBack={() => setStep('shipping')}
                />
              )}
              {step === 'review' && (
                <ReviewStep
                  shipping={shipping}
                  payment={payment}
                  onBack={() => setStep('payment')}
                  onFinalize={handleFinalize}
                />
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
            <OrderSummary product={product} discount={discount} total={total} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
            <span>Direitos Autorais © 2026 E-pets. Todos os Direitos Reservados.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-gray-600 transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
