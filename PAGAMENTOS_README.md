# Pagamentos de Serviços

Este projeto usa Mercado Pago para Pix e cartão, e PayPal para carteira digital no checkout de serviços.

## Mercado Pago

1. Acesse `mercadopago.com.br/developers`.
2. Crie ou selecione uma aplicação.
3. Copie o `Access Token` de produção ou teste.
4. Copie a `Public Key` correspondente.
5. Configure:

```env
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
VITE_MP_PUBLIC_KEY=
NEXT_PUBLIC_MP_PUBLIC_KEY=
```

`MP_ACCESS_TOKEN` fica apenas no back-end. A chave pública pode ser exposta ao front via `VITE_MP_PUBLIC_KEY` ou `NEXT_PUBLIC_MP_PUBLIC_KEY`.

## PayPal

1. Acesse `developer.paypal.com`.
2. Crie uma REST API App.
3. Copie o `Client ID`.
4. Copie o `Client Secret`.
5. Configure:

```env
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
VITE_PAYPAL_CLIENT_ID=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_SANDBOX=true
```

Use `PAYPAL_SANDBOX=true` para testes. Em produção, remova ou defina como `false`.

## Webhooks

Mercado Pago envia notificações para:

```text
/api/pagamento/webhook
```

No painel do Mercado Pago, cadastre a URL pública do site com esse caminho.
