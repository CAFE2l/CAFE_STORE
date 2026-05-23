const PAYPAL_API = 'https://api-m.paypal.com';
const PAYPAL_SANDBOX_API = 'https://api-m.sandbox.paypal.com';

function getBaseUrl() {
  return process.env.PAYPAL_SANDBOX === 'true' ? PAYPAL_SANDBOX_API : PAYPAL_API;
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) return null;

  try {
    const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.access_token as string;
  } catch {
    return null;
  }
}

type CreateOrderInput = {
  items: { name: string; quantity: number; unitPrice: number }[];
  total: number;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
};

type CreateOrderResult =
  | { ok: true; approvalUrl: string; paypalOrderId: string }
  | { ok: false; error: string };

export async function createPayPalOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const token = await getAccessToken();

  if (!token) {
    return { ok: false, error: 'PayPal nao configurado.' };
  }

  try {
    const res = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'PayPal-Request-Id': input.orderId,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: input.orderId,
            description: `Pedido CAFE STORE #${input.orderId}`,
            amount: {
              currency_code: 'BRL',
              value: input.total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'BRL',
                  value: input.total.toFixed(2),
                },
              },
            },
            items: input.items.map((item) => ({
              name: item.name,
              quantity: String(item.quantity),
              unit_amount: {
                currency_code: 'BRL',
                value: item.unitPrice.toFixed(2),
              },
              category: 'PHYSICAL_GOODS',
            })),
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              landing_page: 'LOGIN',
              user_action: 'PAY_NOW',
              return_url: input.returnUrl,
              cancel_url: input.cancelUrl,
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[PAYPAL] Create order error:', res.status, errBody);
      return { ok: false, error: `Erro ao criar pagamento PayPal: ${res.status}` };
    }

    const data = await res.json();

    const approvalLink = (data.links as Array<{ rel: string; href: string }>).find(
      (link) => link.rel === 'payer-action',
    )?.href;

    if (!approvalLink) {
      return { ok: false, error: 'Link de aprovacao do PayPal nao encontrado.' };
    }

    return {
      ok: true,
      approvalUrl: approvalLink,
      paypalOrderId: data.id as string,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    console.error('[PAYPAL] Network error:', message);
    return { ok: false, error: 'Erro de conexao com PayPal.' };
  }
}

type CaptureResult =
  | { ok: true; status: string; paymentId: string }
  | { ok: false; error: string };

export async function capturePayPalOrder(paypalOrderId: string): Promise<CaptureResult> {
  const token = await getAccessToken();

  if (!token) {
    return { ok: false, error: 'PayPal nao configurado.' };
  }

  try {
    const res = await fetch(`${getBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[PAYPAL] Capture error:', res.status, errBody);
      return { ok: false, error: `Erro ao capturar pagamento: ${res.status}` };
    }

    const data = await res.json();

    const captureId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
      data.purchase_units?.[0]?.payments?.authorizations?.[0]?.id ??
      paypalOrderId;

    return {
      ok: true,
      status: data.status as string,
      paymentId: captureId as string,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    console.error('[PAYPAL] Network error:', message);
    return { ok: false, error: 'Erro de conexao com PayPal.' };
  }
}
