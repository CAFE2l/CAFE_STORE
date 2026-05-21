import { getProducts } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
  const perPage = Number.parseInt(searchParams.get('perPage') ?? '12', 10);

  try {
    const data = await getProducts({
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('q') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      page: Number.isNaN(page) ? 1 : page,
      perPage: Number.isNaN(perPage) ? 12 : perPage,
    });

    return Response.json({
      success: true,
      data,
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: 'Nao foi possivel carregar produtos.',
      },
      { status: 500 },
    );
  }
}
