"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Coins, Heart, Waves, Gem, Link2, Star, Briefcase, HeartHandshake, Crown,
  ChevronLeft, ChevronRight, type LucideIcon,
} from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { formatPrice } from "@/lib/format";

const ROTATE_MS = 2500;

/** 상품별 아이콘 + 배경 그라데이션 + 아이콘 색 (넘어갈 때 시각적으로 구분되게) */
const STYLE: Record<string, { grad: string; icon: LucideIcon; color: string }> = {
  jaemul: { grad: "from-[#3a2c10] to-[#0b1220]", icon: Coins, color: "text-amber-300" },
  yeonae: { grad: "from-[#3a1626] to-[#0b1220]", icon: Heart, color: "text-rose-300" },
  daeun: { grad: "from-[#102a3a] to-[#0b1220]", icon: Waves, color: "text-sky-300" },
  gyeolhon: { grad: "from-[#311a3a] to-[#0b1220]", icon: Gem, color: "text-fuchsia-300" },
  solo: { grad: "from-[#0f3030] to-[#0b1220]", icon: Link2, color: "text-teal-300" },
  maeryeok: { grad: "from-[#241048] to-[#0b1220]", icon: Star, color: "text-violet-300" },
  career: { grad: "from-[#133026] to-[#0b1220]", icon: Briefcase, color: "text-emerald-300" },
  gunghap: { grad: "from-[#3a1320] to-[#0b1220]", icon: HeartHandshake, color: "text-rose-300" },
  "yeonae-package": { grad: "from-[#341640] to-[#0b1220]", icon: HeartHandshake, color: "text-pink-300" },
  "jaemul-career-package": { grad: "from-[#1d3320] to-[#0b1220]", icon: Gem, color: "text-emerald-300" },
  premium: { grad: "from-[#3a2c10] via-[#2a1640] to-[#0b1220]", icon: Crown, color: "text-gold-300" },
};
const FALLBACK = { grad: "from-night-700 to-night-900", icon: Star, color: "text-gold-300" };

export default function ProductCarousel() {
  const items = PRODUCTS;
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // 렌더(트랜지션)용

  const startX = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const viewport = useRef<HTMLDivElement>(null);

  const go = (i: number) => setActive((i + n) % n);

  // 자동 넘김 (조작 중이면 멈춤)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((p) => (p + 1) % n), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, n]);

  // 터치 스와이프
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    setIsDragging(true);
    moved.current = false;
    startX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (Math.abs(dx) > 6) moved.current = true;
    setDragPx(dx);
  };
  const onTouchEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const w = viewport.current?.clientWidth ?? 1;
    const threshold = Math.min(80, w * 0.2);
    if (dragPx <= -threshold) go(active + 1);
    else if (dragPx >= threshold) go(active - 1);
    setDragPx(0);
    setPaused(false);
  };

  return (
    <section
      className="mt-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 컨트롤 줄: 화살표를 카드 위쪽 좌·우에 배치 (카드 내용과 겹치지 않음) */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(active - 1)}
          aria-label="이전 상품"
          className="rounded-full border border-night-600 bg-night-800/80 p-2 text-paper-100 transition-colors hover:border-gold-500/60 hover:text-gold-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-xs tracking-[0.2em] text-gold-400">상품 둘러보기</p>
        <button
          type="button"
          onClick={() => go(active + 1)}
          aria-label="다음 상품"
          className="rounded-full border border-night-600 bg-night-800/80 p-2 text-paper-100 transition-colors hover:border-gold-500/60 hover:text-gold-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div>
        <div
          ref={viewport}
          className="h-[42vh] min-h-72 overflow-hidden rounded-3xl border border-night-600/60"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(calc(${-active * 100}% + ${dragPx}px))`,
              transition: isDragging ? "none" : "transform 500ms ease-out",
            }}
          >
            {items.map((p) => {
              const s = STYLE[p.id] ?? FALLBACK;
              const Icon = s.icon;
              return (
                <Link
                  key={p.id}
                  href={`/order?product=${p.id}`}
                  aria-label={`${p.name} 신청하기`}
                  draggable={false}
                  onClick={(e) => {
                    if (moved.current) e.preventDefault(); // 스와이프였으면 이동 막기
                  }}
                  className={`relative flex h-full min-w-full flex-col justify-between overflow-hidden bg-gradient-to-br ${s.grad} p-7`}
                >
                  {/* 큰 아이콘 배경 (여백 채우기) */}
                  <Icon
                    className={`pointer-events-none absolute -bottom-6 -right-6 h-52 w-52 opacity-15 ${s.color}`}
                    strokeWidth={1.1}
                  />

                  <div className="relative flex items-center gap-2">
                    <span className={`rounded-2xl bg-night-900/40 p-3 ${s.color}`}>
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                    </span>
                    {p.persons === 2 && (
                      <span className="rounded-full border border-paper-500/40 px-2 py-0.5 text-[11px] text-paper-300">2인</span>
                    )}
                    {p.type === "premium" && (
                      <span className="rounded-full border border-gold-400/50 bg-gold-500/10 px-2 py-0.5 text-[11px] text-gold-200">최상위</span>
                    )}
                  </div>

                  <div className="relative">
                    <p className="font-(family-name:--font-serif-kr) text-3xl font-bold text-paper-100">{p.name}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-paper-200/90">
                      {p.tagline ?? p.desc}
                    </p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        {p.originalSum && (
                          <span className="mr-2 text-sm text-paper-400 line-through">{formatPrice(p.originalSum)}</span>
                        )}
                        <span className="text-2xl font-bold text-paper-100">{formatPrice(p.price)}</span>
                      </div>
                      <span className="text-sm font-medium text-gold-300">신청하기 →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 점 인디케이터 (눌러서 이동) */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {items.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go(idx)}
            aria-label={`${p.name}로 이동`}
            className={`h-1.5 rounded-full transition-all ${
              idx === active ? "w-5 bg-gold-400" : "w-1.5 bg-night-500 hover:bg-night-500/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
