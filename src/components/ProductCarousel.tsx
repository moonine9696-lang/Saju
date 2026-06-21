"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { formatPrice } from "@/lib/format";

const ROTATE_MS = 4000;

/**
 * 메인 화면 상품 캐러셀. 단품·궁합·패키지·종합이 자동으로 부드럽게(페이드) 전환되고,
 * 각 항목을 누르면 해당 /product/[id] 판매 페이지로 이동.
 * 과한 애니메이션·실시간 카운터 없음.
 */
export default function ProductCarousel() {
  const items = PRODUCTS;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <section
      className="mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="mb-3 text-center text-xs tracking-[0.2em] text-gold-400">상품 둘러보기</p>

      {/* 슬라이드 (겹쳐두고 opacity로 부드럽게 교차) */}
      <div className="relative h-28">
        {items.map((p, idx) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            aria-hidden={idx !== active}
            tabIndex={idx === active ? 0 : -1}
            className={`absolute inset-0 flex items-center justify-between gap-3 rounded-2xl border border-night-600/70 bg-night-800/60 p-5 transition-opacity duration-700 ease-in-out hover:border-gold-500/60 ${
              idx === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="min-w-0">
              <p className="font-(family-name:--font-serif-kr) text-base font-bold text-paper-100">
                {p.name}
                {p.persons === 2 && (
                  <span className="ml-2 align-middle rounded-full border border-night-500 px-2 py-0.5 text-[11px] font-normal text-paper-400">
                    2인
                  </span>
                )}
              </p>
              <p className="mt-1 truncate text-xs text-paper-400">{p.tagline ?? p.desc}</p>
            </div>
            <div className="shrink-0 text-right">
              {p.originalSum && (
                <p className="text-[11px] text-paper-500 line-through">{formatPrice(p.originalSum)}</p>
              )}
              <p className="text-lg font-bold text-gold-300">{formatPrice(p.price)}</p>
              <span className="text-xs text-gold-400">보러 가기 →</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 인디케이터 */}
      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(idx)}
            aria-label={`${p.name} 보기`}
            className={`h-1.5 rounded-full transition-all ${
              idx === active ? "w-5 bg-gold-400" : "w-1.5 bg-night-500 hover:bg-night-500/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
