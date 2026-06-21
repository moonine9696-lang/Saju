import Link from "next/link";
import { calculateSaju, parseSajuParams } from "@/lib/saju";
import RegisterForm from "@/components/RegisterForm";

function InvalidNotice() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
        먼저 사주를 확인해 주세요
      </h1>
      <p className="mt-3 text-sm text-paper-400">
        매칭 사전등록은 사주 결과 화면에서 이어집니다. 생년월일시를 먼저 입력해 주세요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-bold text-night-900 hover:bg-gold-400"
      >
        사주 입력하러 가기
      </Link>
    </div>
  );
}

export default async function RegisterPage({
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

  // 서버 액션으로 다시 넘길 사주 입력 쿼리 (재계산용)
  const sajuQuery = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      v === undefined ? [] : [[k, Array.isArray(v) ? v[0] : v]]
    ) as [string, string][]
  ).toString();

  const day = result.pillars.day;

  return (
    <div className="mx-auto max-w-xl px-4 pt-8 pb-12">
      <header className="text-center mb-6">
        <p className="text-xs tracking-[0.25em] text-gold-400 mb-2">무료 사전등록</p>
        <h1 className="font-(family-name:--font-serif-kr) text-xl font-semibold text-paper-100">
          내 사주와 잘 맞는 인연 찾기
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-paper-400">
          지금은 결제 없이 사전등록만 받고 있습니다. 잘 맞는 상대가 나타나면
          알려주신 전화번호로 안내드립니다.
        </p>
      </header>

      {/* 계산된 사주 요약 (자동 연동 확인용) */}
      <div className="mb-5 rounded-xl border border-night-600/70 bg-night-800/60 p-4">
        <p className="text-xs text-paper-500 mb-1">아래 사주 정보가 함께 등록됩니다</p>
        <p className="text-sm text-paper-200">
          <span className="text-gold-300">
            {result.pillars.year.ganji} {result.pillars.month.ganji} {day.ganji}
            {result.pillars.hour ? ` ${result.pillars.hour.ganji}` : ""}
          </span>{" "}
          · 일간 {day.stem.name}({day.stem.hanja})
        </p>
      </div>

      <RegisterForm
        sajuQuery={sajuQuery}
        defaultGender={result.gender}
        defaultBirthYear={result.solarDate.year}
      />
    </div>
  );
}
