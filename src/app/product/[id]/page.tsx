import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProduct } from "@/lib/products";
import { formatPrice } from "@/lib/format";

/**
 * 단품(및 그 외 상품) 판매 페이지 템플릿.
 * 상품 데이터(products.ts)만으로 렌더되므로 다른 단품도 그대로 찍어낸다.
 * 풀이 본문은 결제 후 발송물이므로 이 페이지에 넣지 않는다.
 */
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  return { title: product ? `${product.name} 풀이 — 사주의 길` : "상품 — 사주의 길" };
}

const CARD = "rounded-2xl border border-night-600/70 bg-night-800/60 p-5 sm:p-6";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-12 space-y-6">
      {/* 헤더 */}
      <header className="text-center">
        <p className="mb-2 text-xs tracking-[0.25em] text-gold-400">
          {product.persons === 2 ? "2인 풀이" : "단품 풀이"}
        </p>
        <h1 className="font-(family-name:--font-serif-kr) text-2xl font-bold text-paper-100">
          {product.name} 풀이
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-paper-400">
          {product.tagline ?? product.desc}
        </p>
      </header>

      {/* 가격 */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-5">
        <span className="font-(family-name:--font-serif-kr) text-base font-bold text-gold-300">
          {product.name} 풀이
        </span>
        <span className="text-2xl font-bold text-paper-100">{formatPrice(product.price)}</span>
      </div>

      {/* 이 풀이에서 받아보는 내용 (범위 설명, 풀이 본문 아님) */}
      {product.coverage && product.coverage.length > 0 && (
        <section className={CARD}>
          <h2 className="mb-3 font-(family-name:--font-serif-kr) text-base font-semibold text-paper-100">
            이 풀이에서 받아보시는 내용
          </h2>
          <ul className="space-y-2">
            {product.coverage.map((c, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-paper-200">
                <span className="text-gold-400">○</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          {product.persons === 2 && (
            <p className="mt-3 text-xs text-paper-500">· 두 분의 생년월일 정보가 모두 필요합니다.</p>
          )}
        </section>
      )}

      {/* 신청 안내 (운영 문구 — 기존 흐름과 동일) */}
      <section className={CARD}>
        <p className="text-sm leading-relaxed text-paper-200">
          결제는 계좌이체로 진행됩니다. 신청서를 작성하고 입금해 주시면,
          입금 확인 후 <span className="text-gold-300">24시간 이내</span>에 작성하신 메일 또는
          카카오톡으로 풀이를 보내 드립니다.
        </p>
        <p className="mt-1 text-xs text-paper-500">(주말·공휴일에는 발송이 다소 늦어질 수 있습니다.)</p>
      </section>

      {/* 신청 창구 */}
      <Link
        href={`/order?product=${product.id}`}
        className="block rounded-lg bg-gold-500 px-4 py-4 text-center text-base font-bold text-night-900 transition-colors hover:bg-gold-400"
      >
        {formatPrice(product.price)} · 신청서 작성하기
      </Link>

      <p className="text-center text-xs text-paper-500">
        신청 전{" "}
        <Link href="/refund" className="text-gold-300 underline underline-offset-2">
          환불 정책
        </Link>
        을 확인해 주세요.
      </p>

      <div className="text-center">
        <Link
          href="/products"
          className="text-xs text-paper-500 underline underline-offset-2 hover:text-paper-400"
        >
          다른 상품도 보기
        </Link>
      </div>
    </div>
  );
}
