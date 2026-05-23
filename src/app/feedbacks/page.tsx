import type { Metadata } from 'next';
import { FeedbacksClient } from '@/components/feedbacks/FeedbacksClient';

export const metadata: Metadata = {
  title: 'Feedbacks | CAFÉ STORE',
  description: 'Depoimentos verificados de clientes e projetos entregues pela CAFÉ STORE.',
};

export const dynamic = 'force-dynamic';

export default function FeedbacksPage() {
  return <FeedbacksClient />;
}
