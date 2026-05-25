RECUPERAÇÃO DE SENHA - CAFÉ STORE

Rotas implementadas

- POST /api/auth/forgot-password
  - Body: { email }
  - Sempre retorna 200 com message (não revela existência do e-mail).
  - Cria token na tabela verificationToken (válido 1h). Quando RESEND_API_KEY não está configurado, a resposta inclui devResetUrl (link para abrir em dev).

- GET /api/auth/reset-password?token=xxx
  - Valida o token (existe + não expirado).
  - Retorna { valid: true } ou { valid: false, reason }

- POST /api/auth/reset-password
  - Body: { email, token, password, confirmPassword }
  - Valida token e atualiza senha (bcrypt hash). Remove token.

Páginas

- /forgot-password
  - Formulário para solicitar recuperação (component: ForgotPasswordForm)
  - Mostra devResetUrl em ambiente sem envio configurado.

- /reset-password?email=...&token=...
  - Página que renderiza ResetPasswordForm (nova).
  - Valida token via GET antes de mostrar o formulário e processa a troca de senha.

Variáveis de ambiente necessárias

- RESEND_API_KEY - chave da API Resend (opcional em dev; sem ela o endpoint retorna devResetUrl)
- RESEND_FROM_EMAIL - remetente do e-mail (ex: "Café Store <no-reply@seudominio.com>")
- NEXT_PUBLIC_BASE_URL ou NEXT_PUBLIC_APP_URL - URL pública do app usada para construir links

Debug & troubleshooting

- Se o e-mail não chegar:
  - Verifique RESEND_API_KEY e o painel https://app.resend.com (Emails → procurar destinatário)
  - No servidor, verifique logs (console.info/console.error adicionados ao sendEmail)
  - Em dev, gerar link local: node scripts/generate-reset-link.js user@example.com

Observações

- O projeto já usa o modelo VerificationToken (Prisma). Em vez de criar uma nova tabela, o fluxo usa essa tabela.
- Tokens expiram em 1 hora. Recomenda-se invalidar tokens antigos ao gerar novo.
