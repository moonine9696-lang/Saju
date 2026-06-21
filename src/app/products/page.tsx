import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "상품 안내 — 사주의 길",
};

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/order?product=${product.id}`}
      className="block rounded-2xl border border-night-600/70 bg-night-800/60 p-5 transition-colors hover:border-gold-500/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-(family-name:--font-serif-kr) text-base font-bold text-paper-100">
              {product.name}
            </p>
            {product.persons === 2 && (
              <span className="rounded-full border border-night-500 px-2 py-0.5 text-[11px] text-paper-400">
                2인
              </span>
            )}
            {product.type === "premium" && (
              <span className="rounded-full border border-gold-500/60 bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-300">
                최상위
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-paper-400">{product.desc}</p>
        </div>
        <div className="shrink-0 text-right">
          {product.originalSum && (
            <p className="text-xs text-paper-500 line-through">
              따로 사면 {formatPrice(product.originalSum)}
            </p>
          )}
          <p className="text-lg font-bold text-gold-300">{formatPrice(product.price)}</p>
          <span className="text-xs text-gold-400">신청하기 →</span>
        </div>
      </div>
    </Link>
  );
}

function Section({ title, items }: { title: string; items: Product[] }) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-sm font-medium text-paper-500">{title}</h2>
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </section>
  );
}

export default function ProductsPage() {
  const singles = PRODUCTS.filter((p) => p.type === "single" && p.persons === 1);
  const gunghap = PRODUCTS.filter((p) => p.type === "single" && p.persons === 2);
  const packages = PRODUCTS.filter((p) => p.type === "package");
  const premium = PRODUCTS.filter((p) => p.type === "premium");

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-12 space-y-7">
      <header className="text-center">
        <p className="mb-2 text-xs tracking-[0.25em] text-gold-400">상품 안내</p>
        <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
          원하는 풀이를 골라 신청하세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-paper-400">
          상품을 고르고 신청서를 작성한 뒤 계좌이체로 입금해 주시면,
          <br className="hidden sm:block" />
          입금 확인 후 24시간 이내에 풀이를 보내 드립니다.
        </p>
      </header>

      <Section title="단품" items={singles} />
      <Section title="궁합 (2인)" items={gunghap} />
      <Section title="패키지" items={packages} />
      <Section title="종합" items={premium} />

      <p className="text-center text-xs text-paper-500">
        결제는 계좌이체로 진행됩니다. 신청 전{" "}
        <Link href="/refund" className="text-gold-300 underline underline-offset-2">
          환불 정책
        </Link>
        을 확인해 주세요.
      </p>
    </div>
  );
}
