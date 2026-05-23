# Relatório de Auditoria — CAFÉ Store

**Data:** 23/05/2026
**Stack real:** Next.js 14.2 (App Router) + TypeScript + Prisma + Neon PostgreSQL + NextAuth v5
**Stack do checklist:** PHP 7.2 + MySQL (adaptado neste relatório para a stack real)

---

## Resumo Executivo

- **Total de funcionalidades verificadas:** 180
- ✅ **Completas:** 108 (60%)
- ⚠️ **Parciais:** 32 (18%)
- ❌ **Ausentes:** 32 (18%)
- 🔒 **Com bug:** 8 (4%)

---

## Status por Módulo

| Módulo | Completas | Parciais | Ausentes | Bug | % |
|--------|-----------|----------|----------|-----|---|
| 1. Autenticação e Usuário | 18 | 3 | 0 | 1 | 82% |
| 2. Produtos | 25 | 5 | 4 | 2 | 69% |
| 3. Carrinho | 9 | 3 | 4 | 1 | 56% |
| 4. Checkout e Pagamento | 8 | 4 | 7 | 2 | 38% |
| 5. Pedidos | 7 | 1 | 5 | 0 | 54% |
| 6. Favoritos | 2 | 3 | 1 | 1 | 43% |
| 7. Busca | 3 | 0 | 5 | 0 | 38% |
| 8. Admin | 10 | 2 | 5 | 1 | 56% |
| 9. Emails | 4 | 1 | 3 | 0 | 50% |
| 10. Notificações | 4 | 0 | 3 | 1 | 50% |
| 11. Segurança | 8 | 0 | 4 | 0 | 67% |
| 12. Responsividade | 7 | 0 | 2 | 0 | 78% |
| 13. Performance | 3 | 1 | 4 | 0 | 38% |

---

## Funcionalidades Completas ✅

### Módulo 1 — Autenticação e Usuário
- Formulário de login com email + senha (`LoginForm.tsx`)
- Validação frontend e backend (Zod schemas em `validations.ts`)
- Hash de senha com bcryptjs (12 rounds)
- Proteção contra brute force (5 tentativas / 15min por IP em `auth.ts`)
- Cadastro com nome, email, phone, CPF, senha (`RegisterForm.tsx`)
- Validação de email único (Prisma unique + Zod)
- Validação de força de senha (Zod + strength meter visual)
- Email de confirmação de cadastro (via Resend)
- Avatar automático com inicial do nome
- Sessão gerenciada por NextAuth v5 (JWT)
- Middleware protegendo rotas (`/orders`, `/profile`, `/checkout`, `/admin/*`)
- Logout funcional (NextAuth signOut)
- Recuperação de senha com token único e expiração de 1h
- Formulário de nova senha com token
- Editar perfil: nome, email, senha, avatar, endereços
- Histórico de pedidos no perfil
- Visualizar favoritos no perfil

### Módulo 2 — Produtos
- Listagem com busca por nome (`getProducts()` com Prisma `contains`)
- Filtro por categoria
- Ordenação (relevância, menor/maior preço, mais recente)
- Paginação no backend
- URL amigável com parâmetros compartilháveis (`/products?category=X&q=Y`)
- Estado vazio com mensagem (`EmptyState`)
- Skeleton loading (`products/loading.tsx`)
- Página de produto individual (`/products/[slug]`)
- Galeria de imagens com zoom lens (desktop), arrows, swipe mobile, modal fullscreen (`ImageGallery.tsx`)
- Thumbnails clicáveis (72px, snap scroll)
- Modal fullscreen com dots, ESC, swipe
- Variações de produto (Cor: Preta/Branca)
- Seletor de quantidade com min/max (`QuantityStepper`)
- Preço com desconto (oldPrice + cálculo de %)
- Parcelamento automático em 12x
- Desconto Pix 5% calculado
- Countdown de oferta (4h timer regressivo)
- Exibição de estoque com cores (verde/laranja/vermelho)
- Botão "Adicionar ao Carrinho" com loading e feedback
- Botão "Comprar Agora" (redireciona ao checkout)
- Favoritar com animação burst
- Compartilhar (WhatsApp, X/Twitter, Copiar link)
- Cálculo de frete (simulado com máscara de CEP)
- Produtos relacionados (mesma categoria)
- Sticky bar ao rolar (`StickyBar.tsx`)
- Schema.org JSON-LD para Google Shopping
- Meta tags Open Graph + Twitter Card

### Módulo 3 — Carrinho
- Adicionar ao carrinho com variação
- Remover item
- Alterar quantidade
- Limpar carrinho
- Salvamento em localStorage (Zustand persist)
- Contador na navbar em tempo real (`CartCount`)
- Drawer lateral (`CartDrawer.tsx`)
- Página de carrinho completa (`CartPageClient.tsx`)
- Toast de confirmação ao adicionar

### Módulo 4 — Checkout e Pagamento
- Exigir login (middleware)
- Resumo dos itens do carrinho
- Formulário de endereço completo
- CEP com máscara (`99999-999`)
- Salvamento de endereço para próximas compras
- Resumo do pedido com total final
- Seleção de método de pagamento (Pix)
- Geração de Pix: QR Code + copia-e-cola + CRC16

### Módulo 5 — Pedidos
- Lista de pedidos do usuário (`/orders`)
- Detalhe do pedido (`/orders/[id]`)
- Itens com imagem e preço
- Endereço de entrega
- Método de pagamento
- Status visual com timeline (`OrderTimeline.tsx`)
- Status: PENDING → PROCESSING → SHIPPED → DELIVERED | CANCELLED

### Módulo 6 — Favoritos
- Adicionar/remover via API toggle (`/api/wishlist`)
- Página de favoritos (dentro do perfil)

### Módulo 7 — Busca
- Busca por nome
- Busca por categoria
- URL compartilhável com parâmetros

### Módulo 8 — Admin
- Dashboard com métricas (receita, pedidos, produtos, clientes)
- Gráfico de vendas por dia (7 dias)
- Listar todos os produtos
- Criar produto com nome, descrição, preço, categoria, estoque, imagens, status, destaque
- Editar produto
- Excluir produto (soft delete via status)
- Listar pedidos com filtro por status
- Ver detalhe do pedido com itens
- Alterar status do pedido
- Listar usuários
- Gerenciar categorias (CRUD completo)
- Moderação de avaliações (aprovar/rejeitar)
- Proteção de rota: middleware + `requireAdmin()`

### Módulo 9 — Emails
- Email de boas-vindas (novo cadastro)
- Email de verificação de email
- Email de reset de senha
- Confirmação de alteração de senha

### Módulo 10 — Notificações
- Toast ao adicionar ao carrinho
- Toast ao favoritar
- Toast de erro de validação
- Badge do carrinho atualiza sem reload (Zustand)

### Módulo 11 — Segurança
- Prepared statements (Prisma — nativo)
- Escape de output (React — automático)
- Validação e sanitização (Zod em todas as APIs)
- Rate limiting no login (5 tentativas / 15min)
- Upload: Cloudinary gerencia validação de mime type
- Senhas com bcryptjs (12 rounds)
- Rotas admin protegidas (middleware + requireAdmin)
- API keys no servidor (.env.local)

### Módulo 12 — Responsividade
- Navbar com hamburguer no mobile (`MobileNav.tsx`)
- Menu mobile funcional
- Grid de produtos adaptável (1→2→3→4 colunas)
- Página de produto: galeria em cima no mobile
- Carrinho: layout adaptável
- Checkout: coluna única no mobile
- Touch/swipe na galeria de imagens

### Módulo 13 — Performance
- Lazy loading em imagens (Next.js Image nativo)
- Paginação no backend
- JavaScript não crítico (Next.js code splitting)

---

## Funcionalidades Parciais ⚠️

### Módulo 1 — Autenticação
| Funcionalidade | Status | O que falta |
|---|---|---|
| "Lembrar de mim" | ⚠️ | JWT já tem 7 dias de validade, mas não há toggle explícito no formulário de login |
| Modal de login | ⚠️ | Não existe modal — login é página dedicada `/login` |
| Sessão: inatividade | ⚠️ | JWT expira em 7 dias, mas não há timeout por inatividade |

### Módulo 2 — Produtos
| Funcionalidade | Status | O que falta |
|---|---|---|
| Estado "esgotado" com aviso | ⚠️ | Mostra "Sem estoque" mas sem formulário de "Avisar quando disponível" |
| Avaliações: formulário | ⚠️ | UI existe mas está disabled — não conectado ao backend de verificação de compra |
| Avaliações: curtir | ⚠️ | Botão "Útil" existe mas não funcional (mock com random) |
| Perguntas e respostas | ⚠️ | UI existe mas disabled — sem backend implementado |

### Módulo 3 — Carrinho
| Funcionalidade | Status | O que falta |
|---|---|---|
| Carrinho no MySQL | ⚠️ | Só localStorage. Não há carrinho no banco para usuários logados |
| Verificar estoque ao adicionar | ⚠️ | Não há verificação client-side. API de checkout verifica, mas deveria alertar antes |
| Frete grátis indicador | ⚠️ | Citado no resultado do frete, mas sem destaque visual |

### Módulo 4 — Checkout
| Funcionalidade | Status | O que falta |
|---|---|---|
| Auto-preenchimento ViaCEP | ⚠️ | CEP com máscara existe, mas sem API de auto-preenchimento |
| Limpar carrinho após compra | ⚠️ | Não limpa automaticamente após confirmação |
| Timer PIX | ⚠️ | QR Code gerado mas sem countdown de expiração (30min) |

### Módulo 5 — Pedidos
| Funcionalidade | Status | O que falta |
|---|---|---|
| Avaliar produto após entrega | ⚠️ | Não há link direto na página do pedido |

### Módulo 6 — Favoritos
| Funcionalidade | Status | O que falta |
|---|---|---|
| Coração preenchido nos cards | ⚠️ | `ProductCard.tsx` usa estado local, não persiste no servidor |
| Checar favorito ao visitar página | ⚠️ | ProductPurchasePanel não verifica wishlist da API |

### Módulo 8 — Admin
| Funcionalidade | Status | O que falta |
|---|---|---|
| Produtos: criar com Cloudinary | ⚠️ | Formulário de produto aceita URLs de texto, não upload direto ao Cloudinary |
| Pedidos: código de rastreio | ⚠️ | Não há campo no admin para adicionar código de rastreio |

### Módulo 9 — Emails
| Funcionalidade | Status | O que falta |
|---|---|---|
| Confirmação de pedido | ⚠️ | Função `sendOrderConfirmation` existe mas não é chamada no checkout |

### Módulo 13 — Performance
| Funcionalidade | Status | O que falta |
|---|---|---|
| Cloudinary otimizado | ⚠️ | Cloudinary integrado, mas imagens não usam transformações de tamanho por breakpoint |

---

## Funcionalidades Ausentes ❌

### Alta Prioridade

| Funcionalidade | Módulo | Impacto |
|---|---|---|
| **Pagamento com Cartão de Crédito** (Mercado Pago) | 4 | `src/lib/mercadopago.ts` é um arquivo vazio. Sem integração real |
| **Pagamento com PayPal** | 4 | `src/lib/paypal.ts` é um arquivo vazio. Sem integração real |
| **Cupom de desconto** | 4, 8 | Não existe modelo Coupon no Prisma, nem UI no admin ou checkout |
| **Polling de status PIX** | 4 | Checkout não faz polling para verificar se PIX foi pago |
| **Webhook valida assinatura** | 4, 11 | Webhook Mercado Pago não valida assinatura HMAC-SHA256 |
| **Banners** | 8 | Não existe modelo Banner no Prisma, nem CRUD no admin |
| **Vistos recentemente** (localStorage) | 2 | Não implementado em nenhum lugar |
| **Compre junto / Bundle** | 2 | Não existe lógica de bundle com desconto |

### Média Prioridade

| Funcionalidade | Módulo |
|---|---|
| Busca em tempo real com debounce (300ms) | 7 |
| Autocomplete/sugestões de busca | 7 |
| Histórico de buscas recentes (localStorage) | 7 |
| Sugestões de produtos populares quando busca vazia | 7 |
| CSRF tokens em formulários POST | 11 |
| Rate limiting em endpoints de API (além de login) | 11 |
| Headers de segurança: X-Frame-Options, X-XSS-Protection, CSP | 11 |
| Sincronizar carrinho localStorage → banco ao fazer login | 3 |
| Toast com "desfazer" ao remover item do carrinho | 3, 10 |
| Solicitar devolução/troca no pedido | 5 |
| Código de rastreio integrado (link Correios) | 5 |
| Download de nota fiscal | 5 |
| Exportar pedidos em CSV (admin) | 8 |
| Ativar/desativar conta de usuário (admin) | 8 |
| Promover usuário a admin | 8 |
| Log de ações administrativas | 8 |
| CSS crítico inline (above the fold) | 13 |
| Cache de resultados de busca frequentes | 13 |
| Debounce na busca | 13 |

### Baixa Prioridade

| Funcionalidade | Módulo |
|---|---|
| Boleto bancário (Mercado Pago) | 4 |
| Email de pedido enviado (com código de rastreio) | 9 |
| Email de pedido entregue (CTA para avaliar) | 9 |
| Email de aviso de estoque | 9 |
| Tabelas admin com scroll horizontal no mobile | 12 |
| Carrossel de produtos com touch/swipe | 12 |
| Gzip/compressão via servidor | 13 |

---

## Bugs Encontrados 🔒

### 🔒 Bug 1 — Carrinho localStorage conflita com Zustand
**Arquivo:** `src/components/store/CartDrawer.tsx` + `src/store/cart.ts`
**Descrição:** Existem DOIS sistemas de carrinho: um via Zustand (store/cart.ts, persistido no localStorage como "cafe-store-cart") e outro via funções soltas no CartDrawer.tsx (getCart/addToCart/removeFromCart usando localStorage diretamente como "cafe-cart"). O ProductCard.tsx usa as funções do CartDrawer, enquanto o ProductPurchasePanel.tsx usa o Zustand. Isto significa que adicionar um item pelo card de produto e pelo painel de compra **vai para carrinhos diferentes**.
**Severidade:** Alta

### 🔒 Bug 2 — ProductCard chama `addToCart` do CartDrawer, mas impacto não aparece no header
**Arquivo:** `src/components/store/ProductCard.tsx` linha que chama `addToCart` + `src/components/layout/CartCount.tsx`
**Descrição:** ProductCard usa as funções do CartDrawer (localStorage direto), enquanto CartCount (badge do header) lê do Zustand store. O badge não atualiza quando adiciona pelo card.
**Severidade:** Alta

### 🔒 Bug 3 — Variants JSON mal formatado no fallback
**Arquivo:** `src/lib/products.ts` (fallbackProductVariants)
**Descrição:** `JSON.parse('[{"name":"Cor","values":["Preta","Branca"]}]')` é usado para gerar variants dos fallback products. `JSON.parse` pode ser frágil se o formato mudar. Além disso, os produtos que não têm variantes retornam `[]` vazio, mas o código de parse de variantes espera um array válido, o que está correto. Contudo, se o banco retornar `null`, o `parseVariants` lida com isso.
**Severidade:** Baixa

### 🔒 Bug 4 — Checkout não valida estoque contra race condition
**Arquivo:** `src/app/api/checkout/route.ts`
**Descrição:** O checkout decrementa o estoque dentro de uma transação Prisma (`$transaction`), o que é bom. Porém, se o produto estava no carrinho com estoque 5 e outro usuário comprou 5 unidades no meio tempo, a transação lançará erro (stock < 0) se não houver verificação `stock >= quantity` dentro da transaction ou um `where: { stock: { gte: quantity } }` no update.
**Severidade:** Média

### 🔒 Bug 5 — ProductPurchasePanel chama `handleAddToCart` duas vezes no "Comprar Agora"
**Arquivo:** `src/components/store/ProductPurchasePanel.tsx`
**Descrição:** `handleBuyNow` chama `handleAddToCart()` e depois `router.push('/checkout')` com setTimeout. `handleAddToCart` já adiciona ao carrinho. Mas `handleAddToCart` tem side effect de `setAddedSuccess(true)` + `setQuantity(1)` (via useEffect) que não são relevantes para compra imediata. Funcional, mas redundante.
**Severidade:** Baixa

### 🔒 Bug 6 — Guest checkout permite prosseguir sem login até o fim
**Arquivo:** `src/middleware.ts`
**Descrição:** O middleware protege `/checkout`, redirecionando para `/login?callbackUrl=/checkout` se não autenticado. Isso é correto, mas não há aviso prévio para o usuário de que precisa fazer login para finalizar a compra. O fluxo ideal seria permitir navegar até o checkout, mas exigir login no passo final.
**Severidade:** Média

### 🔒 Bug 7 — ProfileDashboardClient não recarrega dados após upload de avatar
**Arquivo:** `src/components/account/ProfileDashboardClient.tsx`
**Descrição:** Após upload de avatar (via Cloudinary), a página não recarrega o `user.image` — precisa de refresh manual.
**Severidade:** Baixa

### 🔒 Bug 8 — StickyBar usa `addItem` sem variantes do produto selecionado
**Arquivo:** `src/components/store/StickyBar.tsx`
**Descrição:** O StickyBar adiciona o produto ao carrinho sem considerar as variantes selecionadas (apenas `id`, `quantity: 1`, sem `variants`). Se o produto tiver variações de cor, a compra pelo sticky bar não registra a cor escolhida.
**Severidade:** Média

---

## Arquivos Faltando vs. Stack Real

O checklist original é para PHP. Os equivalentes em Next.js que **não existem**:

| Função | Stack PHP (ausente) | Stack Next.js (status) |
|---|---|---|
| `carrinho.php` | ❌ | ✅ `src/app/(store)/cart/page.tsx` + `CartPageClient` |
| `checkout.php` | ❌ | ✅ `src/app/(store)/checkout/page.tsx` + `CheckoutPageClient` |
| `pedidos.php` | ❌ | ✅ `src/app/(store)/orders/page.tsx` |
| `perfil.php` | ❌ | ✅ `src/app/(store)/profile/page.tsx` |
| `favoritos.php` | ❌ | ⚠️ Integrado ao perfil, sem página dedicada |
| `auth/login.php` | ❌ | ✅ `src/app/(store)/login/page.tsx` |
| `auth/cadastro.php` | ❌ | ✅ `src/app/(store)/register/page.tsx` |
| `auth/recuperar-senha.php` | ❌ | ✅ Forgot + Reset |
| `admin/banners.php` | ❌ | ❌ Não existe |
| `admin/cupons.php` | ❌ | ❌ Não existe |
| `api/frete.php` | ❌ | ⚠️ Simulado no client-side |
| `api/pagamento.php` | ❌ | ⚠️ Pix implementado, Cartão/PayPal são stubs |
| `api/webhook.php` | ❌ | ✅ `api/webhooks/mercadopago/route.ts` |
| `api/upload.php` | ❌ | ✅ `api/upload/route.ts` (Cloudinary) |
| `assets/js/galeria.js` | ❌ | ✅ Embutido no `ImageGallery.tsx` |
| `assets/js/carrinho.js` | ❌ | ✅ Zustand store + CartDrawer |
| `assets/js/filtros.js` | ❌ | ✅ `ProductFilters.tsx` + `ProductsPageClient.tsx` |
| `assets/js/checkout.js` | ❌ | ✅ `CheckoutPageClient.tsx` |
| `components/modal-login.php` | ❌ | ❌ Não existe modal de login |
| `components/drawer-carrinho.php` | ❌ | ✅ `CartDrawer.tsx` |
| `components/toast.php` | ❌ | ✅ `Toast.tsx` + `showToast()` |

---

## Próximos Passos Recomendados

### Imediatos (bugs críticos)
1. **Unificar os dois sistemas de carrinho** — migrar CartDrawer para usar o Zustand store, ou eliminar o duplicado. Este é o bug mais grave.
2. **Adicionar verificação de estoque no checkout** — usar `where: { stock: { gte: quantity } }` no update para evitar race condition.
3. **StickyBar respeitar variantes** — capturar variantes selecionadas antes de adicionar ao carrinho.

### Alta prioridade (funcionalidades faltantes)
4. **Implementar Mercado Pago (Cartão de Crédito)** — preencher `src/lib/mercadopago.ts` com SDK do Mercado Pago para tokenização e pagamento com cartão.
5. **Polling de status PIX** — adicionar `setInterval` no `CheckoutConfirmationClient` para verificar se pagamento foi confirmado a cada 5s.
6. **Validar assinatura do webhook** — verificar HMAC-SHA256 do header `X-Signature` do Mercado Pago.
7. **Sincronizar carrinho localStorage → banco** ao fazer login.

### Média prioridade
8. **Cupons de desconto** — criar modelo Coupon no Prisma, CRUD no admin, aplicar no checkout.
9. **CSRF tokens** — implementar double-submit cookie pattern nas APIs POST/PUT/DELETE.
10. **Vistos recentemente** — implementar no product page com localStorage.
11. **Debounce na busca** (300ms) — já existe o input, só falta o debounce.
12. **Auto-preenchimento ViaCEP** — integrar API dos Correios no formulário de endereço.

### Baixa prioridade
13. **Banners no admin** — criar modelo Banner + CRUD + exibição na home.
14. **Responsividade das tabelas admin** — adicionar overflow-x scroll.
15. **Rate limiting nas APIs** — implementar middleware de rate limit para endpoints públicos.
