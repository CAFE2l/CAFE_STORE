const ADMIN_PHONE = '5541996713782';

type PixNotificationInput = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: string;
};

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function sendViaWebhook(data: PixNotificationInput) {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: ADMIN_PHONE,
        type: 'pix_order',
        message: `🧾 *Novo Pedido Pix*\n\n📦 Pedido: #${data.orderId}\n👤 Cliente: ${data.customerName}\n📧 ${data.customerEmail}\n🛒 ${data.items}\n💰 Total: ${formatBRL(data.total)}\n\n⏳ Aguardando pagamento...`,
        data,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendViaMetaApi(data: PixNotificationInput) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  try {
    const message = `🧾 *Novo Pedido Pix*\n\n📦 Pedido: #${data.orderId}\n👤 Cliente: ${data.customerName}\n📧 ${data.customerEmail}\n🛒 ${data.items}\n💰 Total: ${formatBRL(data.total)}\n\n⏳ Aguardando pagamento...`;

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
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendPixNotification(data: PixNotificationInput) {
  const sent = await sendViaMetaApi(data);
  if (!sent) await sendViaWebhook(data);
}
