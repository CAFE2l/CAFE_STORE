import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | Cafe Store',
  description: 'Dashboard administrativo da Cafe Store.',
};

export default function AdminDashboardPage() {
  return <main className="container-page py-16">Dashboard admin</main>;
}
