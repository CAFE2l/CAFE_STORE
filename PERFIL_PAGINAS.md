# Paginas do Perfil

## Rotas criadas

- `/perfil` - Meu Perfil, usando o dashboard existente sem duplicar a sidebar.
- `/perfil/pedidos` - Meus Pedidos, com filtros, busca, expansao, timeline e paginacao por cursor.
- `/perfil/favoritos` - Favoritos, com remocao, desfazer e adicionar ao carrinho.
- `/perfil/enderecos` - Enderecos, com CRUD, ViaCEP, endereco principal e limite de 5.
- `/perfil/cupons` - Cupons, com validacao manual, lista por status e copiar codigo.
- `/perfil/seguranca` - Seguranca, com alterar senha, 2FA em breve e exclusao de conta.

## Navegacao

- `ProfileSidebar` agora aponta para `/perfil/*`.
- O item ativo e detectado por `usePathname()`.
- `Sair` usa `signOut({ callbackUrl: '/' })`.
- `/profile` redireciona para `/perfil`.
- `/configuracoes` redireciona para `/perfil/seguranca`.
- Middleware protege `/perfil/:path*`.

## APIs implementadas

- `GET /api/user/orders`
- `GET /api/user/favorites`
- `POST /api/user/favorites`
- `DELETE /api/user/favorites/:productId`
- `GET /api/user/addresses`
- `POST /api/user/addresses`
- `PUT /api/user/addresses/:id`
- `DELETE /api/user/addresses/:id`
- `PATCH /api/user/addresses/:id/default`
- `GET /api/user/coupons`
- `POST /api/user/change-password`
- `DELETE /api/user/account`

## Banco de dados

- Campo `User.deletedAt` adicionado como `deleted_at`.
- Migration aplicada: `20260524144000_add_user_deleted_at`.
- Prisma Client regenerado.
- Login por credenciais e Google bloqueia contas com `deletedAt`.

## Pendencias

- A pagina de cupons lista cupons globais porque ainda nao existe tabela de vinculo `UserCoupon`.
- "Rastrear" e "Ver codigo Pix" estao como UI preparada; nao ha endpoint de rastreio ou recuperacao de Pix por pedido ainda.
- "Comprar novamente" adiciona os itens ao carrinho local; sincronizacao com backend segue o fluxo existente do carrinho.
