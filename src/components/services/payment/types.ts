export type PaymentMethod = 'pix' | 'mercadopago' | 'paypal';

export type PaymentBriefing = {
  id?: string;
  name: string;
  email: string;
  whatsapp: string;
};

export type PaymentPayload = {
  amount: number;
  description: string;
  briefing: PaymentBriefing;
  whatsappUrl: string;
  mpPublicKey?: string;
  paypalClientId?: string;
};

export type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;
