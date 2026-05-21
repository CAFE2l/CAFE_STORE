import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perfil | Cafe Store',
  description: 'Perfil e dados do cliente.',
};

export default function ProfilePage() {
  return <main className="container-page py-16">Perfil</main>;
}
