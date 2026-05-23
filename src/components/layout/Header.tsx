import { auth } from '@/lib/auth';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { HeaderClient } from '@/components/layout/HeaderClient';

export async function Header() {
  const session = await auth();

  return (
    <>
      <AnnouncementBar />
      <HeaderClient user={session?.user} />
    </>
  );
}
