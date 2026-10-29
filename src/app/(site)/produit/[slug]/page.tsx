import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import { ProductContent } from '@/components/product/ProductContent';

/** Pages produits générées à partir du catalogue (construction, sans base de données) */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: 'Produit introuvable' };
  }
  return {
    title: product.name,
    description: product.description.fr,
    openGraph: {
      title: `${product.name} · Tsara Café`,
      description: product.description.fr,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProductBySlug(slug)) {
    notFound();
  }
  return <ProductContent slug={slug} />;
}
