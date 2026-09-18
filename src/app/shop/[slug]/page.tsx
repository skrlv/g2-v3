import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductPage } from "@/components/product-page";
import { siteCopy } from "@/db/seed-data";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { absoluteUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Страница не найдена" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} — G2`,
      description: product.description,
      // data-URL фотографии из студии не отдаём в мета-разметку соцсетей
      images: product.images
        .filter((image) => image.startsWith("/") || image.startsWith("http"))
        .slice(0, 1),
    },
  };
}

export default async function ProductRoute({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 3);
  const images = product.images.filter((image) => !image.startsWith("data:")).map(absoluteUrl);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: product.name,
              description: product.description,
              sku: product.code || product.slug,
              image: images,
              brand: { "@type": "Brand", name: siteCopy.brand },
              category: product.categoryLabel,
              url: `${siteUrl}/shop/${product.slug}`,
              offers: {
                "@type": "Offer",
                url: `${siteUrl}/shop/${product.slug}`,
                priceCurrency: product.currency,
                price: (product.priceCents / 100).toFixed(2),
                // остатки по размерам не ведутся — товар в каталоге считается в наличии
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@id": `${siteUrl}/#org` },
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Каталог", item: `${siteUrl}/shop` },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: product.categoryLabel,
                  item: `${siteUrl}/shop?category=${encodeURIComponent(product.category)}`,
                },
                { "@type": "ListItem", position: 3, name: product.name },
              ],
            },
          ],
        }}
      />
      <ProductPage product={product} related={related} />
    </>
  );
}
