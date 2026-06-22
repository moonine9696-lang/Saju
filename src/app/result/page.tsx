import Link from "next/link";
import { calculateSaju, parseSajuParams } from "@/lib/saju";
import { getFullReading } from "@/lib/saju/interpretation";
import PillarTable from "@/components/PillarTable";
import ElementChart from "@/components/ElementChart";
import ReadingSections from "@/components/ReadingSections";
import FullReading from "@/components/FullReading";
import ClosingBlock from "@/components/ClosingBlock";
import ProductCarousel from "@/components/ProductCarousel";

const CARD = "rounded-2xl border border-night-600/70 bg-night-800/60 p-5 sm:p-6";

function InvalidNotice() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
        사주 정보를 불러오지 못했습니다
      </h1>
      <p className="mt-3 text-sm text-paper-400">
        입력값이 올바르지 않거나 주소가 변형된 것 같습니다. 처음 화면에서 다시 입력해 주세요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-night-900 hover:bg-gold-400"
      >
        처음으로 돌아가기
      </Link>
    </div>
  );
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const input = parseSajuParams(params);
  if (!input) return <InvalidNotice />;

  let result;
  try {
    result = calculateSaju(input);
  } catch {
    return <InvalidNotice />;
  }

  const { solarDate, time, correction } = result;
  const fullReading = getFullReading(result); // 6단계 상세 풀이 (작성된 일주만, 그 외 null)
  const dateLabel =
    `${solarDate.year}년 ${solarDate.month}월 ${solarDate.day}일` +
    (time ? ` ${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}` : " (시각 미상)");

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-10 space-y-6">
      <header className="text-center">
        <p className="text-xs tracking-[0.25em] text-gold-400 mb-2">나의 사주 명식</p>
        <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
          일간 {result.pillars.day.stem.name}({result.pillars.day.stem.hanja}) ·{" "}
          {result.pillars.day.stem.yinYang}
          {result.pillars.day.stem.element}
        </h1>
        <p className="mt-1.5 text-xs text-paper-500">
          {input.calendar === "lunar" ? "음력 " : "양력 "}
          {dateLabel} · {result.gender === "male" ? "남성" : "여성"} · {input.region}
        </p>
      </header>

      {/* 명식표 */}
      <section className={CARD}>
        <PillarTable result={result} />
        {correction && (
          <p className="mt-4 text-[11px] leading-relaxed text-paper-500">
            ※ {input.region} 출생 기준 진태양시로 보정해 계산했습니다.
            {correction.totalCorrectionMin !== 0 && (
              <>
                {" "}입력 시각에서 약 {Math.abs(Math.round(correction.totalCorrectionMin))}분{" "}
                {correction.totalCorrectionMin > 0 ? "더한" : "뺀"} 시각으로 시주를 정했습니다.
              </>
            )}
          </p>
        )}
      </section>

      {/* 오행 분포 */}
      <section className={CARD}>
        <h2 className="mb-4 font-(family-name:--font-serif-kr) text-base font-semibold text-paper-100">
          오행 분포
        </h2>
        <ElementChart result={result} />
      </section>

      {/* 간단한 사주풀이 — 6단계 상세 풀이가 있으면 그것으로, 없으면 기존 섹션으로 */}
      {fullReading ? (
        <FullReading view={fullReading} />
      ) : (
        <section className={CARD}>
          <h2 className="mb-4 font-(family-name:--font-serif-kr) text-base font-semibold text-paper-100">
            간단한 사주풀이
          </h2>
          <ReadingSections result={result} />
        </section>
      )}

      {/* 정식 풀이로 이어주는 마무리 (전환 카피 — 유지) */}
      <ClosingBlock />

      {/* 상품 캐러셀 (홈과 동일: 큰 카드·2.5초 자동넘김·화살표·스와이프·점) */}
      <ProductCarousel />

      <div className="text-center">
        <Link href="/products" className="text-xs text-paper-400 underline underline-offset-2 hover:text-paper-200">
          모든 상품 보기 →
        </Link>
      </div>

      <div className="text-center">
        <Link href="/" className="text-xs text-paper-500 underline underline-offset-2 hover:text-paper-400">
          다른 생년월일로 다시 보기
        </Link>
      </div>
    </div>
  );
}
