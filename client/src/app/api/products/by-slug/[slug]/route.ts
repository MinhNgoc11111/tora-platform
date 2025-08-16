import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Không tìm thấy sản phẩm" },
      { status: 404 }
    );
  }

  return NextResponse.json(product, { status: 200 });
}
