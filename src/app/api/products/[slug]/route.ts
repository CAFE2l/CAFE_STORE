import { getProductBySlug } from '@/lib/products';

type ProductRouteProps = {
  params: {
    slug: string;
  };
};

export async function GET(_request: Request, { params }: ProductRouteProps) {
  try {
    const product = await getProductBySlug(params.slug);

    if (!product) {
      return Response.json(
        {
          success: false,
          error: 'Produto nao encontrado.',
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: product,
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: 'Nao foi possivel carregar o produto.',
      },
      { status: 500 },
    );
  }
}
