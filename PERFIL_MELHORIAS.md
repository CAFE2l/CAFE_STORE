# Melhorias na página de Perfil

## Arquivos alterados

### 1. `src/components/account/ProfileSidebar.tsx`
- Substituídos ícones emoji por ícones `lucide-react` (User, Package, Heart, MapPin, Tag, Lock, LogOut)
- Adicionado modal de confirmação antes de sair (Sair)
- Corrigida detecção de item ativo via `useSearchParams` para links com `?section=`
- Adicionada versão mobile do botão Sair nas tabs horizontais

### 2. `src/components/account/ProfileDashboardClient.tsx`
- Corrigido typo "Seguranca" → "Segurança" no comentário
- Adicionado campo `productImages` ao tipo `OrderItem`
- Adicionado import `Package` da `lucide-react`
- Adicionadas thumbnails dos produtos nos cards de "Últimos pedidos"
- Melhorado estado vazio de pedidos com ilustração e texto descritivo
- Adicionado `activeCoupons` às props para exibir contagem real
- Adicionada tooltip explicativa no badge de nível (mostra quantos pedidos faltam para subir)

### 3. `src/lib/account.ts`
- Adicionado campo `productImages` ao tipo `AccountOrderListItem`
- Atualizada query `getUserOrders` para incluir `items.product.images`
- Atualizada query `getUserOrderById` para incluir `productImages`
- Extraídas imagens dos produtos para exibição em miniatura

### 4. `src/app/(store)/profile/page.tsx`
- Adicionada importação de `prisma`
- Adicionada query de contagem de cupons ativos (`activeCoupons`)
- Passado `activeCoupons` como prop para `ProfileDashboardClient`

## Itens auditados vs. status

| # | Item | Status |
|---|------|--------|
| 1 | Corrigir typo "Seguranca" → "Segurança" | ✅ Já estava correto nos textos visíveis; corrigido commentário |
| 2 | "Cliente desde" não editável | ✅ Já era `<p>` somente leitura |
| 3 | Avatar funcional com upload | ✅ Já funcional (input file oculto + API Cloudinary) |
| 4 | Sidebar com navegação | ✅ Melhorado (lucide-react icons + confirmação logout) |
| 5 | Cards clicáveis e navegáveis | ✅ Já eram links |
| 6 | Feedback visual ao salvar | ✅ Já implementado (Toast + loading + erros inline) |
| 7 | Últimos pedidos com thumbnail | ✅ Implementado (busca productImages na query) |
| 8 | Validação e máscara no telefone | ✅ Já implementado |
| 9 | Indicador de nível do cliente | ✅ Já implementado + tooltip explicativa |
| 10 | Campos obrigatórios sinalizados | ✅ Já implementado |
| — | Contagem de cupons no resumo | ✅ Novo (busca cupons ativos do banco) |
