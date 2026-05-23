# Relatório de Estilização Visual

## Dependências instaladas
- `tailwindcss-animate` — animações prontas (fadeIn, fadeUp, slideIn, scaleIn, etc.)
- `@tailwindcss/forms` — reset e estilização de formulários

---

## Arquivos alterados

### 1. `tailwind.config.ts`
**Novas cores**: `glass` (white, dark, border)
**Novas shadows**: `led-brand`, `led-white`, `card-hover` (aprimorado)
**Novos keyframes**:
- `pulseLed` — LED pulsante para botões/badges
- `slideInLeft` — entrada da sidebar de perfil
- `glowBrand` — brilho pulsante no texto do logo
- `shimmer` — skeleton loader (agora usa backgroundPosition)
**Novas animações**: `slide-in-left`, `scale-in`, `pulse-led`, `spin-slow`, `glow-brand`
**Novos easing**: `smooth` (cubic-bezier(0.16,1,0.3,1))
**Plugins**: `@tailwindcss/forms`, `tailwindcss-animate`

### 2. `src/app/globals.css`
**body**: gradiente radial `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.08), transparent)`
**Novos @layer components**:
- `.glass-card` — bg preto 35%, backdrop-blur-md, borda sutil, shadow-glass
- `.glass-card-hover` — glass-card + hover: translateY(-4px) scale(1.01) + card-hover shadow
- `.glass-nav` — bg preto 60%, backdrop-blur-xl, borda inferior sutil
- `.glass-input` — bg branco 4%, backdrop-blur-sm, focus com glow brand
- `.glass-button` — relative overflow-hidden, spring easing, active scale
- `.btn-primary::before` — overlay branco 10% no hover
- `.custom-cursor` + `.custom-cursor-dot` — cursor personalizado (desktop only)
**`:root`**: `color-scheme: dark`
**prefers-reduced-motion**: todas animações desabilitadas
**Scrollbar**: estilizada com laranja

### 3. `src/components/layout/Header.tsx`
Simplificado para server component que chama `auth()` e renderiza `AnnouncementBar` + `HeaderClient`

### 4. `src/components/layout/HeaderClient.tsx` **NOVO**
- Classe `glass-nav` no header
- `scrolled` state via scroll listener (adds `bg-black/80 shadow-glass` quando scrollY > 10)
- Logo com `animate-glow-brand` e `text-gradient-fire`
- Logo container com `shadow-led-brand`
- Nav links com underline animado via `after:` pseudo-elemento

### 5. `src/components/layout/CartCount.tsx`
- Badge do carrinho com `animate-pulse-led` quando há itens
- `animate-bounce-badge` quando vazio

### 6. `src/components/layout/AnnouncementBar.tsx`
- `Flame` ícone com `animate-pulse-led`
- Gradiente bg usando `brand/10` até `brand/20`

### 7. `src/components/layout/AuthMenu.tsx`
- Botão "Entrar" com `glass-button`, `shadow-led-brand`, `hover:shadow` aprimorado
- Avatar/logado com `bg-white/[0.04] backdrop-blur-sm`

### 8. `src/components/store/ProductCard.tsx`
- `glass-card-hover` no card principal
- Featured products: glow border via `bg-gradient-to-br from-brand/60`
- Imagem: `group-hover:scale-110` (aumentado de 105 pra 110)
- Preço: `group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]` LED no hover
- Botão add-to-cart: `glass-button` + `shadow-led-brand/30` + `hover:shadow`
- Badges usam `brand` em vez de hex hardcoded
- Stagger animation via `index * 80ms`

### 9. `src/components/account/ProfileSidebar.tsx`
- `animate-slide-in-left` no aside

### 10. `src/components/account/ProfileDashboardClient.tsx`
- Profile card → `glass-card`
- Summary cards → `glass-card` + cada item com `bg-white/[0.04] border-glass-border hover:border-brand/30`
- Números nos cards: `group-hover:text-brand`
- Level badge: `border-brand/30 bg-brand/15` + `animate-pulse-led` + `shadow-[0_0_10px_rgba(249,115,22,0.2)]`
- Recent orders → `glass-card`
- Empty state → `glass-card`
- Addresses → `glass-card`
- Security → `glass-card`
- Notifications → `glass-card`
- Save button → `shadow-led-brand hover:shadow-[0_0_20px_4px_#F9731670,0_0_50px_8px_#F9731630]`

### 11. `src/app/(store)/layout.tsx`
- Page transition: `animate-fade-up` no container de conteúdo

### 12. `src/lib/useScrollReveal.ts` **NOVO**
- Hook `useScrollReveal<T>` com IntersectionObserver
- Configurável: threshold, rootMargin, animationClass
- Aplica `animate-fade-up` quando elemento entra na viewport

### 13. `src/components/ui/CustomCursor.tsx` **NOVO**
- Cursor personalizado (desktop apenas, `pointer: fine`)
- Círculo externo `bg-brand/80 mix-blend-difference`
- Ponto interno branco
- Ativa/desativa classe `custom-cursor-enabled` no body

---

## Classes utilitárias criadas

| Classe | Descrição |
|--------|-----------|
| `glass-card` | Card vidro fosco padrão |
| `glass-card-hover` | Glass card com hover elevado |
| `glass-nav` | Navbar vidro fosco |
| `glass-input` | Input vidro fosco |
| `glass-button` | Botão com overflow hidden e spring |
| `shadow-led-brand` | LED glow laranja |
| `shadow-led-white` | LED glow branco |
| `shadow-card-hover` | Sombra elevada de hover |
| `animate-pulse-led` | LED pulsante |
| `animate-glow-brand` | Glow de texto pulsante |
| `animate-slide-in-left` | Slide entrada esquerda |
| `animate-scale-in` | Scale entrada com spring |
| `ease-smooth` | Cubic-bezier suave |

---

## Boas práticas aplicadas

- **prefers-reduced-motion**: todas animações zeradas
- **focus-visible**: outline vermelho em todos elementos interativos
- **Scrollbar**: personalizada com laranja
- **Selection**: destaque laranja
- **Cores**: sem valores hardcoded nos componentes (usam tokens do config)
- **Transições**: mínimo 200ms, máximo 500ms, easings spring/smooth
- **Glass effect**: backdrop-blur-md em cards, backdrop-blur-xl em nav/modais
- **Hover**: em todos elementos interativos (botões, cards, links, inputs)
