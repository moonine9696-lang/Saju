import Link from "next/link";
import { getProduct, PRODUCTS, PAYMENT } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import OrderForm from "@/components/OrderForm";

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.product) ? params.product[0] : params.product;
  const product = getProduct(raw);

  // 상품을 쿼리로 못 받았을 때 — 이 화면에서 바로 상품을 고를 수 있게
  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-8 pb-12">
        <header className="mb-6 text-center">
          <p className="mb-2 text-xs tracking-[0.25em] text-gold-400">신청서 작성</p>
          <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
            먼저 상품을 골라 주세요
          </h1>
          <p className="mt-2 text-sm text-paper-400">상품을 선택하면 바로 신청서가 열립니다.</p>
        </header>
        <div className="space-y-2">
          {PRODUCTS.map((p) => (
            <Link
              key={p.id}
              href={`/order?product=${p.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-night-600/70 bg-night-800/60 p-4 transition-colors hover:border-gold-500/60"
            >
              <div>
                <span className="font-(family-name:--font-serif-kr) text-base font-bold text-paper-100">
                  {p.name}
                </span>
                {p.persons === 2 && (
                  <span className="ml-2 align-middle rounded-full border border-night-500 px-2 py-0.5 text-[11px] text-paper-400">2인</span>
                )}
                <span className="mt-0.5 block text-xs text-paper-400">{p.tagline ?? p.desc}</span>
              </div>
              <div className="shrink-0 text-right">
                {p.originalSum && (
                  <span className="block text-[11px] text-paper-500 line-through">{formatPrice(p.originalSum)}</span>
                )}
                <span className="text-base font-bold text-gold-300">{formatPrice(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // 상품이 선택된 상태: 상단 요약(이름·가격·coverage) + 바로 이어지는 신청서 (한 페이지)
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
        <Link href="/order" className="text-xs text-paper-500 underline underline-offset-2 hover:text-paper-400">
          다른 상품 선택
        </Link>
      </div>
    </div>
  );
}
