FEEDBACKS_INTEGRACAO

Rotas criadas/atualizadas:

1) GET /api/feedbacks/featured-services
   - Retorna os feedbacks aprovados e marcados como destaque na página de serviços.
   - Ordenação: featured_services_order ASC
   - Cache: revalidate = 300 (5 minutos)
   - Exemplo de resposta: { success: true, feedbacks: [ ...serializedFeedback ] }

2) PATCH /api/admin/feedbacks/[id]
   - Suporta body: { isFeaturedServices: boolean } (ou is_featured_services)
   - Ao ativar: atribui featured_services_order = count(current featured) + 1
   - Ao desativar: zera o registro e decremeta orders maiores automaticamente
   - Chama revalidatePath('/servicos') e revalidatePath('/api/feedbacks/featured-services') para invalidar cache

3) PUT /api/admin/feedbacks/[id]
   - Mantida funcionalidade existente (isApproved, isVerified, isFeatured)
   - Agora também revalida as rotas relacionadas ao alterar dados

4) (DB) Migration SQL
   - prisma/migrations/20260524153000_add_featured_services/migration.sql
   - Adiciona colunas: is_featured_services BOOLEAN DEFAULT false
                    featured_services_order INTEGER DEFAULT 0
   - Cria índice: idx_feedbacks_featured_services

Como usar no admin (UI):

- Na listagem de feedbacks (Admin), foi adicionada um toggle "Na página de serviços" (FeaturedServicesToggle) junto à área de moderação.
  - Ao ativar, o feedback ganha posição ao final da lista de destaques (featured_services_order incremental).
  - Ao desativar, os demais destaques são reordenados automaticamente.

Reordenação (opcional):
- Implementar endpoint adicional PATCH /api/admin/feedbacks/reorder-services aceita { orderedIds: string[] } para atualizar featured_services_order em lote.
- Frontend: lista drag-and-drop no admin usando @dnd-kit/sortable.

Integração na página de serviços:
- O HTML estático de depoimentos foi substituído por um componente cliente:
  src/components/sections/TestimonialsSection.tsx
- O componente faz fetch para /api/feedbacks/featured-services e exibe:
  - avatar (ou fallback com iniciais), nome, cargo/empresa, texto, estrelas e badge do serviço
  - skeleton enquanto carrega
  - não renderiza nada se não houver destaques

Passos para aplicar em produção:
1) Rodar migration (Prisma):
   pnpm prisma migrate deploy
   ou durante desenvolvimento: pnpm prisma migrate dev
2) Gerar client Prisma:
   pnpm prisma generate
3) Deploy / Build do Next.js
4) (Opcional) Instalar libs para drag-and-drop se for implementar: @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

Observações:
- Serialização dos feedbacks foi atualizada (src/lib/feedbacks.ts) para incluir is_featured_services e featured_services_order.
- Revalidação por revalidatePath é chamada nas rotas de admin que alteram o destaque.

Se quiser, implemento também o endpoint /api/admin/feedbacks/reorder-services e a UI drag-and-drop no admin.
