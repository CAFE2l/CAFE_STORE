import { auth } from '@/lib/auth';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { HeaderClient } from '@/components/layout/HeaderClient';
import { prisma } from '@/lib/prisma';

export async function Header() {
  const session = await auth();
  const currentUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true },
      }).catch(() => null)
    : null;

  return (
    <>
      <AnnouncementBar />
      <HeaderClient user={currentUser ?? session?.user} />
    </>
  );
}
