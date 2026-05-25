import React from 'react'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = {
  title: 'Admin - CAFÉ STORE',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  )
}
