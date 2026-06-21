import type { FullReadingView } from "@/lib/saju/interpretation";

const CARD = "rounded-2xl border border-night-600/70 bg-night-800/60 p-5 sm:p-6";
const HEADING =
  "mb-3 font-(family-name:--font-serif-kr) text-base font-semibold text-gold-300";
const PARA = "text-sm leading-relaxed text-paper-200";

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((t, i) => (
        <p key={i} className={`${PARA}${i > 0 ? " mt-3" : ""}`}>
          {t}
        </p>
      ))}
    </>
  );
}

/** 결과 페이지의 무료 간단한 사주풀이 — 6단계 구조 (작성된 일주에만 표시) */
export default function FullReading({ view }: { view: FullReadingView }) {
  return (
    <div className="space-y-5">
      {/* 1. 물상 요약 */}
      <section className="rounded-2xl border border-gold-500/40 bg-gradient-to-b from-gold-500/12 to-night-800/40 p-6">
        <p className="text-center text-xs tracking-[0.2em] text-gold-400">물상 요약</p>
        <h2 className="mt-3 text-center font-(family-name:--font-serif-kr) text-xl font-bold leading-snug text-paper-100 sm:text-2xl">
          {view.mulsang.title}
        </h2>
        <p className={`${PARA} mt-4`}>{view.mulsang.body}</p>
      </section>

      {/* 2. 타고난 기질 */}
      <section className={CARD}>
        <h3 className={HEADING}>타고난 기질</h3>
        <Paragraphs items={view.gijil} />
      </section>

      {/* 3. 타고난 강점 */}
      <section className={CARD}>
        <h3 className={HEADING}>타고난 강점</h3>
        <Paragraphs items={view.gangjeom} />
      </section>

      {/* 4. 오행으로 본 당신 (엔진 elementCount) */}
      <section className={CARD}>
        <h3 className={HEADING}>오행으로 본 당신</h3>
        <p className={PARA}>
          사주 여덟 글자를 다섯 가지 기운(오행)으로 나눠 보면 이렇습니다.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 rounded-xl border border-night-600 bg-night-900/50 px-3 py-3.5">
          {view.elementCounts.map((e) => (
            <span key={e.hanja} className="text-sm whitespace-nowrap text-paper-300">
              {e.name}
              <span className="text-paper-500">({e.hanja})</span>{" "}
              <b className="text-gold-300">{e.count}</b>
            </span>
          ))}
        </div>
      </section>

      {/* 5. 조심할 점 */}
      <section className={CARD}>
        <h3 className={HEADING}>조심할 점</h3>
        <p className={PARA}>{view.josim.intro}</p>
        <div className="mt-3 space-y-3">
          {view.josim.items.map((t, i) => (
            <p key={i} className={PARA}>
              {t}
            </p>
          ))}
        </div>
      </section>

      {/* 6. 재물의 흐름 (엔진 자동 조립) */}
      <section className={CARD}>
        <h3 className={HEADING}>재물의 흐름</h3>
        <Paragraphs items={view.jaemulBody} />
      </section>
    </div>
  );
}
