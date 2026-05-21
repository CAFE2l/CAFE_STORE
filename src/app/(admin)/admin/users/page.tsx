import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usuarios | Cafe Store',
  description: 'Gestao de usuarios da Cafe Store.',
};

export default function AdminUsersPage() {
  return <main className="container-page py-16">Usuarios</main>;
}
