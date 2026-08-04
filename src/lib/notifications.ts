const ADMIN_PHONE = '5541996713782';

type PixNotificationInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: string;
};

type OrderCancellationInput = PixNotificationInput;

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function sendWhatsApp(message: string, type: string, data?: unknown) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: ADMIN_PHONE,
            type: 'text',
            text: { body: message },
          }),
        },
      );
      if (res.ok) return true;
    } catch {
      // fall through to webhook
    }
  }

  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: ADMIN_PHONE,
        type,
        message,
        data,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendPixNotification(data: PixNotificationInput) {
  await sendWhatsApp(
    `🧾 *Novo Pedido Pix*\n\n📦 Pedido: #${data.orderId}\n👤 Cliente: ${data.customerName}\n📧 ${data.customerEmail}\n🛒 ${data.items}\n💰 Total: ${formatBRL(data.total)}\n\n⏳ Aguardando pagamento...`,
    'pix_order',
    data,
  );
}

export async function sendOrderCancellationNotification(data: OrderCancellationInput) {
  await sendWhatsApp(
    `❌ *Pedido Cancelado*\n\n📦 Pedido: #${data.orderId}\n👤 Cliente: ${data.customerName}\n📧 ${data.customerEmail}\n🛒 ${data.items}\n💰 Total: ${formatBRL(data.total)}\n\n⚠️ O cliente solicitou o cancelamento antes do envio.`,
    'order_cancelled',
    data,
  );
}
