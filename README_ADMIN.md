CAFÉ STORE — Admin Refactor

Arquitetura proposta

- Next.js App Router (app/)
- Server Components for data-loading and layout
- Client Components for interaction (charts, modals, dnd)
- Prisma + PostgreSQL como fonte da verdade
- shadcn/ui primitives for UI building blocks
- TailwindCSS tokens for design system

Pasta principal (resumo)
- prisma/                -> schema.prisma, migrations, seed
- src/lib/prisma.ts      -> Prisma client singleton
- src/app/admin/         -> Admin routes and pages (server components)
- src/components/admin/  -> Sidebar, shell, cards, charts, tables
- src/app/api/admin/     -> Server API endpoints for dashboard & CRUD

Passos para rodar localmente
1. Instalar dependências:
   npm install prisma @prisma/client lucide-react recharts shadcn-ui react-hook-form zod
2. Configurar .env com DATABASE_URL para Postgres local
3. Gerar Prisma Client e migrar:
   npx prisma migrate dev --name init
   npx prisma db seed (implementar seed script se desejar)
4. Rodar app:
   npm run dev

Próximos passos
- Implementar CRUD completo (products/orders/users) com Server Actions
- Adicionar testes de integração e unitários
- Criar scripts de seed e CI para migrations
- Polir tokens Tailwind e dark-mode

Se concorda, prossigo gerando as rotas CRUD e páginas de listagem com tabelas server-side paginadas.