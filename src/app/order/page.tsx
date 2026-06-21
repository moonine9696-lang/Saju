import Link from "next/link";
import { getProduct, PAYMENT } from "@/lib/products";
import OrderForm from "@/components/OrderForm";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.product) ? params.product[0] : params.product;
  const product = getProduct(raw);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
          상품을 먼저 선택해 주세요
        </h1>
        <p className="mt-3 text-sm text-paper-400">신청은 상품 선택 화면에서 이어집니다.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-night-900 hover:bg-gold-400"
        >
          상품 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-12">
      <header className="mb-6 text-center">
        <p className="mb-2 text-xs tracking-[0.25em] text-gold-400">신청서 작성</p>
        <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
          {product.name} 신청
        </h1>
      </header>
      <OrderForm product={product} payment={{ ...PAYMENT }} />
      <div className="mt-6 text-center">
        <Link href="/products" className="text-xs text-paper-500 underline underline-offset-2 hover:text-paper-400">
          다른 상품 보기
        </Link>
      </div>
    </div>
  );
}
