/**
 * 절기(節氣) 절입 시각 데이터 테이블 생성 스크립트
 *
 * 사주 월주/연주 판정에 필요한 12절(節)의 절입 시각을
 * 천문 계산(astronomy-engine, 태양 황경 탐색)으로 구해
 * src/lib/saju/data/solar-terms.json 에 박제한다.
 *
 * - 개발 시점에만 실행: npm run gen:terms
 * - 런타임에는 생성된 JSON만 사용한다 (운영비 0원 원칙)
 * - 시각은 KST(UTC+9, 동경 135도 표준시) 기준, 분 단위 반올림
 */
import { SearchSunLongitude } from "astronomy-engine";
import * as fs from "node:fs";
import * as path from "node:path";

// 12절(월의 경계가 되는 절기만; 중기 제외) — 달력 순서
// n: 테이블 내 절기 인덱스, lon: 태양 황경(도), approx: 대략적인 양력 날짜
const TERMS = [
  { n: 0, name: "소한", lon: 285, month: 1, day: 6 },
  { n: 1, name: "입춘", lon: 315, month: 2, day: 4 },
  { n: 2, name: "경칩", lon: 345, month: 3, day: 6 },
  { n: 3, name: "청명", lon: 15, month: 4, day: 5 },
  { n: 4, name: "입하", lon: 45, month: 5, day: 6 },
  { n: 5, name: "망종", lon: 75, month: 6, day: 6 },
  { n: 6, name: "소서", lon: 105, month: 7, day: 7 },
  { n: 7, name: "입추", lon: 135, month: 8, day: 8 },
  { n: 8, name: "백로", lon: 165, month: 9, day: 8 },
  { n: 9, name: "한로", lon: 195, month: 10, day: 8 },
  { n: 10, name: "입동", lon: 225, month: 11, day: 7 },
  { n: 11, name: "대설", lon: 255, month: 12, day: 7 },
] as const;

// 1940년 1월초 출생자는 1939년 12월 대설이 기준 절기이므로 1939년부터 생성
const START_YEAR = 1939;
const END_YEAR = 2050;

function toKstString(epochMs: number): string {
  const d = new Date(epochMs + 9 * 3600 * 1000);
  const p = (v: number) => String(v).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}` +
    ` ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`
  );
}

interface TermRecord {
  y: number; // 양력 연도
  n: number; // 절기 인덱스 (0=소한 .. 11=대설)
  t: number; // 절입 시각 epoch ms (UTC, 분 단위 반올림)
  kst: string; // 사람이 읽을 수 있는 KST 표기 (디버깅용)
}

const records: TermRecord[] = [];

for (let y = START_YEAR; y <= END_YEAR; y++) {
  for (const term of TERMS) {
    // 대략적 날짜 6일 전부터 12일 범위 탐색
    const searchStart = new Date(Date.UTC(y, term.month - 1, term.day - 6));
    const found = SearchSunLongitude(term.lon, searchStart, 12);
    if (!found) {
      throw new Error(`절기 탐색 실패: ${y}년 ${term.name}`);
    }
    const t = Math.round(found.date.getTime() / 60000) * 60000;
    records.push({ y, n: term.n, t, kst: toKstString(t) });
  }
}

records.sort((a, b) => a.t - b.t);

// 시간 순서 무결성 검사
for (let i = 1; i < records.length; i++) {
  if (records[i].t <= records[i - 1].t) {
    throw new Error(`절기 순서 오류: ${records[i - 1].kst} → ${records[i].kst}`);
  }
}

const out = {
  description: "12절기 절입시각 테이블 (KST=UTC+9, astronomy-engine으로 생성)",
  termNames: TERMS.map((t) => t.name),
  startYear: START_YEAR,
  endYear: END_YEAR,
  terms: records,
};

const outPath = path.join(__dirname, "..", "src", "lib", "saju", "data", "solar-terms.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out), "utf8");

console.log(`생성 완료: ${records.length}개 절기 → ${outPath}`);
console.log("표본 확인:");
for (const probe of records.filter((r) => r.n === 1 && [1940, 1990, 2024, 2025, 2026].includes(r.y))) {
  console.log(`  ${probe.y}년 입춘: ${probe.kst} KST`);
}
