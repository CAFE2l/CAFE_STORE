const MP_API = 'https://api.mercadopago.com';

type CreatePreferenceInput = {
  items: { title: string; quantity: number; unitPrice: number }[];
  payerEmail: string;
  payerName?: string;
  externalReference: string;
  notificationUrl: string;
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  };
};

type PreferenceResult =
  | { ok: true; initPoint: string; preferenceId: string }
  | { ok: false; error: string };

export async function createCheckoutPreference(
  input: CreatePreferenceInput,
): Promise<PreferenceResult> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    return { ok: false, error: 'Mercado Pago nao configurado.' };
  }

  try {
    const res = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: input.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: 'BRL',
        })),
        payer: {
          name: input.payerName,
          email: input.payerEmail,
        },
        back_urls: input.backUrls,
        auto_return: 'approved',
        notification_url: input.notificationUrl,
        external_reference: input.externalReference,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[MERCADO_PAGO] Create preference error:', res.status, errBody);
      return { ok: false, error: `Erro ao criar pagamento: ${res.status}` };
    }

    const data = await res.json();

    return {
      ok: true,
      initPoint: data.init_point as string,
      preferenceId: data.id as string,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    console.error('[MERCADO_PAGO] Network error:', message);
    return { ok: false, error: 'Erro de conexao com Mercado Pago.' };
  }
}
