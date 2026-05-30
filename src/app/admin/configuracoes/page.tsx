'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Palette,
  Globe,
  Shield,
  QrCode,
  Receipt,
  Wallet,
} from 'lucide-react';
import { SettingsCard } from '@/components/admin/settings/SettingsCard';
import { SettingsInput, SettingsTextarea, SettingsSelect } from '@/components/admin/settings/SettingsInput';
import { SettingsToggle } from '@/components/admin/ui/SettingsToggle';
import { SaveButton, type SaveStatus } from '@/components/admin/settings/SaveButton';
import { PhoneInputField } from '@/components/ui/PhoneInputField';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Settings = Record<string, unknown>;

const SECTIONS = [
  { id: 'store', label: 'Loja', icon: Store },
  { id: 'payments', label: 'Pagamentos', icon: CreditCard },
  { id: 'shipping', label: 'Entrega e Frete', icon: Truck },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'seo', label: 'SEO', icon: Globe },
  { id: 'security', label: 'Segurança', icon: Shield },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

type PaymentToggleProps = {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function PaymentMethodToggle({ icon, label, description, checked, onChange }: PaymentToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
        checked
          ? 'border-orange-500/25 bg-orange-500/[0.07] shadow-[0_0_20px_rgba(249,115,22,0.08)] hover:bg-orange-500/[0.10]'
          : 'border-white/[0.07] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.06]'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
          checked ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.05] text-zinc-500'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${checked ? 'text-orange-200' : 'text-zinc-300'}`}>{label}</p>
        <p className={`mt-0.5 text-xs ${checked ? 'text-orange-300/60' : 'text-zinc-500'}`}>{description}</p>
      </div>
      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
          checked ? 'bg-orange-500' : 'bg-white/[0.10]'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-300 shadow ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('store');
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const patch = useCallback((key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSettings((prev) => ({ ...prev, ...json.data }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* ---- Sidebar ---- */}
      <nav className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
        <div className="mb-3 px-4 text-xs font-semibold uppercase tracking-widest text-zinc-600">
          Configurações
        </div>
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border border-orange-500/25 bg-orange-500/15 text-orange-400'
                  : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* ---- Content ---- */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <header>
            <h1 className="text-3xl font-black tracking-tight text-white">Configurações</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Gerencie todas as configurações da sua loja.
            </p>
          </header>
          <SaveButton status={saveStatus} onClick={handleSave} />
        </div>

        {/* Seletor mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border border-orange-500/25 bg-orange-500/15 text-orange-400'
                    : 'border border-white/10 bg-white/[0.03] text-zinc-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {active === 'store' && (
          <SettingsCard icon={<Store className="h-5 w-5" />} title="Loja" description="Informações gerais da sua vitrine.">
            <SettingsInput
              label="Nome da loja"
              name="storeName"
              value={(settings.storeName as string) ?? ''}
              onChange={(e) => patch('storeName', e.target.value)}
            />
            <SettingsTextarea
              label="Descrição curta"
              name="storeDescription"
              maxCount={160}
              value={(settings.storeDescription as string) ?? ''}
              onChange={(e) => patch('storeDescription', e.target.value)}
              hint="Aparece nos resultados de busca."
            />
            <SettingsInput
              label="E-mail de contato"
              name="storeEmail"
              type="email"
              value={(settings.storeEmail as string) ?? ''}
              onChange={(e) => patch('storeEmail', e.target.value)}
            />
            <PhoneInputField
              label="WhatsApp / Suporte"
              value={(settings.whatsappNumber as string) ?? ''}
              onChange={(v) => patch('whatsappNumber', v)}
              hint="Selecione o país e digite o número. Salvo automaticamente com código do país."
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SettingsInput
                label="URL do logotipo"
                name="logoUrl"
                type="url"
                value={(settings.logoUrl as string) ?? ''}
                onChange={(e) => patch('logoUrl', e.target.value)}
              />
              {Boolean(settings.logoUrl) && (
                <div className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <img
                    src={settings.logoUrl as string}
                    alt="Preview"
                    className="max-h-16 max-w-40 rounded object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <SettingsToggle
              label="Modo manutenção"
              description="Quando ativo, exibe um aviso na loja para os clientes."
              value={(settings.maintenanceMode as boolean) ?? false}
              onChange={(v) => patch('maintenanceMode', v)}
            />
          </SettingsCard>
        )}

        {active === 'payments' && (
          <SettingsCard icon={<CreditCard className="h-5 w-5" />} title="Pagamentos" description="Configure os métodos de pagamento da loja.">
            <SettingsInput
              label="Chave pública do Mercado Pago"
              name="mercadoPagoPublicKey"
              value={(settings.mercadoPagoPublicKey as string) ?? ''}
              onChange={(e) => patch('mercadoPagoPublicKey', e.target.value)}
              hint={settings.mercadoPagoPublicKey === '****' ? 'Chave já configurada. Digite um novo valor para substituir.' : undefined}
            />
            <SettingsInput
              label="Access Token (Mercado Pago)"
              name="mercadoPagoAccessToken"
              type="password"
              value={(settings.mercadoPagoAccessToken as string) ?? ''}
              onChange={(e) => patch('mercadoPagoAccessToken', e.target.value)}
              hint={settings.mercadoPagoAccessToken === '****' ? 'Token já configurado. Digite um novo valor para substituir.' : undefined}
            />
            <div className="border-t border-white/10 pt-4">
              <p className="mb-3 text-sm font-medium text-zinc-300">Métodos de pagamento ativos</p>
              <div className="space-y-3">
                <PaymentMethodToggle
                  icon={<Image src="/images/icons/pix.png" alt="Pix" width={20} height={20} className="size-5 object-contain" />}
                  label="Pix"
                  description="Transferência instantânea — aprovação em segundos."
                  checked={(settings.acceptPix as boolean) ?? true}
                  onChange={(v) => patch('acceptPix', v)}
                />
                <PaymentMethodToggle
                  icon={<Image src="/images/icons/Mercadopago.png" alt="Mercado Pago" width={20} height={20} className="size-5 object-contain" />}
                  label="Cartão de crédito"
                  description="Parcelamento em até 12x com juros da operadora."
                  checked={(settings.acceptCreditCard as boolean) ?? true}
                  onChange={(v) => patch('acceptCreditCard', v)}
                />
                <PaymentMethodToggle
                  icon={<Receipt className="h-5 w-5" />}
                  label="Boleto"
                  description="Pagamento com vencimento em até 3 dias úteis."
                  checked={(settings.acceptBoleto as boolean) ?? true}
                  onChange={(v) => patch('acceptBoleto', v)}
                />
                <PaymentMethodToggle
                  icon={<Image src="/images/icons/PayPal.png" alt="PayPal" width={20} height={20} className="size-5 object-contain" />}
                  label="PayPal"
                  description="Carteira digital internacional."
                  checked={(settings.acceptPayPal as boolean) ?? false}
                  onChange={(v) => patch('acceptPayPal', v)}
                />
              </div>
            </div>
            <SettingsSelect
              label="Validade do Pix"
              name="pixExpiration"
              value={(settings.pixExpiration as string) ?? '30min'}
              onChange={(e) => patch('pixExpiration', e.target.value)}
              options={[
                { value: '30min', label: '30 minutos' },
                { value: '1h', label: '1 hora' },
                { value: '2h', label: '2 horas' },
                { value: '24h', label: '24 horas' },
              ]}
            />
            <SettingsSelect
              label="Máximo de parcelas"
              name="maxInstallments"
              value={String((settings.maxInstallments as number) ?? 12)}
              onChange={(e) => patch('maxInstallments', Number(e.target.value))}
              options={Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1}x`,
              }))}
            />
            <SettingsInput
              label="Desconto à vista (%)"
              name="discountOnCash"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={String((settings.discountOnCash as number) ?? 0)}
              onChange={(e) => patch('discountOnCash', Number(clamp(Number(e.target.value), 0, 100)))}
            />
          </SettingsCard>
        )}

        {active === 'shipping' && (
          <SettingsCard icon={<Truck className="h-5 w-5" />} title="Entrega e Frete" description="Configure prazos, frete grátis e rastreamento.">
            <SettingsToggle
              label="Frete grátis"
              description="Habilitar frete grátis acima de um valor mínimo."
              value={(settings.enableFreeShipping as boolean) ?? false}
              onChange={(v) => patch('enableFreeShipping', v)}
            />
            {Boolean(settings.enableFreeShipping) && (
              <SettingsInput
                label="Valor mínimo para frete grátis (R$)"
                name="freeShippingAmount"
                type="number"
                min={0}
                step={0.01}
                value={String((settings.freeShippingAmount as number) ?? '')}
                onChange={(e) => patch('freeShippingAmount', Number(e.target.value) || null)}
              />
            )}
            <SettingsToggle
              label="Mostrar prazo estimado"
              description="Exibe prazo de entrega estimado nos produtos."
              value={(settings.showEstimatedDelivery as boolean) ?? true}
              onChange={(v) => patch('showEstimatedDelivery', v)}
            />
            <SettingsToggle
              label="Calcular frete via CEP"
              description="Habilita a calculadora de frete por CEP."
              value={(settings.calculateShipping as boolean) ?? true}
              onChange={(v) => patch('calculateShipping', v)}
            />
            <SettingsSelect
              label="Prazo de processamento (dias úteis)"
              name="processingDays"
              value={String((settings.processingDays as number) ?? 1)}
              onChange={(e) => patch('processingDays', Number(e.target.value))}
              options={Array.from({ length: 5 }, (_, i) => ({
                value: String(i + 1),
                label: `${i + 1} dia${i > 0 ? 's' : ''}`,
              }))}
            />
            <SettingsInput
              label="Mensagem personalizada de entrega"
              name="deliveryMessage"
              value={(settings.deliveryMessage as string) ?? ''}
              onChange={(e) => patch('deliveryMessage', e.target.value)}
              hint="Ex: Enviamos em até 2 dias úteis"
            />
            <SettingsToggle
              label="Rastreamento para o cliente"
              description="Cliente pode acompanhar o pedido."
              value={(settings.showTracking as boolean) ?? true}
              onChange={(v) => patch('showTracking', v)}
            />
          </SettingsCard>
        )}

        {active === 'notifications' && (
          <SettingsCard icon={<Bell className="h-5 w-5" />} title="Notificações" description="Configure quais eventos geram notificações por e-mail.">
            <p className="text-sm font-medium text-zinc-300">Notificações para o administrador</p>
            <div className="space-y-3">
              <SettingsToggle label="Novo pedido realizado" value={(settings.notifyNewOrder as boolean) ?? true} onChange={(v) => patch('notifyNewOrder', v)} />
              <SettingsToggle label="Pedido pago" value={(settings.notifyPaidOrder as boolean) ?? true} onChange={(v) => patch('notifyPaidOrder', v)} />
              <SettingsToggle label="Pedido cancelado" value={(settings.notifyCancelledOrder as boolean) ?? true} onChange={(v) => patch('notifyCancelledOrder', v)} />
              <SettingsToggle label="Novo usuário cadastrado" value={(settings.notifyNewUser as boolean) ?? true} onChange={(v) => patch('notifyNewUser', v)} />
              <SettingsToggle label="Novo feedback recebido" value={(settings.notifyNewFeedback as boolean) ?? true} onChange={(v) => patch('notifyNewFeedback', v)} />
              <SettingsToggle label="Novo briefing recebido" value={(settings.notifyNewBriefing as boolean) ?? true} onChange={(v) => patch('notifyNewBriefing', v)} />
              <SettingsToggle label="Estoque baixo" value={(settings.notifyLowStock as boolean) ?? true} onChange={(v) => patch('notifyLowStock', v)} />
            </div>
            {Boolean(settings.notifyLowStock) && (
              <SettingsInput
                label="Limite de estoque baixo (unidades)"
                name="lowStockThreshold"
                type="number"
                min={1}
                value={String((settings.lowStockThreshold as number) ?? 5)}
                onChange={(e) => patch('lowStockThreshold', Number(clamp(Number(e.target.value), 1, 9999)))}
              />
            )}
            <SettingsTextarea
              label="E-mails para notificações"
              name="adminEmails"
              value={(settings.adminEmails as string) ?? ''}
              onChange={(e) => patch('adminEmails', e.target.value)}
              hint="Um e-mail por linha."
            />
          </SettingsCard>
        )}

        {active === 'appearance' && (
          <SettingsCard icon={<Palette className="h-5 w-5" />} title="Aparência" description="Personalize as cores e elementos visuais da loja.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Cor primária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={(settings.primaryColor as string) ?? '#f97316'}
                    onChange={(e) => patch('primaryColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
                  />
                  <span className="text-sm text-zinc-400">{(settings.primaryColor as string) ?? '#f97316'}</span>
                </div>
              </div>
              <SettingsInput
                label="URL do favicon"
                name="faviconUrl"
                type="url"
                value={(settings.faviconUrl as string) ?? ''}
                onChange={(e) => patch('faviconUrl', e.target.value)}
              />
            </div>
            {Boolean(settings.faviconUrl) && (
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <img
                  src={settings.faviconUrl as string}
                  alt="Favicon preview"
                  className="h-8 w-8 rounded object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <span className="text-xs text-zinc-500">Preview do favicon</span>
              </div>
            )}
            <SettingsToggle
              label="Banner de anúncio"
              description="Mostrar o banner de anúncio no topo da loja."
              value={(settings.showAnnouncementBanner as boolean) ?? true}
              onChange={(v) => patch('showAnnouncementBanner', v)}
            />
            {Boolean(settings.showAnnouncementBanner) && (
              <SettingsInput
                label="Texto do banner"
                name="announcementText"
                value={(settings.announcementText as string) ?? ''}
                onChange={(e) => patch('announcementText', e.target.value)}
              />
            )}
            <SettingsSelect
              label="Modo escuro"
              name="forceDarkMode"
              value={(settings.forceDarkMode as string) ?? 'auto'}
              onChange={(e) => patch('forceDarkMode', e.target.value)}
              options={[
                { value: 'auto', label: 'Auto (segue o sistema)' },
                { value: 'forced', label: 'Forçado' },
              ]}
            />
            <SettingsToggle
              label="Avaliações na home"
              description="Exibir avaliações de clientes na página inicial."
              value={(settings.showReviewsOnHome as boolean) ?? true}
              onChange={(v) => patch('showReviewsOnHome', v)}
            />
          </SettingsCard>
        )}

        {active === 'seo' && (
          <SettingsCard icon={<Globe className="h-5 w-5" />} title="SEO" description="Configurações de otimização para mecanismos de busca.">
            <SettingsInput
              label="Meta title padrão"
              name="metaTitle"
              maxLength={60}
              value={(settings.metaTitle as string) ?? ''}
              onChange={(e) => patch('metaTitle', e.target.value)}
              hint="Máximo de 60 caracteres recomendado."
            />
            <SettingsTextarea
              label="Meta description padrão"
              name="metaDescription"
              maxCount={160}
              value={(settings.metaDescription as string) ?? ''}
              onChange={(e) => patch('metaDescription', e.target.value)}
              hint="Máximo de 160 caracteres."
            />
            <SettingsInput
              label="URL canônica base"
              name="canonicalUrl"
              type="url"
              value={(settings.canonicalUrl as string) ?? ''}
              onChange={(e) => patch('canonicalUrl', e.target.value)}
            />
            <SettingsToggle
              label="Permitir indexação"
              description="Quando desativado, define robots: noindex."
              value={(settings.allowIndexing as boolean) ?? true}
              onChange={(v) => patch('allowIndexing', v)}
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SettingsInput
                label="Google Analytics ID"
                name="googleAnalyticsId"
                value={(settings.googleAnalyticsId as string) ?? ''}
                onChange={(e) => patch('googleAnalyticsId', e.target.value)}
                hint="Ex: G-XXXXXXXXXX"
              />
              <SettingsInput
                label="Facebook Pixel ID"
                name="facebookPixelId"
                value={(settings.facebookPixelId as string) ?? ''}
                onChange={(e) => patch('facebookPixelId', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">URL do Sitemap</label>
              <div className="flex h-10 items-center rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-zinc-500">
                {(settings.sitemapUrl as string) || (typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : '/sitemap.xml')}
              </div>
              <p className="mt-1 text-xs text-zinc-500">Gerado automaticamente.</p>
            </div>
          </SettingsCard>
        )}

        {active === 'security' && (
          <SettingsCard icon={<Shield className="h-5 w-5" />} title="Segurança" description="Políticas de segurança e acesso ao painel.">
            <SettingsToggle
              label="2FA obrigatório para admins"
              description="Exige autenticação em dois fatores para todos os administradores."
              value={(settings.requireTwoFactorAdmin as boolean) ?? false}
              onChange={(v) => patch('requireTwoFactorAdmin', v)}
            />
            <SettingsToggle
              label="Bloquear sessões simultâneas"
              description="Impede o mesmo usuário de ter múltiplas sessões ativas."
              value={(settings.blockConcurrentSessions as boolean) ?? false}
              onChange={(v) => patch('blockConcurrentSessions', v)}
            />
            <SettingsSelect
              label="Expiração de sessão"
              name="sessionExpiration"
              value={(settings.sessionExpiration as string) ?? '24h'}
              onChange={(e) => patch('sessionExpiration', e.target.value)}
              options={[
                { value: '1h', label: '1 hora' },
                { value: '8h', label: '8 horas' },
                { value: '24h', label: '24 horas' },
                { value: '7d', label: '7 dias' },
              ]}
            />
            <SettingsToggle
              label="Exigir senha forte"
              description="Mínimo 8 caracteres, maiúscula, número e caractere especial."
              value={(settings.requireStrongPassword as boolean) ?? true}
              onChange={(v) => patch('requireStrongPassword', v)}
            />
          </SettingsCard>
        )}
      </div>
    </div>
  );
}
