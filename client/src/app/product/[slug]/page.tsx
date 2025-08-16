import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

type PageProps = { params: { slug: string } };

export const runtime = "nodejs";
export const revalidate = 60; // hoặc: export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: PageProps) {
  const s = params.slug;

  // Nếu user gõ /product/123 (id số) -> tìm theo id và redirect sang slug
  if (/^\d+$/.test(s)) {
    const id = Number(s);
    const byId = await prisma.product.findUnique({ where: { id } });
    if (!byId?.slug) notFound();
    redirect(`/product/${byId.slug}`);
  }

  // Bình thường: lấy theo slug
  const product = await prisma.product.findUnique({
    where: { slug: s },
  });
  if (!product) notFound();

  const img = (product as any).imageUrl ?? (product as any).image ?? "/placeholder.png";

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-gray-50">
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-xl font-bold">
            {product.price.toLocaleString()}₫
          </p>

          {product.description && (
            <div className="prose mt-4 max-w-none">
              <p>{product.description}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button className="px-5 py-3 rounded-2xl bg-black text-white">
              Thêm vào giỏ
            </button>
            <button className="px-5 py-3 rounded-2xl border">
              Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
