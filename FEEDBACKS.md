# Feedbacks

## Rotas públicas

- `GET /feedbacks`: página pública com métricas, distribuição de notas, filtros, grid masonry, botão de útil e formulário em 3 passos.
- `GET /api/feedbacks`: lista feedbacks com `is_approved=true`.
  - Query params: `service`, `sort`, `cursor`, `limit`.
  - Ordenação: `recent`, `rating`, `helpful`.
  - Paginação: cursor-based usando o `id` do último item retornado.
- `GET /api/feedbacks/stats`: retorna `totalApproved`, `avgRating`, `starCounts`, `starPercents`, `totalProjects` e `recommendedPercent`.
- `POST /api/feedbacks`: recebe um novo feedback e salva como pendente (`is_approved=false`).
- `POST /api/feedbacks/:id/helpful`: marca um feedback como útil usando fingerprint de IP + user-agent para evitar duplicidade.

## Rotas admin

- `GET /admin/feedbacks`: painel de moderação protegido por login admin.
- `GET /api/admin/feedbacks`: lista feedbacks pendentes, aprovados e destacados.
- `PUT /api/admin/feedbacks/:id`: atualiza `isApproved`, `isVerified` e `isFeatured`.
- `DELETE /api/admin/feedbacks/:id`: remove feedback rejeitado.

## Campos principais

- `author_name`, `author_email`, `author_avatar_url`
- `author_company`, `author_role`, `author_linkedin_url`
- `service_type`: `landing_page`, `site`, `saas`, `pacote_completo`, `outro`
- `rating`, `title`, `body`, `result_metric`
- `project_url`, `video_url`
- `is_verified`, `is_featured`, `is_approved`, `helpful_count`

## Moderação

Todo feedback enviado pelo formulário entra como pendente. Ele só aparece na página pública depois de aprovação manual em `/admin/feedbacks`.

O admin pode:
- Aprovar ou desaprovar.
- Marcar como verificado.
- Destacar no topo da listagem pública.
- Rejeitar/remover.

## E-mails

Ao receber um feedback:
- O admin recebe notificação se `ADMIN_EMAIL` ou `RESEND_ADMIN_EMAIL` estiver configurado.
- O cliente recebe confirmação de recebimento pelo Resend, quando `RESEND_API_KEY` estiver configurado.

## Uploads

O formulário aceita seleção opcional de foto e vídeo para a experiência de envio e valida o limite do vídeo em 50MB. Como não há storage público de uploads configurado para clientes, a API salva URLs quando fornecidas e usa avatar DiceBear automaticamente quando não houver foto pública.
