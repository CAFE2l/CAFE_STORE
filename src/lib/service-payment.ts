import { MercadoPagoConfig, Payment } from 'mercadopago';
import { capturePayPalOrder, createPayPalOrder } from '@/lib/paypal';

export type PaymentStatusResponse = {
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  providerStatus?: string;
};

export function getMercadoPagoClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return null;
  }

  return new Payment(new MercadoPagoConfig({ accessToken }));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
}

export async function createServicePayPalOrder({
  amount,
  description,
  referenceId,
}: {
  amount: number;
  description: string;
  referenceId: string;
}) {
  const baseUrl = getBaseUrl();

  return createPayPalOrder({
    items: [{ name: description, quantity: 1, unitPrice: amount }],
    total: amount,
    orderId: referenceId,
    returnUrl: `${baseUrl}/servicos/obrigado`,
    cancelUrl: `${baseUrl}/servicos`,
  });
}

export async function captureServicePayPalOrder(orderId: string) {
  return capturePayPalOrder(orderId);
}

export function mapMercadoPagoStatus(status?: string, expiration?: string | Date | null): PaymentStatusResponse {
  if (status === 'approved') return { status: 'approved', providerStatus: status };
  if (status === 'rejected' || status === 'cancelled') return { status: 'rejected', providerStatus: status };

  if (expiration && new Date(expiration).getTime() <= Date.now()) {
    return { status: 'expired', providerStatus: status };
  }

  return { status: 'pending', providerStatus: status };
}
